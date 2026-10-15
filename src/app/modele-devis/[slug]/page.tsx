import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StartCta } from "@/components/Cta";
import { catalog, entryTotals, findEntry } from "@/lib/seo-catalog";

export function generateStaticParams() {
  return catalog.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const e = findEntry((await params).slug);
  if (!e) return {};
  return {
    title: `Modèle de devis ${e.title.toLowerCase()} (${e.metier}) — exemple chiffré 2026`,
    description: `Exemple de devis ${e.metier} détaillé : ${e.short} Lignes, prix HT, TVA applicable et erreurs à éviter.`,
    alternates: { canonical: `/modele-devis/${e.slug}` },
  };
}

/** Page métier à mettre en avant depuis chaque modèle. */
const TRADE_LANDING: Record<string, [string, string]> = {
  plombier: ["/devis-plombier-chauffagiste", "Devis plombier chauffagiste"],
  chauffagiste: ["/devis-plombier-chauffagiste", "Devis plombier chauffagiste"],
  "électricien": ["/devis-electricien", "Devis électricien"],
  menuisier: ["/devis-menuisier", "Devis menuisier"],
  couvreur: ["/devis-couvreur", "Devis couvreur"],
  peintre: ["/devis-peintre-plaquiste-carreleur", "Devis peintre, plaquiste, carreleur"],
  plaquiste: ["/devis-peintre-plaquiste-carreleur", "Devis peintre, plaquiste, carreleur"],
  carreleur: ["/devis-peintre-plaquiste-carreleur", "Devis peintre, plaquiste, carreleur"],
};

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export default async function ModeleDevisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const e = findEntry((await params).slug);
  if (!e) notFound();
  const t = entryTotals(e);
  const others = catalog.filter((o) => o.slug !== e.slug);
  const trade = TRADE_LANDING[e.metier];
  const base = (process.env.APP_URL || "https://jingr.ai").replace(/\/$/, "");
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "jingr", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Modèles de devis", item: `${base}/modele-devis` },
      { "@type": "ListItem", position: 3, name: e.title, item: `${base}/modele-devis/${e.slug}` },
    ],
  };

  return (
    <article className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <nav className="text-sm text-stone-500">
        <Link href="/modele-devis" className="hover:underline">Modèles de devis</Link> ›{" "}
        {trade ? <Link href={trade[0]} className="hover:underline">{trade[1]}</Link> : e.metier}
      </nav>
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#7b5ea7]">
          Modèle de devis {e.metier}
        </p>
        <h1 className="text-3xl font-bold text-stone-900">
          Modèle de devis : {e.title.toLowerCase()}
        </h1>
        <p className="text-stone-600">{e.short}</p>
      </header>

      <section className="card space-y-3 overflow-x-auto">
        <h2 className="font-semibold text-stone-800">Exemple de devis détaillé</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-500">
              <th className="py-1 pr-2">Désignation</th>
              <th className="py-1 pr-2 text-right">Qté</th>
              <th className="py-1 pr-2 text-right">P.U. HT</th>
              <th className="py-1 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {e.lines.map((l) => (
              <tr key={l.label} className="border-t border-[#ebe4da]">
                <td className="py-1.5 pr-2">{l.label}</td>
                <td className="py-1.5 pr-2 text-right">
                  {l.qty} {l.unit}
                </td>
                <td className="py-1.5 pr-2 text-right">{eur(l.pu)}</td>
                <td className="py-1.5 text-right">{eur(l.qty * l.pu)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right text-sm">
          <div>Total HT : <strong>{eur(t.ht)}</strong></div>
          <div>TVA {String(e.tva).replace(".", ",")} % : <strong>{eur(t.tva)}</strong></div>
          <div className="text-base text-[#7b5ea7]">Total TTC : <strong>{eur(t.ttc)}</strong></div>
        </div>
        <p className="text-xs text-stone-500">
          Prix indicatifs pour l&apos;exemple : adaptez-les à vos fournisseurs, votre secteur et votre marge.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-stone-900">Quelle TVA appliquer ?</h2>
        <p className="text-stone-700">{e.tvaNote}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-stone-900">Les erreurs qui coûtent cher</h2>
        <ul className="list-disc space-y-1 pl-5 text-stone-700">
          {e.pitfalls.map((p) => (
            <li key={p}>{p}</li>
          ))}
          <li>Envoyer le devis 3 jours après la visite : le client a déjà signé ailleurs.</li>
        </ul>
      </section>

      <section className="card space-y-4 border-[#c4b5fd]">
        <h2 className="text-xl font-bold text-stone-900">
          Ce devis, en 2 minutes, depuis le chantier
        </h2>
        <p className="text-stone-600">
          Dictez « {e.title.toLowerCase()} chez Mme Martin, 8 rue des Lilas… » depuis votre téléphone.
          jingr vous renvoie ce devis avec vos prix et votre marge, prêt à relire et à envoyer.
          La facture suit en un clic.
        </p>
        <StartCta label="Essayer gratuitement" />
      </section>

      <nav className="space-y-2 text-sm">
        <h2 className="font-semibold text-stone-700">Autres modèles de devis</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {others.map((o) => (
            <Link key={o.slug} href={`/modele-devis/${o.slug}`} className="text-[#7b5ea7] hover:underline">
              {o.title}
            </Link>
          ))}
        </div>
      </nav>
    </article>
  );
}
