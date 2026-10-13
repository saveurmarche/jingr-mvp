import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://jingr.ai"),
  title: "jingr — vos devis et factures d'artisan dictés sur WhatsApp",
  description:
    "Plombiers, chauffagistes : dictez le chantier sur WhatsApp, recevez un devis chiffré à relire en quelques minutes. Facture en un clic. 10 devis offerts.",
  openGraph: { locale: "fr_FR", type: "website", siteName: "jingr" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <header className="border-b border-[#ebe4da] bg-[#F7F4EF]/95 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-[#6B4EFF]">
              jingr
            </Link>
            <nav className="flex gap-3 text-sm">
              <Link href="/#tarifs" className="text-stone-600 hover:text-[#6B4EFF]">
                Tarif
              </Link>
              <Link href="/mes-devis" className="text-stone-600 hover:text-[#6B4EFF]">
                Mes devis
              </Link>
              <Link href="/go" className="font-semibold text-[#6B4EFF]">
                Essayer
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl space-y-2 px-4 pb-10 pt-4 text-center text-xs text-stone-400">
          <p>jingr — devis et factures pour artisans. Rien n&apos;est envoyé à vos clients sans votre validation.</p>
          <p className="space-x-3">
            <Link href="/confidentialite" className="hover:text-stone-600">Confidentialité</Link>
            <Link href="/mentions-legales" className="hover:text-stone-600">Mentions légales</Link>
            <Link href="/facture-electronique-artisan" className="hover:text-stone-600">Facture électronique</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
