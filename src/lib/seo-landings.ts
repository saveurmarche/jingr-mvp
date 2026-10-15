/**
 * Pages d'atterrissage SEO sur ce qui différencie jingr : WhatsApp, sans logiciel,
 * vocal avec les prix de l'artisan, et les métiers. Contenu propre à chaque page
 * (pas de pages dupliquées), sans comparaison nominative avec des concurrents.
 */

export type Landing = {
  slug: string;
  title: string; // <title>
  description: string; // meta description
  eyebrow: string;
  h1: string;
  intro: string;
  sections: { h2: string; body: string[] }[];
  faq: [string, string][];
  /** Modèles de devis à mettre en avant (slugs du catalogue) */
  templates?: string[];
};

export const landings: Landing[] = [
  {
    slug: "devis-whatsapp-artisan",
    title: "Faire un devis artisan depuis WhatsApp : un vocal, un devis chiffré",
    description:
      "Dictez votre chantier depuis le téléphone et recevez un devis chiffré avec vos prix, à relire et valider. Envoi par vocal WhatsApp très bientôt. Sans application à installer.",
    eyebrow: "Devis par WhatsApp",
    h1: "Votre devis, depuis WhatsApp, sans rien installer",
    intro:
      "Vous utilisez déjà WhatsApp toute la journée. jingr s'en sert pour vos devis : vous envoyez un vocal comme à un collègue, et le devis chiffré revient quelques minutes plus tard, prêt à relire. L'envoi par WhatsApp ouvre très bientôt ; en attendant, c'est exactement le même principe depuis le navigateur du téléphone, sur jingr.ai/go.",
    sections: [
      {
        h2: "Comment ça marche",
        body: [
          "En sortant du chantier, vous dictez un vocal : le client, l'adresse, les travaux. Une minute suffit, même avec du bruit autour.",
          "jingr transforme votre vocal en lignes de devis : fournitures, main d'œuvre, déplacement. Les prix viennent de votre tarif ; ce qu'il ne connaît pas est marqué « à confirmer », jamais inventé en silence.",
          "Vous recevez un lien sur WhatsApp. Vous corrigez sur votre téléphone, vous validez, et vous envoyez le devis à votre client. Il l'accepte en ligne.",
        ],
      },
      {
        h2: "Pourquoi WhatsApp plutôt qu'une application de plus",
        body: [
          "Pas de mot de passe à retenir, pas de formation, pas d'application à mettre à jour. Le vocal, vous savez déjà faire.",
          "Votre client, lui, reçoit un vrai devis PDF à votre nom, avec les mentions légales, et un bouton pour l'accepter.",
        ],
      },
    ],
    faq: [
      ["Faut-il un compte WhatsApp Business ?", "Non. Votre WhatsApp habituel suffira : vous écrirez au numéro jingr comme à n'importe quel contact (ouverture très bientôt)."],
      ["Le devis part-il tout seul chez mon client ?", "Jamais. jingr prépare un brouillon ; rien n'est envoyé au client sans votre validation."],
      ["Et si je n'ai pas WhatsApp sous la main ?", "Vous pouvez aussi dicter ou écrire votre chantier sur jingr.ai/go, depuis le navigateur du téléphone."],
    ],
    templates: ["remplacement-chauffe-eau", "remplacement-tableau-electrique", "pose-fenetre-pvc"],
  },
  {
    slug: "devis-artisan-sans-logiciel",
    title: "Devis artisan sans logiciel : simple, sur votre téléphone",
    description:
      "Pas envie d'apprendre un logiciel de devis ? Dictez votre chantier depuis votre téléphone, recevez un devis chiffré conforme, faites-le signer en ligne. Pour les petites entreprises du bâtiment.",
    eyebrow: "Sans logiciel",
    h1: "Des devis propres, sans apprendre un logiciel",
    intro:
      "Beaucoup d'artisans font encore leurs devis sur Word, Excel ou un carnet, le soir. Les logiciels de devis existent, mais il faut du temps pour les apprendre et les remplir. jingr prend le problème à l'envers : vous parlez, il remplit.",
    sections: [
      {
        h2: "Ce que vous n'avez plus à faire",
        body: [
          "Retaper chaque ligne, recalculer la TVA, chercher le dernier numéro de facture, refaire la mise en page.",
          "Courir après la signature : votre client accepte le devis en ligne et vous êtes prévenu tout de suite.",
        ],
      },
      {
        h2: "Ce que vous gardez",
        body: [
          "Vos prix : collez votre tarif une fois (depuis Excel par exemple), jingr le reprend à l'identique. Chaque devis validé le complète.",
          "Le dernier mot : chaque ligne reste modifiable et rien ne part sans vous.",
          "Votre logiciel, si vous en avez un : export CSV en un clic pour vos factures ou votre comptable.",
        ],
      },
    ],
    faq: [
      ["Est-ce que mes devis sont conformes ?", "Oui : numérotation, mentions obligatoires, TVA applicable (10 % ou 5,5 % en rénovation selon les cas, franchise pour les micro-entrepreneurs) sont gérées par jingr. Vous restez responsable du contenu que vous validez."],
      ["Et la facture électronique de 2027 ?", "Les micro-entreprises devront émettre des factures électroniques à partir de septembre 2027. jingr prépare vos factures pour passer sur une plateforme agréée le moment venu."],
      ["Combien ça coûte ?", "49 € HT par mois, résiliable en un message. Les 10 premiers artisans pionniers ont 3 mois offerts puis 39 € HT par mois à vie."],
    ],
    templates: ["recherche-de-fuite", "creation-circuit-prises-cuisine", "pose-porte-interieure"],
  },
  {
    slug: "devis-vocal-artisan",
    title: "Devis vocal pour artisans : dictez, jingr chiffre avec VOS prix",
    description:
      "Dictez votre chantier, recevez un devis chiffré avec vos propres prix. Les prix inconnus sont signalés à confirmer, jamais inventés. Devis vocal pour plombiers, électriciens, chauffagistes, menuisiers.",
    eyebrow: "Devis à la voix",
    h1: "Le devis à la voix, mais avec vos prix à vous",
    intro:
      "Dicter un devis, c'est rapide. Encore faut-il que les prix soient les bons. jingr part de votre tarif et de vos devis déjà validés ; quand il ne sait pas, il le dit.",
    sections: [
      {
        h2: "Des prix fiables, pas des prix moyens",
        body: [
          "Vous collez votre tarif une fois. Une ligne qui correspond à un article connu reprend votre prix, à l'euro près.",
          "Une ligne inconnue est proposée en orange, « à confirmer ». Le devis ne peut pas être validé tant que vous ne l'avez pas vérifiée.",
          "Chaque devis validé enrichit votre tarif : au fil des semaines, il y a de moins en moins de prix à confirmer.",
        ],
      },
      {
        h2: "Jusqu'à la signature",
        body: [
          "Votre client reçoit un lien, consulte le devis et l'accepte en ligne. Vous êtes prévenu tout de suite.",
          "Chantier terminé : la facture se fait en un clic à partir du devis accepté.",
        ],
      },
    ],
    faq: [
      ["Ça marche avec le vocabulaire du métier ?", "Oui : la transcription connaît le vocabulaire du bâtiment (groupe de sécurité, différentiel, PER, dormant…). Vous relisez toujours avant de valider."],
      ["Et sur un chantier bruyant ?", "Un vocal d'une minute près du chantier passe en général bien. Si jingr n'arrive pas à vous comprendre, il vous le dit et vous pouvez écrire à la place."],
      ["Mes données servent-elles à entraîner une IA ?", "Non. Elles servent uniquement à faire vos devis, et vous pouvez tout supprimer d'un message."],
    ],
    templates: ["remplacement-mitigeur", "installation-spots-led", "remplacement-gouttiere-zinc"],
  },
  {
    slug: "devis-plombier-chauffagiste",
    title: "Logiciel de devis plombier chauffagiste : un vocal, un devis",
    description:
      "Plombiers et chauffagistes : chauffe-eau, fuite, chaudière, radiateur… Dictez le chantier depuis votre téléphone, recevez un devis chiffré avec vos prix, TVA rénovation gérée. Modèles gratuits.",
    eyebrow: "Plombiers · chauffagistes",
    h1: "Devis de plomberie et de chauffage, dictés depuis le chantier",
    intro:
      "Remplacement de chauffe-eau, recherche de fuite, désembouage, radiateur : ce sont des devis que vous refaites toutes les semaines. jingr les prépare à partir d'un vocal et de vos prix.",
    sections: [
      {
        h2: "Ce que jingr gère pour vous",
        body: [
          "Les lignes habituelles : déplacement, dépose, fourniture, pose, mise en service, évacuation de l'ancien appareil.",
          "La TVA : 10 % en rénovation d'un logement de plus de 2 ans, 5,5 % pour certains travaux de rénovation énergétique, avec rappel de l'attestation du client.",
          "Les oublis classiques, signalés dans nos modèles : groupe de sécurité, recyclage, accès.",
        ],
      },
    ],
    faq: [
      ["Puis-je mettre ma marge ?", "Oui : vous réglez votre marge une fois, ou mieux, vous collez votre tarif de vente et jingr le reprend tel quel."],
      ["Ça gère les devis de pompe à chaleur ?", "Oui pour la rédaction et le chiffrage à partir de vos prix. Les aides (MaPrimeRénov', CEE) restent à vérifier de votre côté."],
    ],
    templates: ["remplacement-chauffe-eau", "recherche-de-fuite", "remplacement-mitigeur", "remplacement-wc-suspendu", "debouchage-canalisation", "remplacement-chaudiere-gaz", "desembouage-chauffage", "remplacement-radiateur"],
  },
  {
    slug: "devis-electricien",
    title: "Logiciel de devis électricien : dictez, recevez le devis chiffré",
    description:
      "Électriciens : tableau électrique, circuits, éclairage… Dictez le chantier depuis votre téléphone, recevez un devis chiffré avec vos prix et les mentions utiles. Modèles de devis électricité gratuits.",
    eyebrow: "Électriciens",
    h1: "Devis d'électricité, dictés depuis le chantier",
    intro:
      "Remplacement de tableau, création de circuits, éclairage : jingr transforme votre vocal en devis détaillé, avec vos prix et les précisions qui évitent les litiges.",
    sections: [
      {
        h2: "Les précisions qui comptent",
        body: [
          "Ce qui est compris et ce qui ne l'est pas : saignées, rebouchage, peinture, mise à la terre existante.",
          "Le nombre de disjoncteurs et la place au tableau, souvent oubliés.",
          "La TVA à 10 % en rénovation d'un logement de plus de 2 ans.",
        ],
      },
    ],
    faq: [
      ["jingr connaît-il la norme NF C 15-100 ?", "jingr vous aide à rédiger et chiffrer ; la conformité technique de l'installation reste de votre ressort. Nos modèles rappellent de bien préciser le périmètre des travaux."],
      ["Ça gère les bornes de recharge ?", "Oui pour la rédaction et le chiffrage avec vos prix. Vérifiez de votre côté la qualification IRVE et les aides applicables."],
    ],
    templates: ["remplacement-tableau-electrique", "creation-circuit-prises-cuisine", "installation-spots-led"],
  },
  {
    slug: "devis-ia-artisan",
    title: "Devis par IA pour artisan : comment ça marche, ce qu'il faut vérifier",
    description:
      "Faire ses devis avec l'IA quand on est artisan du bâtiment : ce que l'IA fait bien, ce qu'elle ne doit jamais faire seule, et comment garder vos prix. Guide simple, sans jargon.",
    eyebrow: "Devis et IA",
    h1: "Faire ses devis avec l'IA, sans perdre la main",
    intro:
      "L'IA peut rédiger un devis en quelques secondes à partir d'un vocal ou de quelques mots. Mais un devis engage l'artisan : prix, TVA, mentions. Voici ce qu'il faut attendre d'un outil de devis par IA, et ce qu'il ne doit jamais faire à votre place.",
    sections: [
      {
        h2: "Ce que l'IA fait bien",
        body: [
          "Transformer une description de chantier (« chauffe-eau 200 L à changer, groupe de sécurité, évacuation de l'ancien ») en lignes de devis claires : fourniture, dépose, pose, déplacement.",
          "Rédiger l'introduction et les précisions qui évitent les litiges : ce qui est compris, ce qui ne l'est pas.",
          "Aller vite : le devis est prêt à relire pendant que vous êtes encore sur le chantier ou dans le camion.",
        ],
      },
      {
        h2: "Ce qu'elle ne doit jamais faire seule",
        body: [
          "Inventer des prix. Un prix moyen trouvé sur Internet n'est pas votre prix. Un bon outil part de votre tarif et signale clairement ce qu'il ne connaît pas.",
          "Envoyer le devis au client sans vous. Le devis vous engage : c'est vous qui validez, ligne par ligne si besoin.",
          "Choisir la TVA à votre place sans contrôle. 10 %, 5,5 % ou 20 % dépend du logement et des travaux ; l'outil propose, vous vérifiez.",
        ],
      },
      {
        h2: "Comment jingr s'y prend",
        body: [
          "Vous dictez le chantier sur votre téléphone (bientôt aussi sur WhatsApp). jingr prépare le devis avec les prix de votre tarif et de vos devis déjà validés.",
          "Un prix inconnu apparaît en orange, « à confirmer ». Tant qu'il en reste, le devis ne peut pas être validé.",
          "Vous relisez, vous validez, votre client reçoit un lien et accepte en ligne. Démo de 30 secondes sur jingr.ai/demo.",
        ],
      },
    ],
    faq: [
      ["L'IA connaît-elle mes prix ?", "Pas au départ. Vous collez votre tarif une fois (depuis Excel par exemple), et chaque devis validé le complète. Ce que jingr ne connaît pas est marqué « à confirmer »."],
      ["Mes données servent-elles à entraîner une IA ?", "Non. Le texte du chantier sert uniquement à rédiger votre devis ; il ne sert pas à entraîner des modèles. Les données sont hébergées en France."],
      ["Est-ce que je reste responsable du devis ?", "Oui, comme avec n'importe quel logiciel : vous relisez et validez avant envoi. jingr gère les mentions obligatoires et les calculs, vous gardez le dernier mot."],
      ["Combien ça coûte ?", "49 € HT par mois, sans engagement. Les premiers artisans pilotes de la métropole lilloise l'utilisent gratuitement pendant le pilote."],
    ],
    templates: ["remplacement-chauffe-eau", "remplacement-tableau-electrique", "pose-fenetre-pvc"],
  },
];

export function findLanding(slug: string): Landing | undefined {
  return landings.find((l) => l.slug === slug);
}
