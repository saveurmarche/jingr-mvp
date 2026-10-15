import Link from "next/link";

/** Numéro WhatsApp jingr au format international sans + (ex. 33612345678). */
export function whatsappStartUrl(text = "Bonjour, je veux tester jingr sur un chantier") {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return num ? `https://wa.me/${num}?text=${encodeURIComponent(text)}` : null;
}

export function StartCta({ label = "Faire mon premier devis gratuit" }: { label?: string }) {
  const wa = whatsappStartUrl();
  return (
    <div className="flex flex-wrap gap-3">
      {wa ? (
        <a href={wa} className="btn-primary inline-block" target="_blank" rel="noopener noreferrer">
          💬 {label} sur WhatsApp
        </a>
      ) : null}
      <Link href="/go" className={wa ? "btn-secondary inline-block" : "btn-primary inline-block"}>
        {wa ? "Ou depuis le navigateur" : label}
      </Link>
    </div>
  );
}
