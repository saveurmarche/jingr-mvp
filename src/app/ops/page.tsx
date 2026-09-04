"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type JobRow = {
  id: string;
  client_name: string;
  description: string;
  status: string;
  created_at: string;
  artisan?: { name: string; phone: string };
  draft?: { id: string; total_ttc: number; status: string };
};

export default function OpsPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/jobs");
    const json = await res.json();
    if (json.ok) setJobs(json.jobs);
  }, []);

  useEffect(() => {
    if (authed) void load();
  }, [authed, load]);

  function onLogin(e: FormEvent) {
    e.preventDefault();
    fetch("/ops/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then(async (r) => {
        const j = await r.json();
        if (j.ok) {
          setAuthed(true);
          setError(null);
        } else {
          setError("Mot de passe incorrect");
        }
      })
      .catch(() => setError("Erreur auth"));
  }

  async function triggerDraft(jobId: string) {
    setBusyId(jobId);
    try {
      await fetch("/ops/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, password }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm card space-y-4">
        <h1 className="text-xl font-bold">Ops jingr</h1>
        <p className="text-sm text-stone-600">
          Accès protégé par <code>OPS_PASSWORD</code>.
        </p>
        <form onSubmit={onLogin} className="space-y-3">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe ops"
            required
          />
          <button className="btn-primary w-full" type="submit">
            Entrer
          </button>
        </form>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button className="btn-secondary text-sm py-2" onClick={() => void load()}>
          Rafraîchir
        </button>
      </div>
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <p className="text-stone-500">Aucun job. Essayez /go ou le seed.</p>
        ) : (
          jobs.map((j) => (
            <div key={j.id} className="card space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{j.client_name}</p>
                  <p className="text-sm text-stone-600 line-clamp-2">{j.description}</p>
                  <p className="mt-1 text-xs text-stone-400">
                    {j.artisan?.name} · {j.status} ·{" "}
                    {new Date(j.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="text-right text-sm">
                  {j.draft ? (
                    <p>
                      Devis {j.draft.status} —{" "}
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(j.draft.total_ttc)}
                    </p>
                  ) : (
                    <p className="text-amber-700">Pas encore de brouillon</p>
                  )}
                </div>
              </div>
              <button
                className="btn-secondary text-sm py-2"
                disabled={busyId === j.id}
                onClick={() => void triggerDraft(j.id)}
              >
                {busyId === j.id ? "…" : "Relancer brouillon"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
