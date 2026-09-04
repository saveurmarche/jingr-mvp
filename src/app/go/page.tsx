"use client";

import { FormEvent, useState } from "react";

type Result = {
  ok: boolean;
  job_id?: string;
  review_url?: string | null;
  error?: string;
};

export default function GoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      artisan_name: String(fd.get("artisan_name") || ""),
      artisan_phone: String(fd.get("artisan_phone") || ""),
      company_name: String(fd.get("company_name") || "") || undefined,
      client_name: String(fd.get("client_name") || ""),
      client_address: String(fd.get("client_address") || "") || undefined,
      client_phone: String(fd.get("client_phone") || "") || undefined,
      description: String(fd.get("description") || ""),
      urgency: String(fd.get("urgency") || "") || undefined,
      source: "web",
      auto_draft: true,
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as Result;
      setResult(json);
    } catch {
      setResult({ ok: false, error: "Réseau indisponible" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Envoyer un chantier</h1>
        <p className="mt-1 text-stone-600">
          Mobile-first. Pas de configuration. Un brouillon de devis en retour.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4">
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-[#6B4EFF]">
            Vous (artisan)
          </legend>
          <div>
            <label className="label" htmlFor="artisan_name">Nom</label>
            <input className="input" id="artisan_name" name="artisan_name" required placeholder="Jean Martin" />
          </div>
          <div>
            <label className="label" htmlFor="artisan_phone">Téléphone</label>
            <input className="input" id="artisan_phone" name="artisan_phone" required placeholder="06 12 34 56 78" />
          </div>
          <div>
            <label className="label" htmlFor="company_name">Entreprise (optionnel)</label>
            <input className="input" id="company_name" name="company_name" placeholder="Martin Plomberie" />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-[#6B4EFF]">
            Le chantier
          </legend>
          <div>
            <label className="label" htmlFor="client_name">Client</label>
            <input className="input" id="client_name" name="client_name" required placeholder="Mme Dupont" />
          </div>
          <div>
            <label className="label" htmlFor="client_address">Adresse</label>
            <input className="input" id="client_address" name="client_address" placeholder="12 rue Victor Hugo, 69003 Lyon" />
          </div>
          <div>
            <label className="label" htmlFor="client_phone">Tél. client (optionnel)</label>
            <input className="input" id="client_phone" name="client_phone" placeholder="06 …" />
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              className="input min-h-28"
              id="description"
              name="description"
              required
              placeholder="Chauffe-eau électrique HS, à remplacer par un 200L…"
            />
          </div>
          <div>
            <label className="label" htmlFor="urgency">Urgence</label>
            <select className="input" id="urgency" name="urgency" defaultValue="normale">
              <option value="basse">Basse</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
            </select>
          </div>
        </fieldset>

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Génération du brouillon…" : "Recevoir mon brouillon"}
        </button>
      </form>

      {result ? (
        <div className={`card ${result.ok ? "border-[#c4b5fd]" : "border-red-200"}`}>
          {result.ok ? (
            <div className="space-y-3">
              <p className="font-semibold text-[#6B4EFF]">Brouillon prêt</p>
              <p className="text-sm text-stone-600">
                Job {result.job_id}. Relisez et validez avant tout envoi client.
              </p>
              {result.review_url ? (
                <a className="btn-primary inline-block" href={result.review_url}>
                  Ouvrir la revue
                </a>
              ) : null}
            </div>
          ) : (
            <p className="text-red-700">{result.error || "Erreur"}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
