import type { Artisan, Job, QuoteDraft, QuoteLineItem } from "./types";

/** Lignes ajoutées, supprimées ou modifiées (libellé, quantité, unité, prix, TVA) entre la proposition et la version validée. */
export function countLineEdits(original: QuoteLineItem[] | undefined, final: QuoteLineItem[]): number {
  if (!original) return 0;
  const before = new Map(original.map((l) => [l.id, l]));
  let edits = 0;
  for (const l of final) {
    const o = before.get(l.id);
    if (!o) {
      edits++;
      continue;
    }
    before.delete(l.id);
    if (
      o.label.trim() !== l.label.trim() ||
      o.quantity !== l.quantity ||
      o.unit !== l.unit ||
      o.unit_price_ht !== l.unit_price_ht ||
      o.tva_rate !== l.tva_rate
    ) {
      edits++;
    }
  }
  return edits + before.size;
}

export type PilotMetrics = {
  window_days: number;
  artisans_total: number;
  artisans_active: number;
  drafts: number;
  validated: number;
  validated_few_edits_pct: number | null;
  accepted_by_client: number;
  per_artisan: { name: string; phone: string; drafts: number; validated: number; avg_edits: number | null; accepted: number }[];
};

/** Indicateurs des critères de décision du pilote, sur une fenêtre glissante (7 jours par défaut). */
export function pilotMetrics(
  data: { artisans: Artisan[]; jobs: Job[]; quote_drafts: QuoteDraft[] },
  now = new Date(),
  windowDays = 7
): PilotMetrics {
  const since = now.getTime() - windowDays * 86_400_000;
  const jobArtisan = new Map(data.jobs.map((j) => [j.id, j.artisan_id]));
  const recent = data.quote_drafts.filter((d) => new Date(d.created_at).getTime() >= since);
  const validated = recent.filter((d) => d.status === "validated" || d.validated_at);
  const withEdits = validated.filter((d) => typeof d.edit_count === "number");
  const few = withEdits.filter((d) => (d.edit_count ?? 0) <= 2).length;

  const per_artisan = data.artisans
    .map((a) => {
      const mine = recent.filter((d) => jobArtisan.get(d.job_id) === a.id);
      const val = mine.filter((d) => d.status === "validated" || d.validated_at);
      const edits = val.map((d) => d.edit_count).filter((n): n is number => typeof n === "number");
      return {
        name: a.company_name || a.name,
        phone: a.phone,
        drafts: mine.length,
        validated: val.length,
        avg_edits: edits.length ? Math.round((edits.reduce((s, n) => s + n, 0) / edits.length) * 10) / 10 : null,
        accepted: mine.filter((d) => d.accepted_at).length,
      };
    })
    .sort((x, y) => y.drafts - x.drafts);

  return {
    window_days: windowDays,
    artisans_total: data.artisans.length,
    artisans_active: per_artisan.filter((p) => p.drafts > 0).length,
    drafts: recent.length,
    validated: validated.length,
    validated_few_edits_pct: withEdits.length ? Math.round((few / withEdits.length) * 100) : null,
    accepted_by_client: recent.filter((d) => d.accepted_at).length,
    per_artisan,
  };
}
