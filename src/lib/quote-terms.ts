import { artisanDefaults, type Artisan, type QuoteDraft } from "./types";

/**
 * Conditions du devis : durée de validité et acompte à la signature.
 * Calculées au même endroit pour le PDF, la page client et l'acceptation.
 */
export function quoteTerms(
  draft: Pick<QuoteDraft, "created_at" | "validated_at" | "total_ht" | "total_ttc">,
  artisan: Artisan | null | undefined,
  now: Date = new Date()
) {
  const prefs = artisan ? artisanDefaults(artisan) : null;
  const validityDays = prefs?.validity_days ?? 30;
  const issued = new Date(draft.validated_at || draft.created_at);
  const validUntil = new Date(issued.getTime() + validityDays * 86_400_000);
  const acomptePct = prefs?.acompte_pct ?? 0;
  const base = prefs?.tva_franchise ? draft.total_ht : draft.total_ttc;
  return {
    validityDays,
    validUntil,
    expired: now.getTime() > validUntil.getTime(),
    acomptePct,
    acompteAmount: Math.round(base * acomptePct) / 100,
  };
}
