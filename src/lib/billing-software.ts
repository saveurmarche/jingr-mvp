/** Outils de devis/facturation courants chez les artisans (liste déclarative, pas d'intégration implicite). */
export const SOFTWARE_OPTIONS = [
  "Word / Excel",
  "Papier / carnet",
  "Obat",
  "Tolteck",
  "Batappli",
  "EBP Bâtiment",
  "Henrri",
  "Axonaut",
  "Pennylane",
  "Sage Batigest",
  "Mon expert-comptable s'en occupe",
  "Autre logiciel",
] as const;

/** L'artisan facture dans jingr sauf s'il a déclaré un logiciel de facturation externe. */
export function invoicesInJingr(billingSoftware?: string | null): boolean {
  return !billingSoftware || billingSoftware === "jingr";
}
