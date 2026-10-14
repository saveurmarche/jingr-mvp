import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StartCta } from "@/components/Cta";
import { catalog } from "@/lib/seo-catalog";
import { findLanding, landings } from "@/lib/seo-landings";

export const dynamicParams = false;

export function generateStaticParams() {
  return landings.map((l) => ({ landing: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ landing: string }> }): Promise<Metadata> {
  const l = findLanding((await params).landing);
  if (!l) return {};
  return { title: l.title, description: l.description, alternates: { canonical: `/${l.slug}` } };
}

export default async function LandingPage({ params }: { params: Promise<{ landing: string }> }) {
  const l = findLanding((await params).landing);
  if (!l) notFound();
  const templates = catalog.filter((e) => l.templates?.includes(e.slug));
  const others = landings.filter((o) => o.slug !== l.slug);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: l.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <article className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#7b5ea7]">{l.eyebrow}</p>
        <h1 className="text-3xl font-bold text-stone-900">{l.h1}</h1>
        <p className="text-stone-600">{l.intro}</p>
        <StartCta />
      </header>

      {l.sections.map((s) => (
        <section key={s.h2} className="card space-y-3">
          <h2 className="text-xl font-bold text-stone-900">{s.h2}</h2>
          {s.body.map((p) => (
            <p key={p} className="text-stone-700">{p}</p>
          ))}
        </section>
      ))}

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-stone-900">Questions fréquentes</h2>
        {l.faq.map(([q, a]) => (
          <details key={q} className="card">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-sm text-stone-600">{a}</p>
          </details>
        ))}
      </section>

      {templates.length ? (
        <section className="space-y-2 text-sm">
          <h2 className="font-semibold text-stone-800">Modèles de devis gratuits</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {templates.map((e) => (
              <Link key={e.slug} href={`/modele-devis/${e.slug}`} className="text-[#7a5bb5] hover:underline">
                {e.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card space-y-2">
        <h2 className="font-semibold text-stone-800">Une petite équipe à Lille</h2>
        <p className="text-sm text-stone-600">
          jingr est construit avec des artisans de la métropole lilloise. On peut passer vous montrer en 10 minutes,
          sur un de vos chantiers. <Link href="/logiciel-devis-artisan-lille" className="text-[#7a5bb5] underline">En savoir plus</Link>
        </p>
      </section>

      <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {others.map((o) => (
          <Link key={o.slug} href={`/${o.slug}`} className="text-[#7a5bb5] hover:underline">
            {o.eyebrow}
          </Link>
        ))}
      </nav>
    </article>
  );
}
