"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SOFTWARE_OPTIONS } from "@/lib/billing-software";

export function BetaForm() {
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setState(null);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(
      [...fd.entries()].map(([k, v]) => [k, String(v)]).filter(([, v]) => v !== "")
    );
    try {
      const res = await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setState({ ok: json.ok, msg: json.ok ? json.message : json.error });
      if (json.ok) e.currentTarget.reset();
    } catch {
      setState({ ok: false, msg: "Réseau indisponible, réessayez dans un instant." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-lg space-y-3 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" name="first_name" placeholder="Prénom *" required autoComplete="given-name" />
        <input className="input" name="last_name" placeholder="Nom" autoComplete="family-name" />
      </div>
      <input className="input" name="email" type="email" placeholder="votre@email.fr *" required autoComplete="email" />
      <input className="input" name="trade" placeholder="Métier (ex : plombier, chauffagiste…)" />
      <input className="input" name="phone" type="tel" placeholder="Téléphone (optionnel)" autoComplete="tel" />
      <select className="input" name="software" defaultValue="">
        <option value="">Vos devis et factures aujourd&apos;hui ?</option>
        {SOFTWARE_OPTIONS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <textarea
        className="input min-h-28"
        name="message"
        placeholder="Combien de devis par semaine ? Les soirées devis, ça vous parle ?"
      />
      {/* Champ piège anti-robots, invisible pour les humains */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <p className="text-xs text-[#6f6a7d]">
        En envoyant, vous acceptez d&apos;être recontacté au sujet de la bêta. Données traitées conformément
        à notre{" "}
        <Link href="/confidentialite" className="text-[#7a5bb5] underline">politique de confidentialité</Link>.
      </p>
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "Envoi…" : "Rejoindre la bêta →"}
      </button>
      {state ? (
        <p className={`text-center text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}>{state.msg}</p>
      ) : null}
    </form>
  );
}
