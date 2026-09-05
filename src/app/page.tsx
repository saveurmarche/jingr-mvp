import Link from "next/link";
export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="card space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#6B4EFF]">
          Pour les artisans plombiers &amp; chauffagistes
        </p>
        <h1 className="text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
          On ne configure pas jingr.
          <br />
          On envoie un chantier, on reçoit un brouillon.
        </h1>
        <p className="text-stone-600 leading-relaxed">
          Décrivez le chantier (client, adresse, photos ou texte). En ~10 minutes,
          vous obtenez un devis brouillon à relire. Vous validez. Ensuite seulement,
          vous envoyez au client — jamais automatiquement.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/go" className="btn-primary inline-block">
            Commencer → /go
          </Link>
          <Link href="/mes-devis" className="btn-secondary inline-block">
            Mes devis
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["1. Chantier", "Texte, photos de notes, WhatsApp ou formulaire."],
          ["2. Brouillon", "Lignes plomberie, marge, TVA, totaux HT/TTC."],
          ["3. Validation", "Vous corrigez, validez, PDF ou lien WhatsApp."],
        ].map(([t, d]) => (
          <div key={t} className="card">
            <h2 className="font-semibold text-[#6B4EFF]">{t}</h2>
            <p className="mt-1 text-sm text-stone-600">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
