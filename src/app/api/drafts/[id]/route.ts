import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { recalcTotals } from "@/lib/draft-pipeline";
import type { QuoteLineItem } from "@/lib/types";

const lineSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unit_price_ht: z.number().nonnegative(),
  tva_rate: z.number().nonnegative(),
});

const patchSchema = z.object({
  title: z.string().optional(),
  intro: z.string().optional(),
  notes: z.string().optional(),
  line_items: z.array(lineSchema).optional(),
  action: z.enum(["save", "validate"]).default("save"),
});

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const draft = await db.getDraft(id);
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
    const draft = await db.getDraft(id);
    if (!draft) {
      return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
    }

    const body = patchSchema.parse(await req.json());
    const line_items = (body.line_items ?? draft.line_items) as QuoteLineItem[];
    const sums = recalcTotals(line_items);

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
    });

    if (body.action === "validate") {
      await db.updateJobStatus(draft.job_id, "validated");
      await db.addEvent({
        quote_draft_id: draft.id,
        event_type: "validated",
        payload: { note: "Validé par l'artisan — prêt à être envoyé manuellement" },
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
