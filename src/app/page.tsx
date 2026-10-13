import Link from "next/link";
import { StartCta } from "@/components/Cta";
import { db } from "@/lib/db";
import { catalog } from "@/lib/seo-catalog";

// Les avis approuvés en back-office apparaissent sans redéploiement
export const dynamic = "force-dynamic";

const PRICE = process.env.NEXT_PUBLIC_PRICE_MONTHLY || "29";
const FREE = process.env.FREE_DRAFTS || "10";
const PIONEER_SPOTS = process.env.PIONEER_SPOTS || "20";

const benefits: [string, string, string][] = [
  ["🌙", "Vos soirées vous reviennent", "Le devis se fait sur le chantier, en dictant. Plus de paperasse à 22h après la journée."],
  ["⚡", "Vous passez avant les autres", "Devis envoyé le jour même de la visite, pendant que le client a encore le chantier en tête."],
  ["✅", "Des factures en règle", "Numérotation continue, mentions obligatoires, TVA juste. Prêt pour la facture électronique 2027."],
  ["📱", "Rien à apprendre", "Ça se passe sur WhatsApp, que vous utilisez déjà. Pas de logiciel, pas de catalogue à configurer."],
];

const comparison: [string, string, string, string][] = [
  ["Saisie du devis", "À la main", "Articles à choisir dans un catalogue", "Un vocal de 30 secondes"],
  ["Où", "Au bureau, le soir", "Sur l'ordinateur ou une appli", "Sur WhatsApp, depuis le chantier"],
  ["Mise en route", "—", "Paramétrage, formation", "Un premier message"],
  ["Facture", "Copier-coller du devis", "Oui", "Un clic depuis le devis"],
  ["Prix", "« Gratuit »… et vos soirées", "Abonnement + temps de paramétrage", `${process.env.NEXT_PUBLIC_PRICE_MONTHLY || "29"} € HT/mois`],
];

const faq: [string, string][] = [
  [
    "Je dois installer un logiciel ?",
    "Non. Vous envoyez un vocal WhatsApp depuis le chantier, comme à un collègue. Le devis arrive par lien, vous le corrigez sur votre téléphone.",
  ],
  [
    "Les prix, c'est les miens ?",
    "Vous réglez votre marge et votre TVA une fois. Chaque devis reste modifiable ligne par ligne avant validation. Rien ne part chez le client sans vous.",
  ],
  [
    "Et la facture ?",
    "Une fois le chantier terminé : un clic sur « Transformer en facture ». Numérotation continue, échéance et mentions légales (pénalités, indemnité de 40 €, franchise de TVA si micro) ajoutées automatiquement.",
  ],
  [
    "La facture électronique obligatoire, ça me concerne ?",
    "Oui : depuis septembre 2026 toute entreprise doit pouvoir recevoir des factures électroniques, et les TPE/micro devront en émettre à partir de septembre 2027. jingr prépare vos factures dans un format structuré pour passer sur une plateforme agréée le moment venu.",
  ],
  [
    "C'est engageant ?",
    `Non. Vos ${FREE} premiers devis sont offerts, sans carte bancaire. Ensuite ${PRICE} € HT/mois, résiliable en un message.`,
  ],
];

export default async function HomePage() {
  const testimonials = (await db.listTestimonials("approved")).slice(0, 6);
  return (
    <div className="space-y-10">
      <section className="card space-y-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#6B4EFF]">
          Plombiers · chauffagistes · artisans du bâtiment
        </p>
        <h1 className="text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
          Un vocal depuis le chantier.
          <br />
          Votre devis prêt avant d&apos;être remonté dans le camion.
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed">
          Fini les devis le soir à 22h. Dictez le chantier sur WhatsApp, jingr vous renvoie
          un devis chiffré et propre à relire. Chantier fini ? La facture se fait en un clic.
        </p>
        <StartCta />
        <p className="text-sm text-stone-500">
          {FREE} devis offerts · sans carte bancaire · rien n&apos;est envoyé à votre client sans vous
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Ce que vous envoyez → ce que vous recevez</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card space-y-2">
            <p className="text-xs font-semibold uppercase text-stone-400">🎙️ Votre vocal (32 s)</p>
            <p className="italic text-stone-700">
              « Mme Dupont, 12 rue Victor Hugo à Lyon 3e. Cumulus 200 litres qui fuit, il a 15 ans,
              on le remplace. Groupe de sécu à changer aussi. Accès facile, cellier au rez-de-chaussée. »
            </p>
          </div>
          <div className="card space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase text-stone-400">📄 Votre devis (3 min plus tard)</p>
            <ul className="space-y-1 text-stone-700">
              <li>Dépose et évacuation ancien chauffe-eau</li>
              <li>Chauffe-eau électrique 200 L vertical mural</li>
              <li>Groupe de sécurité + siphon + flexibles inox</li>
              <li>Pose, raccordements, mise en service</li>
            </ul>
            <p className="pt-2 font-semibold text-[#6B4EFF]">980 € HT · TVA 10 % · 1 078 € TTC</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["1. Vous dictez", "Vocal, texte ou photo de vos notes, sur WhatsApp. Pas d'appli à installer."],
          ["2. Vous relisez", "Devis chiffré avec votre marge et votre TVA. Vous corrigez sur le téléphone, vous validez."],
          ["3. Vous facturez", "PDF pro avec « Bon pour accord ». Chantier fini : facture en un clic, mentions légales incluses."],
        ].map(([t, d]) => (
          <div key={t} className="card">
            <h3 className="font-semibold text-[#6B4EFF]">{t}</h3>
            <p className="mt-1 text-sm text-stone-600">{d}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">
          jingr transforme un vocal de chantier en devis chiffré, puis en facture conforme
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map(([icon, t, d]) => (
            <div key={t} className="card flex gap-3">
              <span className="text-2xl" aria-hidden>{icon}</span>
              <div>
                <h3 className="font-semibold text-stone-900">{t}</h3>
                <p className="mt-1 text-sm text-stone-600">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Pourquoi pas Word ou un logiciel de devis ?</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3"></th>
                <th className="p-3 text-[#6B4EFF]">jingr</th>
                <th className="p-3 text-stone-500">Word / Excel</th>
                <th className="p-3 text-stone-500">Logiciel de devis</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([label, a, b, c]) => (
                <tr key={label} className="border-t border-[#ebe4da]">
                  <td className="p-3 font-semibold text-stone-700">{label}</td>
                  <td className="p-3 font-semibold text-stone-900 bg-[#faf8ff]">{c}</td>
                  <td className="p-3 text-stone-600">{a}</td>
                  <td className="p-3 text-stone-600">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">Ils l&apos;utilisent sur leurs chantiers</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.id} className="card space-y-2">
                <blockquote className="text-stone-800">« {t.text} »</blockquote>
                <figcaption className="text-sm text-stone-500">
                  {t.display_name} — {t.trade}
                  {t.city ? `, ${t.city}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs text-stone-400">
            Avis envoyés par des artisans utilisateurs de jingr, publiés avec leur accord.
          </p>
        </section>
      ) : (
        <section className="card space-y-3 border-[#c4b5fd] bg-[#faf8ff]">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6B4EFF]">
            Programme artisans pionniers
          </p>
          <h2 className="text-xl font-bold text-stone-900">
            jingr démarre. Construisez-le avec nous.
          </h2>
          <p className="text-stone-700">
            Les {PIONEER_SPOTS} premiers artisans ont <strong>3 mois offerts</strong> en échange de
            leurs retours : ce qui manque, ce qui gêne, les lignes de devis à corriger. Vous avez
            un accès direct aux fondateurs, sur WhatsApp.
          </p>
          <StartCta label="Devenir artisan pionnier" />
        </section>
      )}

      <section id="tarifs" className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Tarif</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card space-y-2">
            <p className="font-semibold text-stone-800">Essai</p>
            <p className="text-3xl font-bold">0 €</p>
            <p className="text-sm text-stone-600">{FREE} devis offerts, factures incluses. Sans carte bancaire.</p>
          </div>
          <div className="card space-y-2 border-[#c4b5fd]">
            <p className="font-semibold text-[#6B4EFF]">Artisan</p>
            <p className="text-3xl font-bold">
              {PRICE} € <span className="text-base font-normal text-stone-500">HT / mois</span>
            </p>
            <p className="text-sm text-stone-600">
              Devis et factures illimités, vocaux, photos, PDF à votre nom. Sans engagement.
            </p>
            <p className="text-xs text-stone-500">Un devis gagné rembourse l&apos;année.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Questions fréquentes</h2>
        <div className="space-y-2">
          {faq.map(([q, a]) => (
            <details key={q} className="card">
              <summary className="cursor-pointer font-semibold text-stone-800">{q}</summary>
              <p className="mt-2 text-sm text-stone-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="card space-y-4 text-center">
        <h2 className="text-xl font-bold text-stone-900">Essayez sur votre prochain chantier</h2>
        <div className="flex justify-center">
          <StartCta />
        </div>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="font-semibold text-stone-700">Modèles de devis gratuits</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {catalog.map((e) => (
            <Link key={e.slug} href={`/modele-devis/${e.slug}`} className="text-[#6B4EFF] hover:underline">
              {e.title}
            </Link>
          ))}
          <Link href="/facture-electronique-artisan" className="text-[#6B4EFF] hover:underline">
            Facture électronique 2026-2027 : guide artisan
          </Link>
        </div>
      </section>
    </div>
  );
}
