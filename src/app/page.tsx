import Link from "next/link";
import { StartCta } from "@/components/Cta";
import { BetaForm } from "@/components/BetaForm";
import { LogoMark } from "@/components/Logo";
import { db } from "@/lib/db";
import { catalog } from "@/lib/seo-catalog";

// Les avis approuvés en back-office apparaissent sans redéploiement
export const dynamic = "force-dynamic";

const PRICE = process.env.NEXT_PUBLIC_PRICE_MONTHLY || "49";
const FREE = process.env.FREE_DRAFTS || "10";
const PIONEER_SPOTS = process.env.PIONEER_SPOTS || "20";

const ticker = [
  "Devis avant le concurrent",
  "Vocal WhatsApp · photos · PDF",
  "Votre ton · votre validation",
  "Acceptation en ligne",
  "Facture en un clic",
  "Plombiers & chauffagistes",
  "Basé à Lille",
];

const problems: [string, string, string][] = [
  ["🌙", "La soirée devis", "Une, deux, trois heures le soir, pour un document que le client attendait dès la fin de la visite."],
  ["🏃", "Trop lent = perdu", "Celui qui envoie le devis en premier gagne souvent le chantier. Pas le meilleur : le plus rapide."],
  ["🧰", "Seul à tout faire", "Ouvrier, commercial et secrétaire. Embaucher pour l'administratif n'est pas réaliste, le temps manque déjà."],
  ["📥", "La boîte qui n'attend pas", "Sous un évier, les demandes s'empilent. Répondre tard, c'est laisser le prospect filer."],
];

const steps: { n: number; title: string; text: string; tile: React.ReactNode }[] = [
  {
    n: 1,
    title: "WhatsApp / vocal",
    text: "Dictez le chantier en sortant de chez le client, ou tapez 5 lignes. Ce que vous avez sous la main.",
    tile: (
      <div className="tile tile-green">
        <p className="tile-label !text-emerald-700">WhatsApp</p>
        <p className="mt-1 text-sm text-emerald-900">« Remplacement mitigeur cuisine + raccord cuivre, Mme Dupont, devis pour demain… »</p>
      </div>
    ),
  },
  {
    n: 2,
    title: "Quelques photos",
    text: "Notes de chantier, compteur, pièces, croquis : quelques clichés suffisent pour que jingr comprenne le contexte.",
    tile: (
      <div className="tile tile-peach">
        <div className="flex gap-2 text-2xl">📷 📄 🔧</div>
        <p className="mt-1 text-xs text-[#6f6a7d]">notes · compteur · pièces</p>
      </div>
    ),
  },
  {
    n: 3,
    title: "jingr rédige",
    text: "Un devis chiffré en quelques minutes, dans votre ton (tu ou vous), avec vos postes, vos quantités et votre marge.",
    tile: (
      <div className="tile tile-lav">
        <p className="tile-label !text-[#7a5bb5]">Brouillon · quelques minutes</p>
        <p className="mt-1 text-sm">Devis prêt à relire, votre signature, votre façon de parler.</p>
      </div>
    ),
  },
  {
    n: 4,
    title: "Vous validez, il accepte",
    text: "Sur mobile : relisez, corrigez si besoin, envoyez. Votre client accepte en ligne, vous êtes prévenu.",
    tile: (
      <div className="tile tile-blue">
        <p className="tile-label !text-sky-800">Mobile → client → accepté</p>
        <p className="mt-1 text-sm">Rien ne part sans votre OK.</p>
      </div>
    ),
  },
];

const product: { icon: string; title: string; text: string; points: string[] }[] = [
  {
    icon: "⚡",
    title: "Rapide & mobile",
    text: "Recevoir le devis, l'éditer, l'envoyer, suivre l'historique : tout depuis le téléphone.",
    points: ["Devis en quelques minutes", "Ton personnalisable", "Acceptation en ligne par le client"],
  },
  {
    icon: "🛡️",
    title: "Vous gardez le contrôle",
    text: "Pas d'envoi automatique, pas de prix inventés sans vous. Chaque devis passe par votre validation.",
    points: ["Jamais d'envoi sans votre OK", "Vous restez maître du prix", "Historique des validations"],
  },
  {
    icon: "🧾",
    title: "Factures en règle",
    text: "Chantier terminé : le devis devient facture en un clic, avec les mentions obligatoires.",
    points: ["Numérotation continue", "Mentions légales et TVA justes", "Prêt pour la facture électronique 2027"],
  },
];

const zones = [
  "Lille", "Roubaix", "Tourcoing", "Villeneuve-d'Ascq", "Marcq-en-Barœul", "Lambersart", "Armentières",
  "Wattrelos", "Seclin", "Lens", "Arras", "Béthune", "Douai", "Valenciennes", "Dunkerque", "Cambrai",
  "Maubeuge", "Calais", "Boulogne-sur-Mer", "Saint-Omer", "Hazebrouck", "Liévin", "Hénin-Beaumont", "Amiens",
];

const faq: [string, string][] = [
  ["Je dois installer un logiciel ?", "Non. Vous envoyez un vocal WhatsApp depuis le chantier, comme à un collègue. Le devis arrive par lien, vous le corrigez sur votre téléphone."],
  ["Les prix, c'est les miens ?", "Vous réglez votre marge et votre TVA une fois. Chaque ligne reste modifiable avant validation. Rien ne part chez le client sans vous."],
  ["Comment mon client reçoit le devis ?", "Vous lui envoyez un lien (WhatsApp ou e-mail). Il consulte le devis, le télécharge en PDF et l'accepte en ligne. Vous êtes prévenu tout de suite."],
  ["Et la facture ?", "Chantier terminé : un clic sur « Transformer en facture ». Numérotation, échéance et mentions légales (pénalités, indemnité de 40 €, franchise de TVA si micro) sont ajoutées automatiquement."],
  ["La facture électronique obligatoire, ça me concerne ?", "Oui : depuis septembre 2026 toute entreprise doit pouvoir recevoir des factures électroniques, et les TPE/micro devront en émettre à partir de septembre 2027. jingr prépare vos factures pour passer sur une plateforme agréée le moment venu."],
  ["C'est engageant ?", `Non. Vos ${FREE} premiers devis sont offerts, sans carte bancaire. Ensuite ${PRICE} € HT/mois, résiliable en un message.`],
];

export default async function HomePage() {
  const testimonials = (await db.listTestimonials("approved")).slice(0, 6);

  return (
    <div className="wide space-y-24 pb-8">
      {/* HERO */}
      <section className="relative pt-10 text-center">
        <div className="orb left-[-6rem] top-40 h-72 w-72 bg-[#e6dcf5]" />
        <div className="orb right-[8%] top-24 h-64 w-64 bg-[#f6e6d3] opacity-70" />
        <div className="relative space-y-6">
          <span className="pill">● Devis & factures artisan · Plombiers & chauffagistes · Hauts-de-France</span>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.05] sm:text-6xl">
            Le client a choisi l&apos;autre.
            <br />
            <span className="text-[#7a5bb5]">Son devis était déjà parti.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-[#6f6a7d]">
            Vocal WhatsApp + photos → devis chiffré en quelques minutes, dans votre ton. Vous validez, votre
            client l&apos;accepte en ligne, la facture suit en un clic. Le devis part le jour même, sans y passer
            la soirée.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <StartCta label="Essayer gratuitement" />
            <a href="#process" className="btn-secondary">Voir le parcours ↓</a>
          </div>
          <p className="text-xs text-[#8a8496]">
            Brouillon seulement : <strong>vous validez</strong>. Jamais d&apos;envoi automatique. {FREE} devis offerts,
            sans carte bancaire.
          </p>

          <div className="card mx-auto grid max-w-2xl gap-3 p-4 text-left sm:grid-cols-2">
            <div className="tile tile-green">
              <p className="tile-label !text-emerald-700">WhatsApp · vocal</p>
              <p className="mt-1 text-sm">« Changement chauffe-eau 200 L, rue des Lilas, cliente Mme Martin… »</p>
              <p className="mt-1 text-xs text-[#6f6a7d]">Dicté en sortant du chantier</p>
            </div>
            <div className="tile tile-lav">
              <p className="tile-label !text-[#7a5bb5]">Devis jingr · quelques minutes</p>
              <p className="mt-1 text-sm">Devis n°2026-084 · votre ton</p>
              <p className="mt-1 text-xs text-[#6f6a7d]">À valider sur mobile → PDF</p>
            </div>
            <div className="tile tile-lav">
              <p className="tile-label">Photos</p>
              <p className="mt-1 text-sm">Notes · compteur · pièces · croquis</p>
              <p className="mt-1 text-xs text-[#6f6a7d]">+ 3 photos jointes</p>
            </div>
            <div className="tile tile-blue">
              <p className="tile-label !text-sky-800">Vous → votre client</p>
              <p className="mt-1 text-sm">Relire · corriger · envoyer · accepté ✓</p>
              <p className="mt-1 text-xs text-[#6f6a7d]">Jamais sans votre OK</p>
            </div>
          </div>
        </div>
      </section>

      {/* BANDEAU */}
      <div className="-mx-4 overflow-x-auto border-y border-[#ece7ef] bg-white/80 py-3">
        <div className="flex min-w-max justify-center gap-8 px-4 text-xs font-medium text-[#4a4459]">
          {ticker.map((t) => (
            <span key={t}><span className="text-[#9a7fc6]">•</span> {t}</span>
          ))}
        </div>
      </div>

      {/* PROBLÈME */}
      <section className="space-y-8">
        <div className="max-w-xl space-y-3">
          <p className="eyebrow">Le problème</p>
          <h2 className="text-4xl font-bold leading-tight">Devis trop lent = chantier perdu.</h2>
          <p className="font-light leading-relaxed text-[#6f6a7d]">
            Vous êtes bon sur le terrain. Ce qui casse, c&apos;est la soirée devis : rédiger, reformuler, envoyer.
            Pendant ce temps, le concurrent a déjà répondu.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(([icon, t, d]) => (
            <div key={t} className="card space-y-3">
              <span className="icon-box">{icon}</span>
              <h3 className="font-semibold">{t}</h3>
              <p className="text-sm font-light leading-relaxed text-[#6f6a7d]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="scroll-mt-24 space-y-8">
        <div className="max-w-xl space-y-3">
          <p className="eyebrow">Le process</p>
          <h2 className="text-4xl font-bold leading-tight">
            WhatsApp devis artisan.
            <br />
            Du chantier au devis signé.
          </h2>
          <p className="font-light leading-relaxed text-[#6f6a7d]">
            Pas de logiciel lourd. Vous dictez sur WhatsApp, vous prenez une photo, jingr rédige. Vous validez
            avant tout envoi au client.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card flex flex-col gap-3">
              <span className="step-dot">{s.n}</span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="flex-1 text-sm font-light leading-relaxed text-[#6f6a7d]">{s.text}</p>
              {s.tile}
            </div>
          ))}
        </div>
        <div className="card text-center">
          <p>
            <span className="font-semibold text-[#7a5bb5]">Et la facture ?</span> Chantier terminé : un clic sur
            « Transformer en facture ». Numéro, échéance et mentions légales sont ajoutés pour vous.
          </p>
        </div>
      </section>

      {/* DÉMO */}
      <section id="demo" className="scroll-mt-24 grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="eyebrow">Démo</p>
          <h2 className="text-4xl font-bold leading-tight">Un vocal → un devis prêt à envoyer.</h2>
          <p className="font-light leading-relaxed text-[#6f6a7d]">
            1) un vocal WhatsApp → 2) deux ou trois photos → 3) vous relisez le devis → 4) votre client
            l&apos;accepte en ligne. Sans formation, sans catalogue à configurer.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="chip">1 WhatsApp</span>
            <span className="chip">2 Photos</span>
            <span className="chip">3 Vous validez</span>
            <span className="chip">4 Client accepte</span>
          </div>
          <div className="card space-y-2 text-sm">
            <p className="font-semibold">jingr vs logiciel de devis classique</p>
            <p><strong>Pas d&apos;ERP</strong> : pas de paramétrage, pas de formation. Un assistant de terrain.</p>
            <p><strong>WhatsApp d&apos;abord</strong> : vocal et photos depuis le chantier, le PDF vient après.</p>
            <p><strong>Vous validez</strong> : brouillon seulement, jamais d&apos;envoi automatique au client.</p>
          </div>
          <StartCta label="Tester sur mon prochain chantier" />
        </div>
        <div className="relative flex justify-center">
          <div className="orb h-72 w-72 bg-[#e6dcf5]" />
          <div className="relative w-64 rounded-[2.5rem] bg-[#1b1530] p-3 shadow-2xl">
            <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-[#3a3150]" />
            <div className="space-y-3 rounded-[2rem] bg-[#f8f6f1] p-4">
              <span className="pill !text-[10px]">WhatsApp</span>
              <div className="flex items-center gap-2 border-b border-[#ece7ef] pb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efe9f7]"><LogoMark size={16} /></span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">jingr</p>
                  <p className="text-[10px] text-[#8a8496]">en ligne</p>
                </div>
              </div>
              <div className="tile tile-green text-xs">« Changement chauffe-eau 200 L, Mme Martin, rue des Lilas, ballon HS, accès garage. »</div>
              <div className="tile tile-lav ml-6 text-xs">✅ Devis prêt : 980 € HT. Relisez et validez ici → jingr.ai/review/…</div>
              <div className="tile tile-blue text-xs">🎉 Mme Martin a accepté votre devis.</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUIT */}
      <section id="produit" className="scroll-mt-24 space-y-8">
        <div className="max-w-xl space-y-3">
          <p className="eyebrow">Le produit</p>
          <h2 className="text-4xl font-bold leading-tight">
            Devis rapide, contrôle humain.
            <br />
            Fait pour le terrain.
          </h2>
          <p className="font-light leading-relaxed text-[#6f6a7d]">
            Pensé pour un plombier ou un chauffagiste pressé. L&apos;IA accélère ; vous gardez le prix, le ton et
            le dernier mot.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {product.map((p) => (
            <div key={p.title} className="card space-y-3 p-6">
              <span className="icon-box">{p.icon}</span>
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="text-sm font-light leading-relaxed text-[#6f6a7d]">{p.text}</p>
              <ul className="divide-y divide-[#ece7ef] border-t border-[#ece7ef] text-sm">
                {p.points.map((pt) => (
                  <li key={pt} className="py-2"><span className="text-[#7a5bb5]">✓</span> {pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* AVIS RÉELS (uniquement s'il y en a) */}
      {testimonials.length > 0 ? (
        <section className="space-y-6">
          <div className="max-w-xl space-y-3">
            <p className="eyebrow">Ils l&apos;utilisent</p>
            <h2 className="text-3xl font-bold">Ce que disent les premiers artisans.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="card space-y-2">
                <blockquote>« {t.text} »</blockquote>
                <figcaption className="text-sm text-[#6f6a7d]">
                  {t.display_name} · {t.trade}
                  {t.city ? ` · ${t.city}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs text-[#8a8496]">Avis envoyés par des artisans utilisateurs, publiés avec leur accord.</p>
        </section>
      ) : null}

      {/* ZONES + PIONNIERS */}
      <section id="zones" className="scroll-mt-24 space-y-5">
        <div className="rounded-2xl border border-dashed border-[#d7cbe9] bg-white/60 p-5 text-center text-sm">
          <strong>Bêta ouverte</strong> : les {PIONEER_SPOTS} premiers artisans pionniers ont <strong>3 mois offerts</strong>{" "}
          en échange de leurs retours, avec un accès direct aux fondateurs.{" "}
          <a href="#beta" className="text-[#7a5bb5] underline">Rejoindre la bêta</a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="eyebrow mr-2">Zones bêta</span>
          {zones.map((z) => (
            <span key={z} className="chip">{z}</span>
          ))}
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="scroll-mt-24 space-y-8">
        <div className="max-w-xl space-y-3">
          <p className="eyebrow">Tarifs</p>
          <h2 className="text-4xl font-bold leading-tight">Simple. Sans engagement.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card space-y-3 p-6">
            <p className="font-semibold">Essai</p>
            <p className="text-4xl font-bold">0 €</p>
            <p className="text-sm font-light text-[#6f6a7d]">{FREE} devis offerts, factures incluses. Sans carte bancaire.</p>
          </div>
          <div className="card space-y-3 border-[#cbb9e6] p-6">
            <p className="font-semibold text-[#7a5bb5]">Artisan</p>
            <p className="text-4xl font-bold">
              {PRICE} € <span className="text-base font-normal text-[#6f6a7d]">HT / mois</span>
            </p>
            <p className="text-sm font-light text-[#6f6a7d]">
              Devis et factures illimités, vocaux, photos, acceptation en ligne, PDF à votre nom.
            </p>
            <p className="text-xs text-[#8a8496]">Un chantier gagné rembourse l&apos;année.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 space-y-6">
        <div className="max-w-xl space-y-3">
          <p className="eyebrow">FAQ</p>
          <h2 className="text-4xl font-bold leading-tight">Les questions qu&apos;on nous pose.</h2>
        </div>
        <div className="space-y-2">
          {faq.map(([q, a]) => (
            <details key={q} className="card">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-sm font-light leading-relaxed text-[#6f6a7d]">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* BÊTA */}
      <section id="beta" className="-mx-4 scroll-mt-24 rounded-[2rem] bg-[#efe9f7] px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="flex justify-center"><LogoMark size={40} /></div>
          <h2 className="text-4xl font-bold leading-tight sm:text-5xl">
            Rejoindre la bêta
            <br />
            devis avant l&apos;autre
          </h2>
          <p className="font-light leading-relaxed text-[#6f6a7d]">
            Plombiers, chauffagistes, artisans du bâtiment… Si un devis trop lent vous coûte des chantiers,
            parlons-en. 20 minutes, réponse sous 24 heures ouvrées.
          </p>
          <p className="text-sm text-[#6f6a7d]">
            Pressé ? <Link href="/go" className="text-[#7a5bb5] underline">Testez tout de suite sur un chantier</Link>.
          </p>
          <BetaForm />
          <div className="mx-auto grid max-w-lg gap-3 pt-4 text-left sm:grid-cols-3">
            <div className="card p-4"><p className="tile-label">Réponse sous</p><p className="text-sm">24 heures ouvrées</p></div>
            <div className="card p-4"><p className="tile-label">Basé à</p><p className="text-sm">Lille</p></div>
            <div className="card p-4">
              <p className="tile-label">Écrire à</p>
              <a href="mailto:contact@jingr.ai" className="text-sm text-[#7a5bb5]">contact@jingr.ai</a>
            </div>
          </div>
        </div>
      </section>

      {/* MODÈLES (SEO) */}
      <section className="space-y-2 text-sm">
        <p className="eyebrow">Modèles de devis gratuits</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {catalog.map((e) => (
            <Link key={e.slug} href={`/modele-devis/${e.slug}`} className="text-[#7a5bb5] hover:underline">
              {e.title}
            </Link>
          ))}
          <Link href="/facture-electronique-artisan" className="text-[#7a5bb5] hover:underline">
            Facture électronique 2026-2027 : guide artisan
          </Link>
        </div>
      </section>
    </div>
  );
}
