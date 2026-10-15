import type { Metadata } from "next";
import { StartCta } from "@/components/Cta";

export const metadata: Metadata = {
  title: "Facture électronique obligatoire : ce qui change pour les artisans (2026-2027)",
  description:
    "Plombiers, chauffagistes, artisans du bâtiment : calendrier de la facture électronique, ce que vous devez faire dès maintenant et comment s'y préparer sans changer vos habitudes.",
  alternates: { canonical: "/facture-electronique-artisan" },
};

export default function FactureElectroniquePage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#7b5ea7]">Guide artisan</p>
        <h1 className="text-3xl font-bold text-stone-900">
          Facture électronique obligatoire : ce qui change pour les artisans
        </h1>
        <p className="text-stone-600">
          La réforme concerne toutes les entreprises assujetties à la TVA en France, y compris
          les micro-entreprises. Voici l&apos;essentiel, sans jargon.
        </p>
      </header>

      <section className="card space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Le calendrier</h2>
        <ul className="list-disc space-y-2 pl-5 text-stone-700">
          <li>
            <strong>1er septembre 2026</strong> : toutes les entreprises doivent pouvoir{" "}
            <strong>recevoir</strong> des factures électroniques de leurs fournisseurs (négoces,
            grossistes…) via une plateforme agréée.
          </li>
          <li>
            <strong>1er septembre 2027</strong> : les TPE, PME et micro-entreprises doivent{" "}
            <strong>émettre</strong> leurs factures entre professionnels au format électronique,
            et transmettre leurs données de vente aux particuliers (e-reporting).
          </li>
        </ul>
        <p className="text-xs text-stone-500">
          Calendrier en vigueur à la date de publication — vérifiez sur impots.gouv.fr.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-stone-900">Un PDF envoyé par mail, ça ne suffira plus</h2>
        <p className="text-stone-700">
          Une facture électronique est un fichier structuré (Factur-X, UBL ou CII) transmis par une
          plateforme agréée. Un PDF fait sous Word ou Excel ne sera plus une facture valable entre
          professionnels.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-stone-900">Ce que vous pouvez faire dès maintenant</h2>
        <ol className="list-decimal space-y-1 pl-5 text-stone-700">
          <li>Choisir une plateforme agréée pour recevoir les factures de vos fournisseurs.</li>
          <li>Arrêter les devis et factures sous Word/Excel : numérotation continue, mentions obligatoires.</li>
          <li>Garder des données propres : SIRET client, adresse, détail des lignes, taux de TVA.</li>
        </ol>
      </section>

      <section className="card space-y-4 border-[#c4b5fd]">
        <h2 className="text-xl font-bold text-stone-900">Avec jingr, vous êtes déjà sur de bons rails</h2>
        <p className="text-stone-600">
          Devis dicté depuis le chantier, facture en un clic avec numérotation et mentions légales,
          données structurées prêtes pour la plateforme agréée.
        </p>
        <StartCta label="Essayer gratuitement" />
      </section>
    </article>
  );
}
