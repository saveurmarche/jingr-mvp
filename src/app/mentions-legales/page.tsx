import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "Mentions légales — jingr",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <article className="space-y-4 text-stone-700">
      <h1 className="text-3xl font-bold text-stone-900">Mentions légales</h1>
      <section className="space-y-1">
        <h2 className="text-lg font-bold text-stone-900">Éditeur</h2>
        <p>{company.name} — {company.form}</p>
        <p>SIRET : {company.siret}</p>
        <p>Siège : {company.address}</p>
        <p>
          Contact : <a className="text-[#7b5ea7] underline" href={`mailto:${company.email}`}>{company.email}</a>
        </p>
        <p>Directeur de la publication : {company.director}</p>
      </section>
      <section className="space-y-1">
        <h2 className="text-lg font-bold text-stone-900">Hébergement</h2>
        <p>Microsoft Ireland Operations Ltd — One Microsoft Place, South County Business Park, Leopardstown, Dublin 18, Irlande (Microsoft Azure, région France Centre).</p>
      </section>
      <section className="space-y-1">
        <h2 className="text-lg font-bold text-stone-900">Données personnelles</h2>
        <p>
          Voir la <Link className="text-[#7b5ea7] underline" href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </section>
    </article>
  );
}
