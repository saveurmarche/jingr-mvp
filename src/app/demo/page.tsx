import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Démo jingr en 30 secondes : du chantier au devis signé",
  description:
    "Voyez en 30 secondes comment un artisan passe d'un chantier dicté à un devis chiffré avec ses prix, puis accepté en ligne par son client.",
  alternates: { canonical: "/demo" },
};

const PIONEER_SPOTS = process.env.PIONEER_SPOTS || "10";

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#7b5ea7]">Démo · 30 secondes</p>
        <h1 className="text-3xl font-bold text-stone-900">Du chantier au devis signé, sans logiciel</h1>
        <p className="text-stone-600">
          Vous dictez le chantier, jingr prépare le devis avec vos prix. Vous relisez, votre client l&apos;accepte en ligne.
        </p>
      </div>

      <video
        className="mx-auto w-full max-w-[360px] rounded-[2rem] border border-[#e7e0d6] shadow-lg"
        src="/demo/jingr-demo.mp4"
        poster="/demo/jingr-demo.jpg"
        controls
        playsInline
        muted
        autoPlay
        loop
        preload="metadata"
      />

      <ol className="card space-y-2 text-stone-700">
        <li>1. Vous décrivez le chantier : un vocal ou quelques mots.</li>
        <li>2. Le devis arrive chiffré. Un prix que jingr ne connaît pas est marqué « à confirmer », jamais inventé.</li>
        <li>3. Vous validez, votre client reçoit un lien et accepte le devis en ligne.</li>
      </ol>

      <div className="space-y-3 text-center">
        <Link href="/go" className="btn-primary inline-block w-full">
          Essayer sur un vrai chantier
        </Link>
        <Link href="/#beta" className="btn-secondary inline-block w-full">
          Devenir artisan pilote ({PIONEER_SPOTS} places autour de Lille)
        </Link>
        <p className="text-sm text-stone-500">Gratuit pendant le pilote, sans carte bancaire. Une question : 06 88 67 72 94.</p>
      </div>
    </div>
  );
}
