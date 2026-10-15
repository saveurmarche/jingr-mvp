/**
 * Pages « Modèle de devis » : acquisition organique.
 * Les artisans cherchent « modèle devis remplacement chauffe-eau » sur Google :
 * on leur donne un vrai modèle détaillé, et la façon de le produire en 2 minutes avec jingr.
 * Prix HT indicatifs (fourniture + pose, hors marge spécifique) — à faire relire par un pro.
 */

export type CatalogLine = { label: string; qty: number; unit: string; pu: number };

export type CatalogEntry = {
  slug: string;
  metier: "plombier" | "chauffagiste" | "électricien" | "menuisier" | "couvreur" | "peintre" | "carreleur" | "plaquiste";
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
  {
    slug: "remplacement-tableau-electrique",
    metier: "électricien",
    title: "Remplacement de tableau électrique",
    short: "Dépose de l'ancien tableau, nouveau tableau pré-équipé avec interrupteurs différentiels 30 mA, repérage des circuits.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans (attestation simplifiée du client).",
    lines: [
      { label: "Diagnostic de l'installation et repérage des circuits", qty: 1, unit: "forfait", pu: 90 },
      { label: "Dépose de l'ancien tableau et évacuation", qty: 1, unit: "forfait", pu: 80 },
      { label: "Fourniture tableau 3 rangées pré-équipé (2 interrupteurs différentiels 30 mA)", qty: 1, unit: "u", pu: 390 },
      { label: "Fourniture disjoncteurs divisionnaires complémentaires", qty: 6, unit: "u", pu: 14 },
      { label: "Pose, raccordement des circuits et étiquetage", qty: 1, unit: "forfait", pu: 360 },
      { label: "Essais, contrôle de la terre et mise en service", qty: 1, unit: "forfait", pu: 60 },
    ],
    pitfalls: [
      "Ne pas préciser si la mise à la terre existante est conforme (et ce qui se passe si elle ne l'est pas).",
      "Oublier le repérage et l'étiquetage des circuits.",
      "Laisser croire que l'installation entière devient conforme NF C 15-100 : seul le tableau est refait.",
    ],
  },
  {
    slug: "creation-circuit-prises-cuisine",
    metier: "électricien",
    title: "Création de circuits prises en cuisine",
    short: "Circuits spécialisés plaque, four et lave-vaisselle, prises plan de travail, protection au tableau.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans.",
    lines: [
      { label: "Déplacement et étude des besoins", qty: 1, unit: "forfait", pu: 50 },
      { label: "Circuit spécialisé plaque de cuisson 32 A (câble 6 mm²)", qty: 1, unit: "u", pu: 230 },
      { label: "Circuits spécialisés four et lave-vaisselle 20 A", qty: 2, unit: "u", pu: 160 },
      { label: "Prises 16 A plan de travail (fourniture et pose)", qty: 4, unit: "u", pu: 55 },
      { label: "Fourniture et pose disjoncteurs au tableau", qty: 4, unit: "u", pu: 28 },
      { label: "Saignées ou goulottes (hors reprise de peinture)", qty: 1, unit: "forfait", pu: 120 },
    ],
    pitfalls: [
      "Ne pas préciser si les saignées sont rebouchées et si la peinture est comprise.",
      "Oublier les disjoncteurs ou la place disponible au tableau.",
    ],
  },
  {
    slug: "installation-spots-led",
    metier: "électricien",
    title: "Installation de spots LED encastrés",
    short: "Perçage du plafond, spots LED basse consommation, alimentation et interrupteur, mise en service.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans.",
    lines: [
      { label: "Déplacement et préparation du chantier", qty: 1, unit: "forfait", pu: 50 },
      { label: "Fourniture spots LED encastrables avec transformateur", qty: 8, unit: "u", pu: 32 },
      { label: "Perçage plafond et pose des spots", qty: 8, unit: "u", pu: 30 },
      { label: "Tirage de câble et raccordement", qty: 1, unit: "forfait", pu: 140 },
      { label: "Fourniture et pose interrupteur (va-et-vient si besoin)", qty: 1, unit: "u", pu: 60 },
    ],
    pitfalls: [
      "Ne pas vérifier la hauteur de plénum et l'isolant au-dessus du plafond.",
      "Oublier de préciser l'indice de protection (IP) en salle de bain.",
    ],
  },
  {
    slug: "pose-fenetre-pvc",
    metier: "menuisier",
    title: "Remplacement de fenêtre PVC double vitrage",
    short: "Dépose de l'ancienne fenêtre, fenêtre PVC double vitrage sur mesure, pose en rénovation, finitions.",
    tva: 5.5,
    tvaNote:
      "TVA 5,5 % si la fenêtre remplace un simple vitrage et respecte les seuils de performance énergétique (Uw et Sw) ; sinon 10 % en rénovation. Attestation du client à conserver.",
    lines: [
      { label: "Prise de cotes et déplacement", qty: 1, unit: "forfait", pu: 60 },
      { label: "Fourniture fenêtre PVC 2 vantaux double vitrage sur mesure (env. 120 × 135 cm)", qty: 1, unit: "u", pu: 520 },
      { label: "Dépose de l'ancienne fenêtre et évacuation", qty: 1, unit: "u", pu: 70 },
      { label: "Pose en rénovation sur dormant existant, calfeutrement", qty: 1, unit: "u", pu: 180 },
      { label: "Habillage intérieur et finitions (joint, couvre-joint)", qty: 1, unit: "forfait", pu: 60 },
    ],
    pitfalls: [
      "Appliquer 5,5 % sans vérifier les performances Uw / Sw de la fenêtre ni le remplacement d'un simple vitrage.",
      "Ne pas préciser si la reprise de peinture ou d'enduit autour de la fenêtre est comprise.",
    ],
  },
  {
    slug: "pose-porte-interieure",
    metier: "menuisier",
    title: "Pose de porte intérieure",
    short: "Bloc-porte standard fourni et posé, dépose de l'ancien, quincaillerie et réglages.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans.",
    lines: [
      { label: "Dépose ancienne porte et huisserie", qty: 1, unit: "u", pu: 60 },
      { label: "Fourniture bloc-porte prépeint 83 cm avec huisserie", qty: 1, unit: "u", pu: 190 },
      { label: "Pose, calage et fixation", qty: 1, unit: "u", pu: 150 },
      { label: "Quincaillerie (poignée, serrure à condamnation)", qty: 1, unit: "u", pu: 45 },
      { label: "Pose des chambranles et réglages", qty: 1, unit: "u", pu: 40 },
    ],
    pitfalls: [
      "Ne pas mesurer l'épaisseur de cloison avant de commander l'huisserie.",
      "Oublier la peinture de finition si le bloc-porte est seulement prépeint.",
    ],
  },
  {
    slug: "remplacement-gouttiere-zinc",
    metier: "couvreur",
    title: "Remplacement de gouttière zinc",
    short: "Dépose de l'ancienne gouttière, gouttière zinc demi-ronde, crochets, naissance et descente.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans.",
    lines: [
      { label: "Installation de l'échafaudage ou de la nacelle (selon accès)", qty: 1, unit: "forfait", pu: 250 },
      { label: "Dépose et évacuation ancienne gouttière", qty: 12, unit: "ml", pu: 9 },
      { label: "Fourniture et pose gouttière zinc demi-ronde 25 avec crochets", qty: 12, unit: "ml", pu: 45 },
      { label: "Naissance, talon et soudures", qty: 1, unit: "forfait", pu: 90 },
      { label: "Descente zinc diamètre 80 avec colliers", qty: 6, unit: "ml", pu: 40 },
    ],
    pitfalls: [
      "Oublier l'accès (échafaudage, nacelle) : c'est souvent le poste le plus cher.",
      "Ne pas vérifier l'état des voliges et de la planche de rive avant de chiffrer.",
    ],
  },
  {
    slug: "peinture-murs-plafonds",
    metier: "peintre",
    title: "Peinture des murs et plafonds d'une pièce",
    short: "Protection, préparation des supports, impression et deux couches de finition sur murs et plafond.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans (attestation simplifiée du client).",
    lines: [
      { label: "Protection des sols et des meubles, bâchage", qty: 1, unit: "forfait", pu: 60 },
      { label: "Préparation des murs : rebouchage, ponçage, dépoussiérage", qty: 38, unit: "m²", pu: 7 },
      { label: "Impression des murs (sous-couche)", qty: 38, unit: "m²", pu: 6 },
      { label: "Peinture murs acrylique mate, 2 couches", qty: 38, unit: "m²", pu: 14 },
      { label: "Préparation et peinture plafond blanc mat, 2 couches", qty: 14, unit: "m²", pu: 22 },
      { label: "Nettoyage de fin de chantier", qty: 1, unit: "forfait", pu: 40 },
    ],
    pitfalls: [
      "Chiffrer au m² de sol au lieu du m² de surface réellement peinte (murs déduits des ouvertures).",
      "Oublier la préparation des supports : c'est elle qui fait le rendu, et le temps passé.",
      "Ne pas préciser le nombre de couches et la finition (mat, velours, satin).",
    ],
  },
  {
    slug: "pose-carrelage-sol",
    metier: "carreleur",
    title: "Pose de carrelage au sol",
    short: "Dépose de l'ancien revêtement, ragréage, pose collée de carrelage, joints et plinthes.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans ; 20 % sur un logement neuf.",
    lines: [
      { label: "Dépose et évacuation ancien revêtement de sol", qty: 20, unit: "m²", pu: 12 },
      { label: "Ragréage autolissant (épaisseur jusqu'à 5 mm)", qty: 20, unit: "m²", pu: 16 },
      { label: "Pose collée carrelage 60x60 (fourniture client ou à chiffrer à part)", qty: 20, unit: "m²", pu: 42 },
      { label: "Joints et finitions", qty: 20, unit: "m²", pu: 5 },
      { label: "Fourniture et pose plinthes assorties", qty: 18, unit: "ml", pu: 14 },
    ],
    pitfalls: [
      "Ne pas préciser qui fournit le carrelage, ni le pourcentage de chutes prévu (souvent 10 %).",
      "Oublier le ragréage alors que le support n'est pas plan.",
      "Ne pas distinguer pose droite et pose en diagonale, plus longue.",
    ],
  },
  {
    slug: "pose-cloison-placo",
    metier: "plaquiste",
    title: "Création d'une cloison en plaques de plâtre",
    short: "Ossature métallique, isolant phonique, plaques BA13 deux faces, bandes et enduit prêts à peindre.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans.",
    lines: [
      { label: "Fourniture et pose ossature métallique (rails et montants 48 mm)", qty: 10, unit: "m²", pu: 18 },
      { label: "Fourniture et pose laine minérale 45 mm (isolation phonique)", qty: 10, unit: "m²", pu: 9 },
      { label: "Fourniture et pose plaques BA13, deux faces", qty: 20, unit: "m²", pu: 16 },
      { label: "Bandes, enduit et ponçage, prêt à peindre", qty: 20, unit: "m²", pu: 11 },
      { label: "Réservation et renfort pour bloc-porte", qty: 1, unit: "u", pu: 75 },
    ],
    pitfalls: [
      "Compter la surface de cloison une seule fois alors que les plaques et l'enduit se posent sur deux faces.",
      "Oublier le renfort pour un bloc-porte ou un meuble suspendu.",
      "Ne pas préciser que la peinture n'est pas comprise.",
    ],
  },
  {
    slug: "pose-parquet-flottant",
    metier: "menuisier",
    title: "Pose de parquet flottant",
    short: "Préparation du sol, sous-couche acoustique, pose flottante, plinthes et barres de seuil.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans.",
    lines: [
      { label: "Préparation du support et vérification de la planéité", qty: 25, unit: "m²", pu: 6 },
      { label: "Fourniture et pose sous-couche acoustique", qty: 25, unit: "m²", pu: 5 },
      { label: "Pose flottante parquet stratifié ou contrecollé (fourniture à chiffrer à part)", qty: 25, unit: "m²", pu: 22 },
      { label: "Fourniture et pose plinthes", qty: 22, unit: "ml", pu: 12 },
      { label: "Barres de seuil et découpes de portes", qty: 1, unit: "forfait", pu: 60 },
    ],
    pitfalls: [
      "Oublier la sous-couche, ou en prévoir une incompatible avec un chauffage au sol.",
      "Ne pas compter la découpe des bas de portes après la surépaisseur.",
    ],
  },
  {
    slug: "reparation-toiture-tuiles",
    metier: "couvreur",
    title: "Réparation de toiture : remplacement de tuiles",
    short: "Accès, remplacement des tuiles cassées, révision du faîtage et vérification de l'étanchéité.",
    tva: 10,
    tvaNote: "TVA 10 % en rénovation d'un logement de plus de 2 ans.",
    lines: [
      { label: "Installation de l'accès (échelle de toit, sécurisation ou nacelle)", qty: 1, unit: "forfait", pu: 180 },
      { label: "Dépose des tuiles cassées et contrôle des liteaux", qty: 1, unit: "forfait", pu: 90 },
      { label: "Fourniture et pose de tuiles identiques", qty: 15, unit: "u", pu: 9 },
      { label: "Révision et scellement du faîtage", qty: 6, unit: "ml", pu: 35 },
      { label: "Contrôle d'étanchéité et nettoyage", qty: 1, unit: "forfait", pu: 60 },
    ],
    pitfalls: [
      "Ne pas prévoir l'accès et la sécurité, souvent le poste le plus lourd.",
      "Promettre des tuiles identiques sans avoir vérifié le modèle (certains ne se fabriquent plus).",
      "Ne pas préciser que les liteaux ou la charpente abîmés feront l'objet d'un devis séparé.",
    ],
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
