import { NextRequest, NextResponse } from "next/server";
import { db, normalizePhone } from "@/lib/db";
import { appUrl } from "@/lib/intake";
import { sendText, whatsappConfigured } from "@/lib/whatsapp";

/**
 * Retrouver ses devis.
 * Les liens de revue donnent un accès en écriture : on ne les affiche jamais à quelqu'un
 * qui tape un numéro. Quand WhatsApp est branché, la liste part sur le WhatsApp du numéro
 * lui-même (seul son propriétaire la reçoit). Sans WhatsApp, on ne l'affiche qu'en dev local.
 */
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")?.trim();
  if (!phone || phone.replace(/\s+/g, "").length < 6) {
    return NextResponse.json(
      { ok: false, error: "Indiquez un numéro de téléphone artisan" },
      { status: 400 }
    );
  }

  const jobs = await db.listJobsByPhone(phone);

  if (whatsappConfigured()) {
    const withLinks = jobs.filter((j) => j.review_token).slice(0, 10);
    if (withLinks.length) {
      const lines = withLinks.map(
        (j) => `• ${j.draft?.title ?? j.client_name} — ${appUrl()}/review/${j.review_token}`
      );
      await sendText(
        normalizePhone(phone),
        [`Vos ${withLinks.length} derniers devis jingr :`, ...lines].join("\n")
      );
    }
    // Réponse identique que le numéro existe ou non : on ne révèle pas qui est client.
    return NextResponse.json({
      ok: true,
      sent: true,
      message:
        "Si ce numéro a des devis jingr, la liste vient de lui être envoyée sur WhatsApp.",
    });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "Service indisponible pour le moment. Retrouvez vos liens dans WhatsApp." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    phone,
    count: jobs.length,
    jobs: jobs.map((j) => ({
      id: j.id,
      client_name: j.client_name,
      client_address: j.client_address,
      description: j.description,
      status: j.status,
      source: j.source,
      created_at: j.created_at,
      updated_at: j.updated_at,
      draft: j.draft
        ? {
            id: j.draft.id,
            title: j.draft.title,
            status: j.draft.status,
            total_ht: j.draft.total_ht,
            total_ttc: j.draft.total_ttc,
          }
        : null,
      review_token: j.review_token ?? null,
      review_url: j.review_token ? `/review/${j.review_token}` : null,
    })),
  });
}
