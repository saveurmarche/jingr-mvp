import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { artisanDefaults } from "@/lib/types";

/**
 * Le jeton de revue sert de clé d'accès (même modèle que /review/[token]).
 * create : transforme le devis validé en facture (idempotent).
 * paid   : marque la facture comme payée.
 */
const schema = z.object({
  token: z.string().min(8),
  action: z.enum(["create", "paid"]).default("create"),
});

export async function POST(req: NextRequest) {
  try {
    const { token, action } = schema.parse(await req.json());
    const data = await db.getByReviewToken(token);
    if (!data) {
      return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 404 });
    }

    let invoice = await db.getInvoiceByDraft(data.draft.id);
    if (action === "create") {
      const prefs = data.artisan ? artisanDefaults(data.artisan) : null;
      invoice = await db.createInvoiceFromDraft(data.draft.id, prefs?.payment_days ?? 30);
      await db.addEvent({
        quote_draft_id: data.draft.id,
        event_type: "invoiced",
        payload: { invoice_id: invoice.id, number: invoice.number },
      });
    } else {
      if (!invoice) throw new Error("Aucune facture pour ce devis");
      invoice = await db.markInvoicePaid(invoice.id);
    }

    return NextResponse.json({ ok: true, invoice, pdf_url: `/api/facture/${token}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
