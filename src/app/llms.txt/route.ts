import { landings } from "@/lib/seo-landings";
import { catalog } from "@/lib/seo-catalog";

/** Résumé pour les moteurs de réponse IA (convention llms.txt). Contenu factuel uniquement. */
export const dynamic = "force-static";

export function GET() {
  const base = (process.env.APP_URL || "https://jingr.ai").replace(/\/$/, "");
  const price = process.env.NEXT_PUBLIC_PRICE_MONTHLY || "49";
  const body = `# jingr

> jingr est un outil de devis et de factures pour les artisans du bâtiment (plombiers, chauffagistes, électriciens, menuisiers, couvreurs…), conçu à Lille. L'artisan dicte son chantier en vocal (WhatsApp ou navigateur du téléphone) et reçoit un devis chiffré avec ses propres prix, qu'il relit et valide avant de l'envoyer. Son client accepte le devis en ligne, la facture se fait ensuite en un clic.

Points clés :
- Sans logiciel à apprendre : un vocal ou quelques mots suffisent, depuis le téléphone.
- Les prix viennent du tarif de l'artisan et de ses devis déjà validés. Un prix inconnu est marqué « à confirmer », jamais inventé ; le devis ne peut pas être validé tant qu'il reste des prix à confirmer.
- Rien n'est envoyé au client sans la validation de l'artisan.
- Devis et factures avec les mentions obligatoires, TVA du bâtiment (10 %, 5,5 %, 20 %, franchise en base de TVA), acompte et durée de validité ; export CSV vers un autre logiciel.
- Données hébergées en France. Pour rédiger le devis, le texte du chantier passe par un service d'IA, sans servir à entraîner ses modèles.
- Tarif : ${price} € HT par mois, sans engagement. Pilote gratuit pour les premiers artisans de la métropole lilloise.
- Zone : métropole lilloise d'abord (Lille, Roubaix, Tourcoing, Villeneuve-d'Ascq, Marcq-en-Barœul…), utilisable partout en France.

## Pages principales
- [Accueil](${base}/)
- [Démo de 30 secondes](${base}/demo)
- [Essayer sur un vrai chantier](${base}/go)
- [Logiciel de devis artisan à Lille](${base}/logiciel-devis-artisan-lille)
- [Facture électronique 2027 pour les artisans](${base}/facture-electronique-artisan)
${landings.map((l) => `- [${l.h1}](${base}/${l.slug}) : ${l.description}`).join("\n")}

## Modèles de devis gratuits
${catalog.map((e) => `- [${e.title}](${base}/modele-devis/${e.slug})`).join("\n")}

## Contact
- contact@jingr.ai · 06 88 67 72 94 · Lille
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
