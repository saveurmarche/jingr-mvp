import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PageHit } from "@/components/PageHit";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://jingr.ai"),
  title: "jingr — le devis part avant celui du concurrent",
  description:
    "Artisans du bâtiment, sans logiciel à apprendre : un vocal depuis le chantier, un devis chiffré avec vos prix, signé en ligne par votre client, la facture en un clic. Une équipe à Lille.",
  openGraph: { locale: "fr_FR", type: "website", siteName: "jingr" },
};

/** Fiche « organisation » pour Google et les moteurs IA. SAME_AS : URLs des profils (LinkedIn…), séparées par des virgules. */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "jingr",
  url: process.env.APP_URL || "https://jingr.ai",
  logo: `${process.env.APP_URL || "https://jingr.ai"}/opengraph-image.png`,
  email: "contact@jingr.ai",
  telephone: "+33688677294",
  description:
    "Outil de devis et factures pour les artisans du bâtiment : un vocal depuis le chantier, un devis chiffré avec les prix de l'artisan, signé en ligne par le client.",
  address: { "@type": "PostalAddress", addressLocality: "Lille", addressRegion: "Hauts-de-France", addressCountry: "FR" },
  areaServed: ["Lille", "Roubaix", "Tourcoing", "Villeneuve-d'Ascq", "Marcq-en-Barœul", "France"],
  sameAs: (process.env.SAME_AS || "").split(",").map((u) => u.trim()).filter(Boolean),
};

const nav: [string, string][] = [
  ["Produit", "/#produit"],
  ["Process", "/#process"],
  ["Démo", "/#demo"],
  ["Zones", "/#zones"],
  ["Tarifs", "/#tarifs"],
  ["FAQ", "/#faq"],
  ["Bêta", "/#beta"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <PageHit />
        <header className="sticky top-0 z-20 border-b border-[#ece7ef] bg-[#f8f6f1]/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Logo />
            <nav className="hidden gap-6 text-sm text-[#4a4459] md:flex">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="hover:text-[#7a5bb5]">
                  {label}
                </Link>
              ))}
            </nav>
            <Link href="/go" className="btn-primary !px-4 !py-2 text-sm">
              Essayer
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-[#ece7ef] bg-[#f8f6f1]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-[#6f6a7d]">
            <Logo />
            <nav className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/#demo" className="hover:text-[#7a5bb5]">Démo</Link>
              <Link href="/#zones" className="hover:text-[#7a5bb5]">Zones</Link>
              <Link href="/#faq" className="hover:text-[#7a5bb5]">FAQ</Link>
              <Link href="/#beta" className="hover:text-[#7a5bb5]">Bêta</Link>
              <Link href="/go" className="hover:text-[#7a5bb5]">/go</Link>
              <Link href="/mes-devis" className="hover:text-[#7a5bb5]">Mes devis</Link>
              <Link href="/devis-whatsapp-artisan" className="hover:text-[#7a5bb5]">Devis WhatsApp</Link>
              <Link href="/devis-artisan-sans-logiciel" className="hover:text-[#7a5bb5]">Sans logiciel</Link>
              <Link href="/devis-ia-artisan" className="hover:text-[#7a5bb5]">Devis par IA</Link>
              <Link href="/demo" className="hover:text-[#7a5bb5]">Démo 30 s</Link>
              <Link href="/modele-devis" className="hover:text-[#7a5bb5]">Modèles de devis</Link>
              <Link href="/devis-plombier-chauffagiste" className="hover:text-[#7a5bb5]">Plombiers</Link>
              <Link href="/devis-electricien" className="hover:text-[#7a5bb5]">Électriciens</Link>
              <Link href="/logiciel-devis-artisan-lille" className="hover:text-[#7a5bb5]">Lille</Link>
              <Link href="/facture-electronique-artisan" className="hover:text-[#7a5bb5]">Facture électronique</Link>
              <span>© {new Date().getFullYear()} jingr.ai</span>
              <Link href="/mentions-legales" className="hover:text-[#7a5bb5]">Mentions légales</Link>
              <Link href="/confidentialite" className="hover:text-[#7a5bb5]">Confidentialité / RGPD</Link>
              <a href="mailto:contact@jingr.ai" className="hover:text-[#7a5bb5]">contact@jingr.ai</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
