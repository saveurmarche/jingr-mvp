import type { QuoteDraft } from "./types";

/** Nombre au format français, sans séparateur de milliers (import Excel / logiciels FR). */
function frNum(n: number): string {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

function cell(raw: string): string {
  // Un texte commençant par = + - @ serait interprété comme une formule par Excel : on le neutralise.
  const v = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Lignes du devis en CSV « Excel France » : séparateur point-virgule, virgule décimale,
 * BOM UTF-8 pour que les accents s'affichent. Colonnes reconnues par la plupart des imports d'articles.
 */
export function draftToCsv(draft: QuoteDraft): string {
  const header = ["Désignation", "Quantité", "Unité", "Prix unitaire HT", "TVA %", "Total HT"];
  const rows = draft.line_items.map((li) => [
    cell(li.label),
    frNum(li.quantity),
    cell(li.unit),
    frNum(li.unit_price_ht),
    frNum(li.tva_rate),
    frNum(li.quantity * li.unit_price_ht),
  ]);
  return "﻿" + [header, ...rows].map((r) => r.join(";")).join("\r\n") + "\r\n";
}
