import type { Metadata } from "next";
import Link from "next/link";
import { StartCta } from "@/components/Cta";
import { catalog } from "@/lib/seo-catalog";

const PRICE = process.env.NEXT_PUBLIC_PRICE_MONTHLY || "49";
const PIONEER_PRICE = process.env.NEXT_PUBLIC_PIONEER_PRICE || "39";

export const metadata: Metadata = {
  title: "Logiciel de devis pour artisans à Lille : devis en vocal, facture en un clic",
  description:
    "Plombiers, électriciens, chauffagistes, menuisiers de la métropole lilloise : dictez votre chantier sur WhatsApp, recevez un devis chiffré à relire, faites-le accepter en ligne. Petite équipe lilloise.",
  alternates: { canonical: "/logiciel-devis-artisan-lille" },
};

const villes = [
  "Lille", "Roubaix", "Tourcoing", "Villeneuve-d'Ascq", "Marcq-en-Barœul", "Lambersart", "La Madeleine",
  "Lomme", "Wasquehal", "Croix", "Mons-en-Barœul", "Loos", "Wattrelos", "Hellemmes", "Ronchin",
  "Faches-Thumesnil", "Seclin", "Armentières", "Halluin", "Haubourdin",
];

const etapes: [string, string][] = [
  ["Sur le chantier", "Vous dictez le chantier en vocal sur WhatsApp, une minute suffit : client, adresse, travaux."],
  ["Quelques minutes après", "Vous recevez un devis chiffré avec vos prix. Ce que jingr ne connaît pas est marqué « à confirmer »."],
  ["Vous relisez", "Vous corrigez sur votre téléphone, vous validez. Rien ne part chez le client sans vous."],
  ["Votre client accepte", "Il reçoit un lien, consulte le devis et l'accepte en ligne. La facture suit en un clic, chantier fini."],
];

export default function LogicielDevisLillePage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#7b5ea7]">Métropole lilloise</p>
        <h1 className="text-3xl font-bold text-stone-900">
          Un logiciel de devis pour les artisans de Lille, qui marche à la voix
        </h1>
        <p className="text-stone-600">
          jingr est construit à Lille, avec les artisans d&apos;ici : plombiers, chauffagistes, électriciens, menuisiers.
          Le but est simple : que votre devis parte le jour de la visite, pas trois soirs plus tard.
        </p>
        <StartCta />
      </header>

      <section className="card space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Comment ça marche</h2>
        <ol className="space-y-2 text-stone-700">
          {etapes.map(([t, d], i) => (
            <li key={t}>
              <strong>{i + 1}. {t} :</strong> {d}
            </li>
          ))}
        </ol>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Pourquoi un devis rapide change tout</h2>
        <p className="text-stone-700">
          Les artisans passent environ un quart de leur temps sur l&apos;administratif, souvent le soir. Pendant ce
          temps, le client compare. Le premier devis clair qui arrive a souvent le chantier. jingr vous fait gagner
          ces soirées, sans changer votre façon de travailler : vous gardez vos prix, votre ton et le dernier mot.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Pilote gratuit autour de Lille</h2>
        <p className="text-stone-700">
          Nous cherchons des artisans de la métropole pour tester jingr gratuitement pendant 3 mois et nous dire
          franchement ce qui va et ce qui ne va pas. Ensuite, {PIONEER_PRICE} € HT par mois à vie pour ces pionniers
          (au lieu de {PRICE} €), résiliable en un message. Pas de logiciel à apprendre : tout se passe sur WhatsApp.
          On peut passer vous montrer en 10 minutes.
        </p>
        <p className="text-sm text-stone-500">Nous intervenons notamment à : {villes.join(", ")}.</p>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="font-semibold text-stone-800">Modèles de devis gratuits</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {catalog.map((e) => (
            <Link key={e.slug} href={`/modele-devis/${e.slug}`} className="text-[#7a5bb5] hover:underline">
              {e.title}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
