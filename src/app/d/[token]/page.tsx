import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { artisanDefaults } from "@/lib/types";
import { AcceptQuote } from "@/components/AcceptQuote";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

/** Page vue par le client final : lecture seule, aucune donnée d'édition. */
export default async function ClientQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await db.getByClientToken(token);
  if (!data) notFound();
  const { draft, job, artisan } = data;
  const prefs = artisan ? artisanDefaults(artisan) : null;
  const company = artisan?.company_name || artisan?.name || "Votre artisan";
  const franchise = prefs?.tva_franchise ?? false;

  return (
    <div className="space-y-6">
      <div className="card space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#7b5ea7]">Devis</p>
        <h1 className="text-2xl font-bold text-stone-900">{draft.title}</h1>
        <p className="text-stone-600">
          De <strong>{company}</strong>
          {prefs?.siret ? ` · SIRET ${prefs.siret}` : ""}
          {artisan?.phone ? ` · ${artisan.phone}` : ""}
        </p>
        <p className="text-stone-600">
          Pour {job.client_name}
          {job.client_address ? `, ${job.client_address}` : ""} · émis le{" "}
          {new Date(draft.validated_at || draft.created_at).toLocaleDateString("fr-FR")} · valable 30 jours
        </p>
      </div>

      {draft.intro ? <div className="card whitespace-pre-wrap text-stone-700">{draft.intro}</div> : null}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-stone-500">
              <th className="py-1 pr-2">Désignation</th>
              <th className="py-1 pr-2 text-right">Qté</th>
              <th className="py-1 pr-2 text-right">P.U. HT</th>
              <th className="py-1 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {draft.line_items.map((li) => (
              <tr key={li.id} className="border-t border-[#ebe4da]">
                <td className="py-1.5 pr-2">{li.label}</td>
                <td className="py-1.5 pr-2 text-right">{li.quantity} {li.unit}</td>
                <td className="py-1.5 pr-2 text-right">{eur(li.unit_price_ht)}</td>
                <td className="py-1.5 text-right">{eur(li.quantity * li.unit_price_ht)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 text-right text-sm">
          <div>Total HT : <strong>{eur(draft.total_ht)}</strong></div>
          {franchise ? (
            <div className="text-xs text-stone-500">TVA non applicable, art. 293 B du CGI</div>
          ) : (
            <div>TVA : <strong>{eur(draft.total_tva)}</strong></div>
          )}
          <div className="text-base text-[#7b5ea7]">
            {franchise ? "Net à payer" : "Total TTC"} : <strong>{eur(franchise ? draft.total_ht : draft.total_ttc)}</strong>
          </div>
        </div>
      </div>

      <AcceptQuote
        token={token}
        acceptedAt={draft.accepted_at ?? null}
        acceptedBy={draft.accepted_by ?? null}
        company={company}
      />

      <p className="text-center text-sm">
        <a className="text-[#7b5ea7] underline" href={`/api/d/${token}/pdf`}>Télécharger le devis en PDF</a>
      </p>
    </div>
  );
}
