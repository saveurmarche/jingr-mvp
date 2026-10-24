import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { recalcTotals } from "@/lib/draft-pipeline";
import { hasUnconfirmedEstimates, mergeIntoPriceList } from "@/lib/price-list";
import { countLineEdits } from "@/lib/pilot-metrics";
import type { QuoteLineItem } from "@/lib/types";

const lineSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unit_price_ht: z.number().nonnegative(),
  tva_rate: z.number().nonnegative(),
  price_source: z.enum(["catalogue", "estimate", "manual"]).optional(),
});

const patchSchema = z.object({
  token: z.string().min(8),
  title: z.string().optional(),
  intro: z.string().optional(),
  notes: z.string().optional(),
  line_items: z.array(lineSchema).optional(),
  action: z.enum(["save", "validate"]).default("save"),
});

/** Le brouillon n'est accessible qu'avec le jeton de revue de l'artisan qui lui correspond. */
async function draftForToken(id: string, token: string | null | undefined) {
  if (!token) return null;
  const data = await db.getByReviewToken(token);
  return data && data.draft.id === id ? data.draft : null;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const draft = await draftForToken(id, req.nextUrl.searchParams.get("token"));
  if (!draft) {
    return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, draft });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json());
    const draft = await draftForToken(id, body.token);
    if (!draft) {
      return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
    }

    const line_items = (body.line_items ?? draft.line_items) as QuoteLineItem[];
    const sums = recalcTotals(line_items);

    // Garde-fou : un prix proposé par l'IA ne part jamais sans confirmation de l'artisan.
    if (body.action === "validate" && hasUnconfirmedEstimates(line_items)) {
      return NextResponse.json(
        { ok: false, error: "Confirmez ou corrigez les prix estimés (en orange) avant de valider." },
        { status: 400 }
      );
    }

    const updated = await db.saveDraft({
      ...draft,
      title: body.title ?? draft.title,
      intro: body.intro ?? draft.intro,
      notes: body.notes ?? draft.notes,
      line_items,
      total_ht: sums.total_ht,
      total_tva: sums.total_tva,
      total_ttc: sums.total_ttc,
      status: body.action === "validate" ? "validated" : draft.status,
      validated_at:
        body.action === "validate"
          ? new Date().toISOString()
          : draft.validated_at,
      edit_count:
        body.action === "validate"
          ? countLineEdits(draft.generated_line_items, line_items)
          : draft.edit_count,
    });

    if (body.action === "validate") {
      await db.updateJobStatus(draft.job_id, "validated");
      // Apprentissage : les prix validés alimentent le catalogue de l'artisan pour les prochains devis.
      const artisan = (await db.getJob(draft.job_id))?.artisan;
      if (artisan) {
        await db.updateArtisan(artisan.id, { price_list: mergeIntoPriceList(artisan.price_list, line_items) });
      }
      await db.addEvent({
        quote_draft_id: draft.id,
        event_type: "validated",
        payload: {
          note: "Validé par l'artisan — prêt à être envoyé manuellement",
          edit_count: updated.edit_count ?? null,
        },
      });
    } else {
      await db.addEvent({
        quote_draft_id: draft.id,
        event_type: "saved",
      });
    }

    return NextResponse.json({
      ok: true,
      draft: updated,
      message:
        body.action === "validate"
          ? "Devis validé. Aucun envoi automatique au client."
          : "Brouillon enregistré.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
