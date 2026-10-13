import Link from "next/link";
import { StartCta } from "@/components/Cta";
import { catalog } from "@/lib/seo-catalog";

const PRICE = process.env.NEXT_PUBLIC_PRICE_MONTHLY || "29";
const FREE = process.env.FREE_DRAFTS || "10";

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

export default function HomePage() {
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
