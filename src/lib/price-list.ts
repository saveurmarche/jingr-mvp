import type { PriceItem, QuoteLineItem } from "./types";

const MAX_ITEMS = 300;

/** « Fourniture chauffe-eau 200 L » et « fourniture chauffe eau 200l » désignent la même ligne. */
export function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/(\d) (l|m|m2|m3|mm|cm|kw)\b/g, "$1$2")
    .trim();
}

/** Seule une correspondance exacte (après normalisation) réutilise un prix : jamais d'à-peu-près. */
export function findCatalogueMatch(label: string, list: PriceItem[] | undefined): PriceItem | null {
  if (!list?.length) return null;
  const key = normalizeLabel(label);
  if (!key) return null;
  return list.find((p) => normalizeLabel(p.label) === key) ?? null;
}

/** Ajoute ou met à jour les lignes d'un devis validé dans le catalogue de l'artisan (le plus récent gagne). */
export function mergeIntoPriceList(
  list: PriceItem[] | undefined,
  items: QuoteLineItem[],
  now = new Date().toISOString()
): PriceItem[] {
  const byKey = new Map<string, PriceItem>();
  for (const p of list ?? []) byKey.set(normalizeLabel(p.label), p);
  for (const i of items) {
    const key = normalizeLabel(i.label);
    if (!key || !(i.unit_price_ht > 0)) continue;
    byKey.delete(key);
    byKey.set(key, {
      label: i.label.trim(),
      unit: i.unit,
      unit_price_ht: i.unit_price_ht,
      tva_rate: i.tva_rate,
      updated_at: now,
    });
  }
  // Map garde l'ordre d'insertion : les plus récents sont à la fin.
  return [...byKey.values()].slice(-MAX_ITEMS);
}

/** Extrait du catalogue envoyé au modèle : libellé, unité et prix, rien d'autre. */
export function catalogueForPrompt(list: PriceItem[] | undefined, max = 80): string {
  if (!list?.length) return "";
  return list
    .slice(-max)
    .map((p) => `- ${p.label} | ${p.unit} | ${p.unit_price_ht} € HT`)
    .join("\n");
}

export function hasUnconfirmedEstimates(items: QuoteLineItem[]): boolean {
  return items.some((i) => i.price_source === "estimate");
}
