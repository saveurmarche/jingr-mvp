/**
 * Pages « Modèle de devis » : acquisition organique.
 * Les artisans cherchent « modèle devis remplacement chauffe-eau » sur Google :
 * on leur donne un vrai modèle détaillé, et la façon de le produire en 2 minutes avec jingr.
 * Prix HT indicatifs (fourniture + pose, hors marge spécifique) — à faire relire par un pro.
 */

export type CatalogLine = { label: string; qty: number; unit: string; pu: number };

export type CatalogEntry = {
  slug: string;
  metier: "plombier" | "chauffagiste";
  title: string;
  short: string;
  tva: number;
  tvaNote: string;
  lines: CatalogLine[];
  pitfalls: string[];
};

export const catalog: CatalogEntry[] = [
  {
    slug: "remplacement-chauffe-eau",
    metier: "plombier",
    title: "Remplacement de chauffe-eau électrique",
    short: "Dépose de l'ancien cumulus, fourniture et pose d'un 200 L, groupe de sécurité, mise en service.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans (attestation simplifiée du client).",
    lines: [
      { label: "Déplacement et diagnostic installation ECS", qty: 1, unit: "forfait", pu: 65 },
      { label: "Dépose et évacuation ancien chauffe-eau", qty: 1, unit: "forfait", pu: 110 },
      { label: "Fourniture chauffe-eau électrique 200 L vertical mural", qty: 1, unit: "u", pu: 420 },
      { label: "Fourniture groupe de sécurité + siphon + flexibles inox", qty: 1, unit: "forfait", pu: 55 },
      { label: "Pose, raccordements hydrauliques et électriques", qty: 1, unit: "forfait", pu: 280 },
      { label: "Mise en eau, essais d'étanchéité, mise en service", qty: 1, unit: "forfait", pu: 50 },
    ],
    pitfalls: [
      "Oublier la dépose et le recyclage de l'ancien appareil.",
      "Ne pas chiffrer le groupe de sécurité (obligatoire, norme NF).",
      "Appliquer 20 % de TVA au lieu de 10 % en rénovation.",
    ],
  },
  {
    slug: "recherche-de-fuite",
    metier: "plombier",
    title: "Recherche et réparation de fuite",
    short: "Localisation non destructive, accès, réparation et remise en eau.",
    tva: 10,
    tvaNote: "TVA 10 % pour un logement de plus de 2 ans.",
    lines: [
      { label: "Déplacement et diagnostic", qty: 1, unit: "forfait", pu: 69 },
      { label: "Recherche de fuite non destructive (gaz traceur / caméra thermique)", qty: 1, unit: "forfait", pu: 220 },
      { label: "Ouverture et accès à la canalisation", qty: 1, unit: "forfait", pu: 90 },
      { label: "Réparation canalisation (fourniture raccords comprise)", qty: 1.5, unit: "h", pu: 62 },
      { label: "Essai sous pression et remise en eau", qty: 1, unit: "forfait", pu: 40 },
    ],
    pitfalls: [
      "Ne pas séparer recherche et réparation : l'assureur du client demande souvent le détail.",
      "Oublier de préciser que les reprises de maçonnerie/carrelage ne sont pas comprises.",
    ],
  },
  {
    slug: "remplacement-mitigeur",
    metier: "plombier",
    title: "Remplacement de mitigeur",
    short: "Dépose de l'ancienne robinetterie, fourniture et pose d'un mitigeur, contrôle des flexibles.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation.",
    lines: [
      { label: "Déplacement", qty: 1, unit: "forfait", pu: 45 },
      { label: "Dépose ancienne robinetterie", qty: 1, unit: "forfait", pu: 35 },
      { label: "Fourniture mitigeur évier / lavabo milieu de gamme", qty: 1, unit: "u", pu: 95 },
      { label: "Pose, flexibles neufs et essais", qty: 1, unit: "forfait", pu: 75 },
    ],
    pitfalls: ["Ne pas prévoir le remplacement des robinets d'arrêt grippés."],
  },
  {
    slug: "remplacement-wc-suspendu",
    metier: "plombier",
    title: "Pose de WC suspendu",
    short: "Dépose WC au sol, bâti-support, cuvette suspendue, habillage et raccordements.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation.",
    lines: [
      { label: "Dépose et évacuation WC existant", qty: 1, unit: "forfait", pu: 90 },
      { label: "Fourniture bâti-support autoportant + plaque de commande", qty: 1, unit: "u", pu: 260 },
      { label: "Fourniture cuvette suspendue sans bride + abattant", qty: 1, unit: "u", pu: 220 },
      { label: "Pose bâti, raccordements alimentation et évacuation", qty: 1, unit: "forfait", pu: 320 },
      { label: "Habillage plaque de plâtre hydrofuge (hors carrelage)", qty: 1, unit: "forfait", pu: 180 },
    ],
    pitfalls: [
      "Oublier l'habillage du bâti ou préciser qu'il est exclu.",
      "Ne pas vérifier la résistance de la cloison pour un bâti non autoportant.",
    ],
  },
  {
    slug: "debouchage-canalisation",
    metier: "plombier",
    title: "Débouchage de canalisation",
    short: "Intervention furet ou hydrocurage, passage caméra si nécessaire.",
    tva: 10,
    tvaNote: "TVA 10 % en entretien d'un logement de plus de 2 ans.",
    lines: [
      { label: "Déplacement", qty: 1, unit: "forfait", pu: 55 },
      { label: "Débouchage mécanique au furet électrique", qty: 1, unit: "forfait", pu: 120 },
      { label: "Inspection caméra (option)", qty: 1, unit: "forfait", pu: 150 },
    ],
    pitfalls: ["Annoncer l'option caméra avant intervention pour éviter les litiges."],
  },
  {
    slug: "remplacement-chaudiere-gaz",
    metier: "chauffagiste",
    title: "Remplacement de chaudière gaz à condensation",
    short: "Dépose de l'ancienne chaudière, chaudière condensation, ventouse, désembouage et mise en service.",
    tva: 5.5,
    tvaNote: "TVA 5,5 % pour une chaudière à condensation éligible en rénovation énergétique (sinon 10 %).",
    lines: [
      { label: "Dépose et évacuation ancienne chaudière", qty: 1, unit: "forfait", pu: 250 },
      { label: "Fourniture chaudière gaz à condensation 25 kW", qty: 1, unit: "u", pu: 2350 },
      { label: "Fourniture et pose ventouse / conduit de fumée", qty: 1, unit: "forfait", pu: 380 },
      { label: "Désembouage du circuit + pot à boues magnétique", qty: 1, unit: "forfait", pu: 420 },
      { label: "Pose, raccordements gaz, hydraulique et électrique", qty: 1, unit: "forfait", pu: 750 },
      { label: "Thermostat d'ambiance programmable", qty: 1, unit: "u", pu: 140 },
      { label: "Mise en service, réglages et certificat de conformité gaz", qty: 1, unit: "forfait", pu: 180 },
    ],
    pitfalls: [
      "Oublier le désembouage : il conditionne la garantie fabricant.",
      "Se tromper de taux de TVA (5,5 % vs 10 %).",
    ],
  },
  {
    slug: "desembouage-chauffage",
    metier: "chauffagiste",
    title: "Désembouage de circuit de chauffage",
    short: "Injection de produit, rinçage par radiateur, filtre, inhibiteur.",
    tva: 10,
    tvaNote: "TVA 10 % en entretien.",
    lines: [
      { label: "Déplacement et diagnostic circuit", qty: 1, unit: "forfait", pu: 65 },
      { label: "Désembouage par pompe (jusqu'à 8 radiateurs)", qty: 1, unit: "forfait", pu: 480 },
      { label: "Fourniture produit désembouant + inhibiteur", qty: 1, unit: "forfait", pu: 85 },
      { label: "Fourniture et pose filtre magnétique", qty: 1, unit: "u", pu: 160 },
    ],
    pitfalls: ["Préciser le nombre de radiateurs inclus dans le forfait."],
  },
  {
    slug: "remplacement-radiateur",
    metier: "chauffagiste",
    title: "Remplacement de radiateur eau chaude",
    short: "Vidange partielle, dépose, radiateur acier, robinet thermostatique, remise en eau et purge.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation.",
    lines: [
      { label: "Vidange partielle et dépose ancien radiateur", qty: 1, unit: "forfait", pu: 90 },
      { label: "Fourniture radiateur acier panneau 1 500 W", qty: 1, unit: "u", pu: 210 },
      { label: "Fourniture robinet thermostatique + té de réglage", qty: 1, unit: "forfait", pu: 55 },
      { label: "Pose, raccordement, remise en eau et purge", qty: 1, unit: "forfait", pu: 160 },
    ],
    pitfalls: ["Oublier la purge et l'équilibrage du réseau après remise en eau."],
  },
];

export function findEntry(slug: string): CatalogEntry | undefined {
  return catalog.find((e) => e.slug === slug);
}

export function entryTotals(e: CatalogEntry) {
  const ht = e.lines.reduce((s, l) => s + l.qty * l.pu, 0);
  const tva = Math.round(ht * e.tva) / 100;
  return { ht, tva, ttc: ht + tva };
}
