"use client";

import { useMemo, useState } from "react";
import type { QuoteDraft, QuoteLineItem } from "@/lib/types";

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

export function ReviewEditor({
  token,
  draftId,
  initialDraft,
  jobDescription,
}: {
  token: string;
  draftId: string;
  initialDraft: QuoteDraft;
  jobDescription: string;
}) {
  const [title, setTitle] = useState(initialDraft.title);
  const [intro, setIntro] = useState(initialDraft.intro || "");
  const [notes, setNotes] = useState(initialDraft.notes || "");
  const [items, setItems] = useState<QuoteLineItem[]>(initialDraft.line_items);
  const [status, setStatus] = useState(initialDraft.status);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sums = useMemo(() => recalc(items), [items]);

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

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <p className="text-sm text-stone-500">Chantier reçu</p>
        <p className="text-stone-800">{jobDescription}</p>
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
            <h2 className="font-semibold text-[#6B4EFF]">Lignes du devis</h2>
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
        </div>

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
