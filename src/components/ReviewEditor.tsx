"use client";

import { useMemo, useState } from "react";
import type { Artisan, Invoice, QuoteDraft, QuoteLineItem } from "@/lib/types";
import { SOFTWARE_OPTIONS, invoicesInJingr } from "@/lib/billing-software";

function eur(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function recalc(items: QuoteLineItem[]) {
  const total_ht = Math.round(
    items.reduce((s, i) => s + i.quantity * i.unit_price_ht, 0) * 100
  ) / 100;
  const total_tva = Math.round(
    items.reduce(
      (s, i) => s + i.quantity * i.unit_price_ht * (i.tva_rate / 100),
      0
    ) * 100
  ) / 100;
  return { total_ht, total_tva, total_ttc: Math.round((total_ht + total_tva) * 100) / 100 };
}

function whatsappShareUrl(token: string, clientName: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://jingr.app";
  const reviewUrl = `${origin}/review/${token}`;
  const text =
    `Brouillon jingr à valider (pas encore envoyé au client) — ${clientName}.\n` +
    `Relisez ce devis avant toute transmission : ${reviewUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function ReviewEditor({
  token,
  draftId,
  initialDraft,
  jobDescription,
  clientName,
  initialInvoice,
  artisan,
  initialClientUrl,
  clientPhone,
}: {
  token: string;
  draftId: string;
  initialDraft: QuoteDraft;
  jobDescription: string;
  clientName: string;
  initialInvoice: Invoice | null;
  artisan: Artisan | null;
  initialClientUrl: string | null;
  clientPhone: string | null;
}) {
  const [title, setTitle] = useState(initialDraft.title);
  const [intro, setIntro] = useState(initialDraft.intro || "");
  const [notes, setNotes] = useState(initialDraft.notes || "");
  const [items, setItems] = useState<QuoteLineItem[]>(initialDraft.line_items);
  const [status, setStatus] = useState(initialDraft.status);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(initialInvoice);
  const [billing, setBilling] = useState<string | null>(artisan?.billing_software ?? null);

  const sums = useMemo(() => recalc(items), [items]);
  const waUrl = useMemo(
    () => whatsappShareUrl(token, clientName),
    [token, clientName]
  );

  function updateItem(id: string, patch: Partial<QuoteLineItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function addLine() {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "Nouvelle ligne",
        quantity: 1,
        unit: "forfait",
        unit_price_ht: 0,
        tva_rate: 10,
      },
    ]);
  }

  function removeLine(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function save(action: "save" | "validate") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          intro,
          notes,
          line_items: items,
          action,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Erreur");
      setStatus(json.draft.status);
      setMsg(json.message);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function invoiceAction(action: "create" | "paid") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Erreur");
      setInvoice(json.invoice);
      setMsg(action === "create" ? `Facture ${json.invoice.number} créée.` : "Facture marquée payée.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {artisan ? <CompanySettings token={token} artisan={artisan} onBillingChange={setBilling} /> : null}

      <div className="card space-y-3">
        <p className="text-sm text-stone-500">Chantier reçu</p>
        <p className="text-stone-800 whitespace-pre-wrap">{jobDescription}</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">Titre</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Introduction</label>
          <textarea className="input min-h-24" value={intro} onChange={(e) => setIntro(e.target.value)} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#7b5ea7]">Lignes du devis</h2>
            <button type="button" className="btn-secondary text-sm py-2" onClick={addLine}>
              + Ligne
            </button>
          </div>
          {items.map((li) => (
            <div key={li.id} className="grid gap-2 rounded-xl border border-[#ebe4da] p-3 sm:grid-cols-12">
              <input
                className="input sm:col-span-5"
                value={li.label}
                onChange={(e) => updateItem(li.id, { label: e.target.value })}
              />
              <input
                className="input sm:col-span-2"
                type="number"
                step="0.5"
                value={li.quantity}
                onChange={(e) => updateItem(li.id, { quantity: Number(e.target.value) })}
              />
              <input
                className="input sm:col-span-2"
                value={li.unit}
                onChange={(e) => updateItem(li.id, { unit: e.target.value })}
              />
              <input
                className="input sm:col-span-2"
                type="number"
                step="0.01"
                value={li.unit_price_ht}
                onChange={(e) =>
                  updateItem(li.id, { unit_price_ht: Number(e.target.value) })
                }
              />
              <button
                type="button"
                className="text-sm text-red-600 sm:col-span-1"
                onClick={() => removeLine(li.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-[#F7F4EF] p-4 text-right text-sm">
          <div>Total HT : <strong>{eur(sums.total_ht)}</strong></div>
          <div>TVA : <strong>{eur(sums.total_tva)}</strong></div>
          <div className="text-base">Total TTC : <strong>{eur(sums.total_ttc)}</strong></div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" disabled={busy} onClick={() => save("save")}>
            Enregistrer
          </button>
          <button className="btn-primary" disabled={busy || status === "validated"} onClick={() => save("validate")}>
            {status === "validated" ? "Déjà validé" : "Valider le devis"}
          </button>
          <a className="btn-secondary" href={`/api/pdf/${token}`}>
            Télécharger PDF
          </a>
          <a
            className="btn-secondary"
            href={`/api/export/${token}`}
            title="Lignes du devis au format Excel/CSV, à importer dans votre logiciel"
          >
            Export CSV
          </a>
          <a
            className="btn-secondary"
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Partager le lien du brouillon (à valider — pas un envoi client final)"
          >
            WhatsApp (brouillon)
          </a>
        </div>

        <p className="text-xs text-stone-500">
          Le bouton WhatsApp partage le lien de revue pour vous (ou un collègue).
          Ce n&apos;est pas un envoi du devis final au client.
        </p>

        {status === "validated" ? (
          <SendToClient
            token={token}
            clientName={clientName}
            clientPhone={clientPhone}
            initialUrl={initialClientUrl}
            acceptedAt={initialDraft.accepted_at ?? null}
            acceptedBy={initialDraft.accepted_by ?? null}
          />
        ) : null}

        {status === "validated" && !invoicesInJingr(billing) && !invoice ? (
          <div className="rounded-xl border border-[#c4b5fd] bg-[#faf8ff] p-4 space-y-3">
            <p className="font-semibold text-[#7b5ea7]">Facturation avec {billing}</p>
            <p className="text-sm text-stone-600">
              Vous facturez avec votre logiciel : récupérez les lignes du devis (CSV, ouvrable dans Excel)
              et importez-les comme articles, ou joignez le PDF. Rien à ressaisir.
            </p>
            <div className="flex flex-wrap gap-3">
              <a className="btn-primary" href={`/api/export/${token}`}>Exporter les lignes (CSV)</a>
              <a className="btn-secondary" href={`/api/pdf/${token}`}>Télécharger le PDF</a>
            </div>
          </div>
        ) : null}

        {status === "validated" && (invoicesInJingr(billing) || invoice) ? (
          <div className="rounded-xl border border-[#c4b5fd] bg-[#faf8ff] p-4 space-y-3">
            <p className="font-semibold text-[#7b5ea7]">Facturation</p>
            {invoice ? (
              <>
                <p className="text-sm text-stone-700">
                  Facture <strong>{invoice.number}</strong> — {eur(invoice.total_ttc)} TTC —{" "}
                  {invoice.status === "paid" ? "payée ✅" : `échéance le ${new Date(invoice.due_at).toLocaleDateString("fr-FR")}`}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a className="btn-primary" href={`/api/facture/${token}`}>
                    Télécharger la facture
                  </a>
                  {invoice.status !== "paid" ? (
                    <button className="btn-secondary" disabled={busy} onClick={() => invoiceAction("paid")}>
                      Marquer payée
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-stone-600">
                  Chantier terminé ? Transformez ce devis en facture en un clic
                  (numérotation et mentions légales automatiques).
                </p>
                <button className="btn-primary" disabled={busy} onClick={() => invoiceAction("create")}>
                  Transformer en facture
                </button>
              </>
            )}
          </div>
        ) : null}

        {msg ? <p className="text-sm text-stone-700">{msg}</p> : null}
        {status === "validated" ? (
          <p className="text-sm font-medium text-emerald-700">
            Validé — vous pouvez maintenant envoyer manuellement au client (email/WhatsApp).
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CompanySettings({
  token,
  artisan,
  onBillingChange,
}: {
  token: string;
  artisan: Artisan;
  onBillingChange: (v: string | null) => void;
}) {
  const incomplete = !artisan.siret || !(artisan.address || artisan.city);
  const [open, setOpen] = useState(incomplete);
  const [form, setForm] = useState({
    company_name: artisan.company_name || "",
    siret: artisan.siret || "",
    address: artisan.address || artisan.city || "",
    marge_pct: artisan.marge_pct ?? 30,
    default_tva: artisan.default_tva ?? 10,
    tva_franchise: artisan.tva_franchise ?? false,
    billing_software: artisan.billing_software ?? "jingr",
  });
  const [saved, setSaved] = useState<string | null>(null);

  async function submit() {
    setSaved(null);
    const res = await fetch("/api/artisan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });
    const json = await res.json();
    if (json.ok) onBillingChange(form.billing_software === "jingr" ? null : form.billing_software);
    setSaved(json.ok ? "Enregistré — appliqué à vos prochains devis et factures." : json.error || "Erreur");
  }

  return (
    <div className="card space-y-3">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold text-stone-800">
          Mon entreprise {incomplete ? <span className="text-sm text-amber-700">· à compléter pour facturer</span> : null}
        </span>
        <span className="text-stone-400">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Nom de l'entreprise" value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          <input className="input" placeholder="SIRET" value={form.siret}
            onChange={(e) => setForm({ ...form, siret: e.target.value })} />
          <input className="input sm:col-span-2" placeholder="Adresse de l'entreprise" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <label className="text-sm text-stone-600">
            Marge (%)
            <input className="input mt-1" type="number" min={0} max={200} value={form.marge_pct}
              onChange={(e) => setForm({ ...form, marge_pct: Number(e.target.value) })} />
          </label>
          <label className="text-sm text-stone-600">
            TVA par défaut
            <select className="input mt-1" value={form.default_tva}
              onChange={(e) => setForm({ ...form, default_tva: Number(e.target.value) })}>
              <option value={10}>10 % (rénovation)</option>
              <option value={5.5}>5,5 % (rénovation énergétique)</option>
              <option value={20}>20 % (neuf)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-600 sm:col-span-2">
            <input type="checkbox" checked={form.tva_franchise}
              onChange={(e) => setForm({ ...form, tva_franchise: e.target.checked })} />
            Micro-entreprise en franchise de TVA (art. 293 B du CGI)
          </label>
          <label className="text-sm text-stone-600 sm:col-span-2">
            Je fais mes factures avec
            <select className="input mt-1" value={form.billing_software}
              onChange={(e) => setForm({ ...form, billing_software: e.target.value })}>
              <option value="jingr">jingr (facture en un clic depuis le devis)</option>
              {SOFTWARE_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="button" className="btn-primary" onClick={submit}>Enregistrer</button>
            {saved ? <span className="text-sm text-stone-600">{saved}</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function waNumber(phone: string): string {
  let p = phone.replace(/[\s.\-()+]/g, "");
  if (/^0\d{9}$/.test(p)) p = `33${p.slice(1)}`;
  if (p.startsWith("00")) p = p.slice(2);
  return p;
}

function SendToClient({
  token,
  clientName,
  clientPhone,
  initialUrl,
  acceptedAt,
  acceptedBy,
}: {
  token: string;
  clientName: string;
  clientPhone: string | null;
  initialUrl: string | null;
  acceptedAt: string | null;
  acceptedBy: string | null;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function createLink() {
    setError(null);
    const res = await fetch("/api/client-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    if (json.ok) setUrl(json.url);
    else setError(json.error || "Erreur");
  }

  const message = url
    ? `Bonjour ${clientName}, voici le devis pour vos travaux : ${url}\nVous pouvez le consulter et l'accepter en ligne. N'hésitez pas si vous avez des questions !`
    : "";
  const wa = url
    ? `https://wa.me/${clientPhone ? waNumber(clientPhone) : ""}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <div className="rounded-xl border border-[#c4b5fd] bg-[#faf8ff] p-4 space-y-3">
      <p className="font-semibold text-[#7b5ea7]">Envoyer au client</p>
      {acceptedAt ? (
        <p className="text-sm font-medium text-emerald-700">
          ✅ Accepté par {acceptedBy || "le client"} le {new Date(acceptedAt).toLocaleDateString("fr-FR")}
        </p>
      ) : null}
      {url ? (
        <>
          <p className="text-sm text-stone-600">
            Votre client voit le devis (sans pouvoir le modifier) et peut l&apos;accepter en ligne. Vous êtes prévenu sur WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3">
            {wa ? (
              <a className="btn-primary" href={wa} target="_blank" rel="noopener noreferrer">
                Envoyer par WhatsApp
              </a>
            ) : null}
            <button
              className="btn-secondary"
              onClick={() => {
                void navigator.clipboard.writeText(url);
                setCopied(true);
              }}
            >
              {copied ? "Lien copié" : "Copier le lien"}
            </button>
            <a className="btn-secondary" href={url} target="_blank" rel="noopener noreferrer">
              Voir comme le client
            </a>
          </div>
        </>
      ) : (
        <button className="btn-primary" onClick={() => void createLink()}>
          Créer le lien pour {clientName}
        </button>
      )}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
