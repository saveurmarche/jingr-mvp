"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type TestimonialRow = {
  id: string;
  text: string;
  display_name: string;
  trade: string;
  city?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

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
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [deletions, setDeletions] = useState<{ phone: string; at: string }[]>([]);
  const [beta, setBeta] = useState<
    { id: string; first_name: string; last_name?: string | null; email: string; trade?: string | null; phone?: string | null; message?: string | null; software?: string | null; created_at: string }[]
  >([]);

  const load = useCallback(async () => {
    const headers = { "x-ops-password": password };
    const [jobsRes, tRes] = await Promise.all([
      fetch("/api/jobs", { headers }),
      fetch("/api/ops/testimonials", { headers }),
    ]);
    const json = await jobsRes.json();
    if (json.ok) setJobs(json.jobs);
    const tJson = await tRes.json();
    if (tJson.ok) {
      setTestimonials(tJson.testimonials);
      setDeletions(tJson.deletion_requests ?? []);
      setBeta(tJson.beta_signups ?? []);
    }
  }, [password]);

  async function moderate(id: string, status: TestimonialRow["status"]) {
    await fetch("/api/ops/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ops-password": password },
      body: JSON.stringify({ id, status }),
    });
    await load();
  }

  useEffect(() => {
    if (authed) void load();
    // load dépend du mot de passe saisi : on ne recharge qu'à l'authentification
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

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
      {deletions.length ? (
        <section className="card space-y-2 border-red-200">
          <h1 className="text-lg font-bold text-red-700">
            Demandes de suppression de compte (à traiter sous 30 jours)
          </h1>
          {deletions.map((d) => (
            <p key={d.phone + d.at} className="text-sm">
              {d.phone} — {new Date(d.at).toLocaleDateString("fr-FR")}
            </p>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Demandes bêta ({beta.length})</h1>
        {beta.length === 0 ? (
          <p className="text-stone-500">Aucune demande pour l&apos;instant.</p>
        ) : (
          beta.map((b) => (
            <div key={b.id} className="card space-y-1 text-sm">
              <p className="font-semibold">
                {b.first_name} {b.last_name ?? ""} · {b.trade || "métier ?"}
                {b.software ? ` · outil : ${b.software}` : ""}
              </p>
              <p>
                <a className="text-[#7b5ea7] underline" href={`mailto:${b.email}`}>{b.email}</a>
                {b.phone ? ` · ${b.phone}` : ""} · {new Date(b.created_at).toLocaleDateString("fr-FR")}
              </p>
              {b.message ? <p className="text-stone-600">« {b.message} »</p> : null}
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Avis artisans</h1>
        {testimonials.length === 0 ? (
          <p className="text-stone-500">
            Aucun avis. Ils arrivent par WhatsApp (« AVIS : … »), proposés automatiquement au 5e devis.
          </p>
        ) : (
          testimonials.map((t) => (
            <div key={t.id} className="card space-y-2">
              <p className="text-stone-800">« {t.text} »</p>
              <p className="text-xs text-stone-500">
                {t.display_name} · {t.trade}
                {t.city ? ` · ${t.city}` : ""} · {t.status} ·{" "}
                {new Date(t.created_at).toLocaleDateString("fr-FR")}
              </p>
              <div className="flex gap-2">
                <button className="btn-primary text-sm py-2" disabled={t.status === "approved"}
                  onClick={() => void moderate(t.id, "approved")}>
                  Publier
                </button>
                <button className="btn-secondary text-sm py-2" disabled={t.status === "rejected"}
                  onClick={() => void moderate(t.id, "rejected")}>
                  Refuser
                </button>
              </div>
            </div>
          ))
        )}
      </section>

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
