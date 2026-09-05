import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "jingr — devis chantier en 10 minutes",
  description:
    "On n'envoie pas un logiciel. On envoie un chantier, on reçoit un brouillon de devis.",
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
              <Link href="/go" className="text-stone-600 hover:text-[#6B4EFF]">
                Chantier
              </Link>
              <Link href="/mes-devis" className="text-stone-600 hover:text-[#6B4EFF]">
                Mes devis
              </Link>
              <Link href="/ops" className="text-stone-400 hover:text-stone-600">
                Ops
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pb-10 pt-4 text-center text-xs text-stone-400">
          jingr — brouillon humain, jamais d&apos;envoi automatique au client.
        </footer>
      </body>
    </html>
  );
}
