"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type JobRow = {
  id: string;
  client_name: string;
  description: string;
  status: string;
  created_at: string;
  draft: {
    id: string;
    title: string;
    status: string;
    total_ht: number;
    total_ttc: number;
  } | null;
  review_url: string | null;
};

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    received: "Reçu",
    processing: "En cours",
    draft_ready: "Brouillon prêt",
    validated: "Validé",
    error: "Erreur",
    draft: "Brouillon",
    sent: "Envoyé",
  };
  return map[s] || s;
}

export default function MesDevisPage() {
  const [phone, setPhone] = useState("");
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setJobs(null);
    setSentMsg(null);
    try {
      const res = await fetch(`/api/mes-devis?phone=${encodeURIComponent(phone)}`);
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Erreur");
        return;
      }
      if (json.sent) {
        setSentMsg(json.message);
        return;
      }
      setJobs(json.jobs);
    } catch {
      setError("Réseau indisponible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Mes devis</h1>
        <p className="mt-1 text-stone-600">
          Entrez votre numéro : vous recevez la liste de vos devis sur WhatsApp.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="phone">Téléphone</label>
          <input
            className="input"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
            required
          />
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Recherche…" : "Voir mes devis"}
        </button>
      </form>

      {error ? (
        <div className="card border-red-200 text-red-700">{error}</div>
      ) : null}

      {sentMsg ? (
        <div className="card border-[#c4b5fd] text-stone-700">📲 {sentMsg}</div>
      ) : null}

      {jobs ? (
        jobs.length === 0 ? (
          <div className="card text-stone-600">
            Aucun devis pour ce numéro.{" "}
            <Link href="/go" className="text-[#6B4EFF] underline">
              Créer un chantier
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="card space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-stone-900">{j.client_name}</p>
                    <p className="text-sm text-stone-600 line-clamp-2">{j.description}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {new Date(j.created_at).toLocaleString("fr-FR")} ·{" "}
                      {statusLabel(j.status)}
                      {j.draft ? ` · devis ${statusLabel(j.draft.status)}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {j.draft ? (
                      <p className="font-semibold text-[#6B4EFF]">
                        {eur(j.draft.total_ttc)} TTC
                      </p>
                    ) : (
                      <p className="text-amber-700">Pas de brouillon</p>
                    )}
                  </div>
                </div>
                {j.review_url ? (
                  <Link href={j.review_url} className="btn-secondary inline-block text-sm py-2">
                    Ouvrir la revue
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
