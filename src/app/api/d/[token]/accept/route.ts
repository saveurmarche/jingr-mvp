import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/intake";
import { sendText } from "@/lib/whatsapp";
import { invoicesInJingr } from "@/lib/billing-software";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  consent: z.literal(true),
});

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const { name } = schema.parse(await req.json());
    const result = await db.acceptQuote(token, name);
    if (!result) return NextResponse.json({ ok: false, error: "Devis introuvable" }, { status: 404 });

    if (!result.already) {
      const data = await db.getByClientToken(token);
      const review = data ? await db.createReviewToken({ job_id: data.job.id, quote_draft_id: data.draft.id }) : null;
      if (data?.artisan?.phone) {
        await sendText(
          data.artisan.phone,
          [
            `🎉 ${name} a accepté votre devis « ${data.draft.title} » (${eur(data.draft.total_ttc)} TTC).`,
            review
              ? invoicesInJingr(data.artisan.billing_software)
                ? `Chantier terminé ? Facturez en un clic : ${appUrl()}/review/${review.token}`
                : `Lignes à importer dans ${data.artisan.billing_software} (CSV) : ${appUrl()}/api/export/${review.token}`
              : "",
          ]
            .filter(Boolean)
            .join("\n")
        );
      }
    }
    return NextResponse.json({ ok: true, accepted_at: result.draft.accepted_at, already: result.already });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
