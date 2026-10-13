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
  const [tutoiement, setTutoiement] = useState(false);
  const [photoNames, setPhotoNames] = useState<string[]>([]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("tutoiement", tutoiement ? "true" : "false");
    fd.set("source", "web");
    fd.set("auto_draft", "true");

    const audioInput = form.querySelector<HTMLInputElement>('input[name="audio"]');
    if (!String(fd.get("description") || "").trim() && !audioInput?.files?.length) {
      setResult({ ok: false, error: "Ajoutez un vocal ou une description du chantier" });
      setLoading(false);
      return;
    }

    // Ensure photos field name is "photos"
    const photosInput = form.querySelector<HTMLInputElement>('input[name="photos"]');
    if (photosInput?.files && photosInput.files.length > 3) {
      setResult({ ok: false, error: "Maximum 3 photos" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        body: fd,
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
          Un vocal ou quelques lignes suffisent. Le devis revient en quelques minutes, à relire avant envoi.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4" encType="multipart/form-data">
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-[#7b5ea7]">
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="siret">SIRET (optionnel)</label>
              <input className="input" id="siret" name="siret" placeholder="123 456 789 00012" />
            </div>
            <div>
              <label className="label" htmlFor="city">Ville (optionnel)</label>
              <input className="input" id="city" name="city" placeholder="Lyon" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-[#7b5ea7]">
            Préférences devis
          </legend>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ebe4da] bg-[#fffcf8] px-3 py-3">
            <div>
              <p className="text-sm font-semibold text-stone-800">Tutoiement client</p>
              <p className="text-xs text-stone-500">
                {tutoiement ? "Tu / toi dans l'intro" : "Vous dans l'intro (défaut)"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={tutoiement}
              onClick={() => setTutoiement((v) => !v)}
              className={`relative h-8 w-14 rounded-full transition ${
                tutoiement ? "bg-[#7b5ea7]" : "bg-stone-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition ${
                  tutoiement ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="marge_pct">Marge / coeff. (%)</label>
              <input
                className="input"
                id="marge_pct"
                name="marge_pct"
                type="number"
                min={0}
                max={200}
                step={1}
                defaultValue={30}
              />
            </div>
            <div>
              <label className="label" htmlFor="default_tva">TVA défaut</label>
              <select className="input" id="default_tva" name="default_tva" defaultValue="10">
                <option value="10">10 % (rénovation)</option>
                <option value="20">20 % (neuf / fournitures)</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-[#7b5ea7]">
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
            <label className="label" htmlFor="audio">🎙️ Vocal (le plus rapide)</label>
            <input
              className="input"
              id="audio"
              name="audio"
              type="file"
              accept="audio/*"
              capture="user"
            />
            <p className="mt-1 text-xs text-stone-400">
              Dictez comme à un collègue : « Mme Dupont, 12 rue Victor Hugo à Lyon, cumulus 200 litres HS, à remplacer… »
            </p>
          </div>
          <div>
            <label className="label" htmlFor="description">Ou par écrit</label>
            <textarea
              className="input min-h-28"
              id="description"
              name="description"
              placeholder="Chauffe-eau électrique HS, à remplacer par un 200L…"
            />
          </div>
          <div>
            <label className="label" htmlFor="photos">Photos des notes (1 à 3)</label>
            <input
              className="input"
              id="photos"
              name="photos"
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={(e) => {
                const files = Array.from(e.target.files || []).slice(0, 3);
                setPhotoNames(files.map((f) => f.name));
              }}
            />
            {photoNames.length > 0 ? (
              <p className="mt-1 text-xs text-stone-500">
                {photoNames.length} photo{photoNames.length > 1 ? "s" : ""} : {photoNames.join(", ")}
              </p>
            ) : (
              <p className="mt-1 text-xs text-stone-400">
                Ex. photo du carnet de notes ou de la plaque signalétique.
              </p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="photo_note">Note sur les photos (optionnel)</label>
            <input
              className="input"
              id="photo_note"
              name="photo_note"
              placeholder="Marque du ballon illisible, accès étage…"
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
              <p className="font-semibold text-[#7b5ea7]">Brouillon prêt</p>
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
