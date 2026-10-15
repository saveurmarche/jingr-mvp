import type { Metadata } from "next";
import Link from "next/link";
import { StartCta } from "@/components/Cta";
import { catalog, entryTotals } from "@/lib/seo-catalog";

export const metadata: Metadata = {
  title: "Modèles de devis artisan gratuits : exemples chiffrés par métier (2026)",
  description:
    "Modèles de devis gratuits pour plombiers, chauffagistes, électriciens, menuisiers, couvreurs, peintres, carreleurs et plaquistes : lignes détaillées, prix HT indicatifs, TVA applicable et erreurs à éviter.",
  alternates: { canonical: "/modele-devis" },
};

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export default function ModelesDevisIndex() {
  const trades = [...new Set(catalog.map((e) => e.metier))];
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#7b5ea7]">Modèles de devis gratuits</p>
        <h1 className="text-3xl font-bold text-stone-900">Modèles de devis artisan, par métier</h1>
        <p className="text-stone-600">
          Des exemples de devis détaillés, ligne par ligne, avec des prix HT indicatifs, la TVA applicable et les
          oublis classiques à éviter. Les prix sont des repères : adaptez-les à votre tarif et à votre région.
        </p>
      </header>

      {trades.map((t) => (
        <section key={t} className="space-y-3">
          <h2 className="text-xl font-bold capitalize text-stone-900">{t}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog
              .filter((e) => e.metier === t)
              .map((e) => (
                <Link key={e.slug} href={`/modele-devis/${e.slug}`} className="card block space-y-1 hover:border-[#c4b5fd]">
                  <p className="font-semibold text-stone-900">{e.title}</p>
                  <p className="text-sm text-stone-600">{e.short}</p>
                  <p className="text-sm text-[#7b5ea7]">Exemple : {eur(entryTotals(e).ht)} HT · TVA {e.tva} %</p>
                </Link>
              ))}
          </div>
        </section>
      ))}

      <section className="card space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Le même devis, avec vos prix, en 2 minutes</h2>
        <p className="text-stone-600">
          Dictez votre chantier depuis votre téléphone : jingr prépare le devis avec votre tarif, marque « à confirmer »
          ce qu&apos;il ne connaît pas, et votre client l&apos;accepte en ligne.
        </p>
        <StartCta label="Essayer sur un vrai chantier" />
      </section>
    </article>
  );
}
