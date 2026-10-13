import type { Metadata } from "next";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Politique de confidentialité — jingr",
  description: "Quelles données jingr traite, pourquoi, combien de temps, et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
};

const UPDATED = "13 octobre 2026";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-xl font-bold text-stone-900">{children}</h2>;
}

export default function ConfidentialitePage() {
  return (
    <article className="space-y-3 text-stone-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-stone-900">Politique de confidentialité</h1>
      <p className="text-sm text-stone-500">Dernière mise à jour : {UPDATED}</p>

      <p>
        jingr aide les artisans à produire leurs devis et factures à partir d&apos;un message
        WhatsApp ou du site. Cette page explique, simplement, ce que nous faisons de vos données.
      </p>

      <H2>1. Qui est responsable ?</H2>
      <p>
        {company.name} ({company.form}), SIRET {company.siret}, {company.address}.
        Contact : <a className="text-[#6B4EFF] underline" href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
      <p>Deux situations différentes :</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Vos données d&apos;artisan</strong> (compte, entreprise, usage) : jingr en est{" "}
          <strong>responsable de traitement</strong>.
        </li>
        <li>
          <strong>Les données de vos clients</strong> que vous nous transmettez (nom, adresse,
          téléphone, description du chantier) : c&apos;est <strong>vous</strong> qui en êtes
          responsable ; jingr agit comme <strong>sous-traitant</strong> et ne les utilise que pour
          produire vos devis et factures.
        </li>
      </ul>

      <H2>2. Quelles données ?</H2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Votre numéro WhatsApp, votre nom de profil WhatsApp, et ce que vous renseignez : entreprise, SIRET, adresse, marge, TVA.</li>
        <li>Le contenu des chantiers que vous envoyez : texte, transcription de vos vocaux, photos.</li>
        <li>Les devis et factures produits, et leur historique (création, validation, paiement).</li>
        <li>Les avis que vous choisissez de nous laisser (« AVIS : … »).</li>
        <li>Pour l&apos;abonnement : les informations de paiement sont traitées par Stripe ; nous ne voyons jamais votre numéro de carte.</li>
      </ul>
      <p>
        <strong>Vos vocaux ne sont pas conservés</strong> : ils sont transcrits puis seul le texte
        est gardé.
      </p>

      <H2>3. Pourquoi, et sur quelle base ?</H2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Produire vos devis et factures et vous répondre sur WhatsApp : <em>exécution du contrat</em>.</li>
        <li>Facturer l&apos;abonnement et tenir notre comptabilité : <em>obligation légale</em>.</li>
        <li>Améliorer le service (qualité des devis, erreurs) et sécuriser la plateforme : <em>intérêt légitime</em>.</li>
        <li>Publier votre avis sur le site : <em>votre consentement</em>, retirable à tout moment en écrivant « RETIRER AVIS ».</li>
        <li>Vous écrire sur une nouveauté utile à votre activité : <em>intérêt légitime</em>, avec désinscription en un clic.</li>
      </ul>
      <p>Nous ne vendons ni ne louons aucune donnée. Aucune publicité n&apos;est affichée.</p>

      <H2>4. Qui y a accès ?</H2>
      <p>L&apos;équipe jingr, pour le support, et ces prestataires techniques :</p>
      <ul className="list-disc space-y-1 pl-5">
        <li><strong>Microsoft Azure</strong> : hébergement, région France Centre.</li>
        <li><strong>Meta (WhatsApp Business)</strong> : acheminement des messages.</li>
        <li>
          <strong>OpenAI</strong> : transcription des vocaux et rédaction des brouillons de devis.
          Les données transmises par API ne servent pas à entraîner leurs modèles. Ce traitement
          peut avoir lieu aux États-Unis, encadré par les clauses contractuelles types de la
          Commission européenne.
        </li>
        <li><strong>Stripe</strong> : paiement de l&apos;abonnement.</li>
      </ul>

      <H2>5. Combien de temps ?</H2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Compte et chantiers : tant que vous utilisez jingr, puis 12 mois après votre dernier message, sauf demande de suppression.</li>
        <li>
          Factures : la loi impose à <strong>l&apos;émetteur</strong> (vous) de les conserver 10 ans.
          Nous vous laissons les télécharger avant toute suppression de compte.
        </li>
        <li>Facturation de votre abonnement : 10 ans (obligation comptable).</li>
        <li>Journaux techniques de sécurité : 12 mois maximum.</li>
      </ul>

      <H2>6. Vos droits</H2>
      <p>
        Vous pouvez accéder à vos données, les corriger, les exporter, les supprimer, vous opposer
        à un traitement ou en demander la limitation. Écrivez à{" "}
        <a className="text-[#6B4EFF] underline" href={`mailto:${company.email}`}>{company.email}</a>{" "}
        ou envoyez « SUPPRIMER MON COMPTE » sur WhatsApp. Réponse sous un mois.
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL
        (<a className="text-[#6B4EFF] underline" href="https://www.cnil.fr/fr/plaintes">cnil.fr/plaintes</a>).
      </p>
      <p>
        Les clients de nos artisans qui souhaitent exercer leurs droits s&apos;adressent à
        l&apos;artisan concerné ; nous l&apos;aidons à y répondre.
      </p>

      <H2>7. Sécurité</H2>
      <p>
        Connexions chiffrées (HTTPS), messages WhatsApp authentifiés par signature, accès
        d&apos;administration protégés. Chaque devis est accessible par un lien unique et non
        devinable : ne le partagez qu&apos;avec des personnes de confiance.
      </p>

      <H2>8. Cookies</H2>
      <p>
        jingr n&apos;utilise aucun cookie publicitaire ni de mesure d&apos;audience tiers. Seuls des
        éléments strictement nécessaires au fonctionnement du site peuvent être déposés.
      </p>

      <H2>9. Modifications</H2>
      <p>
        En cas de changement important, nous vous prévenons sur WhatsApp avant qu&apos;il
        s&apos;applique.
      </p>
    </article>
  );
}
