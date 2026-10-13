"use client";

import { useState } from "react";

export function AcceptQuote({
  token,
  acceptedAt,
  acceptedBy,
  company,
}: {
  token: string;
  acceptedAt: string | null;
  acceptedBy: string | null;
  company: string;
}) {
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState<{ at: string; by: string } | null>(
    acceptedAt ? { at: acceptedAt, by: acceptedBy || "" } : null
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/d/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, consent: true }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Erreur");
      setDone({ at: json.accepted_at, by: name });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card border-emerald-200 bg-emerald-50 text-emerald-800">
        ✅ Devis accepté{done.by ? ` par ${done.by}` : ""} le {new Date(done.at).toLocaleDateString("fr-FR")}.
        {" "}{company} a été prévenu et vous recontacte pour fixer la date des travaux.
      </div>
    );
  }

  return (
    <div className="card space-y-3 border-[#c4b5fd]">
      <h2 className="font-semibold text-stone-900">Le devis vous convient ?</h2>
      <input
        className="input"
        placeholder="Vos nom et prénom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="flex items-start gap-2 text-sm text-stone-700">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        Bon pour accord : j&apos;accepte ce devis et ses conditions.
      </label>
      <button className="btn-primary w-full" disabled={busy || !consent || name.trim().length < 2} onClick={accept}>
        {busy ? "…" : "Accepter le devis"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <p className="text-xs text-stone-500">Une question avant d&apos;accepter ? Appelez directement {company}.</p>
    </div>
  );
}
