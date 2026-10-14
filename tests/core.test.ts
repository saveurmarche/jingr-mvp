import { test } from "node:test";
import assert from "node:assert/strict";
import { recalcTotals, resolvePrices } from "../src/lib/draft-pipeline";
import { draftToCsv } from "../src/lib/csv-export";
import { normalizePhone } from "../src/lib/db";
import {
  findCatalogueMatch,
  hasUnconfirmedEstimates,
  mergeIntoPriceList,
  normalizeLabel,
} from "../src/lib/price-list";
import type { PriceItem, QuoteDraft, QuoteLineItem } from "../src/lib/types";

const line = (p: Partial<QuoteLineItem>): QuoteLineItem => ({
  id: "x",
  label: "Ligne",
  quantity: 1,
  unit: "u",
  unit_price_ht: 100,
  tva_rate: 10,
  ...p,
});

const catalogue: PriceItem[] = [
  { label: "Fourniture chauffe-eau 200 L", unit: "u", unit_price_ht: 520, tva_rate: 10, updated_at: "2026-10-01" },
];

test("totals: HT, VAT and TTC are computed in code, rounded to the cent", () => {
  const t = recalcTotals([line({ quantity: 3, unit_price_ht: 33.33 }), line({ unit_price_ht: 10, tva_rate: 20 })]);
  assert.deepEqual(t, { total_ht: 109.99, total_tva: 12, total_ttc: 121.99 });
});

test("catalogue: exact match after normalisation only", () => {
  assert.equal(normalizeLabel("Fourniture  chauffe eau 200l"), normalizeLabel("fourniture chauffe-eau 200 L"));
  assert.equal(findCatalogueMatch("fourniture chauffe eau 200l", catalogue)?.unit_price_ht, 520);
  assert.equal(findCatalogueMatch("Fourniture chauffe-eau 150 L", catalogue), null);
  assert.equal(findCatalogueMatch("anything", undefined), null);
});

test("pricing: catalogue price wins, unknown items are estimates with margin", () => {
  const out = resolvePrices(
    [
      line({ label: "Pose ballon", unit_price_ht: 100 }),
      { ...line({ label: "Chauffe-eau", unit_price_ht: 300 }), catalogue_label: "Fourniture chauffe-eau 200 L" },
    ],
    catalogue,
    30
  );
  assert.equal(out[0].price_source, "estimate");
  assert.equal(out[0].unit_price_ht, 130);
  assert.equal(out[1].price_source, "catalogue");
  assert.equal(out[1].unit_price_ht, 520);
  assert.ok(!("catalogue_label" in out[1]));
  assert.equal(hasUnconfirmedEstimates(out), true);
  assert.equal(hasUnconfirmedEstimates([out[1]]), false);
});

test("learning: validated lines update the catalogue, newest price wins, zero prices ignored", () => {
  const merged = mergeIntoPriceList(
    catalogue,
    [line({ label: "fourniture chauffe eau 200l", unit_price_ht: 540 }), line({ label: "Gratuit", unit_price_ht: 0 })],
    "2026-10-14"
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0].unit_price_ht, 540);
  assert.equal(merged[0].updated_at, "2026-10-14");
});

test("csv: French format and formula injection neutralised", () => {
  const draft = {
    line_items: [line({ label: "=HYPERLINK(\"x\")", quantity: 1.5, unit_price_ht: 12.5 })],
  } as QuoteDraft;
  const csv = draftToCsv(draft);
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.includes(`"'=HYPERLINK(""x"")";1,5;u;12,5;10;18,75`));
});

test("phone: French numbers normalised to E.164", () => {
  assert.equal(normalizePhone("06 12 34 56 78"), "+33612345678");
  assert.equal(normalizePhone("0033612345678"), "+33612345678");
  assert.equal(normalizePhone("+33 6 12 34 56 78"), "+33612345678");
});

test("price list import: Excel paste with headers, tabs and comma decimals", async () => {
  const { parsePriceListText } = await import("../src/lib/price-list");
  const items = parsePriceListText(
    "Désignation;Unité;Prix HT\nRemplacement mitigeur ; u ; 180\nMain d'œuvre\th\t55,50 €\nTitre sans prix",
    "2026-10-14"
  );
  assert.deepEqual(
    items.map((i) => [i.label, i.unit, i.unit_price_ht]),
    [["Remplacement mitigeur", "u", 180], ["Main d'œuvre", "h", 55.5]]
  );
});

test("title: client name always present", async () => {
  const { inferTitle } = await import("../src/lib/draft-pipeline");
  const job = { client_name: "Mme Lefebvre", description: "x" } as Parameters<typeof inferTitle>[0];
  assert.equal(inferTitle(job, "Devis pour travaux de plomberie"), "Devis pour travaux de plomberie — Mme Lefebvre");
  assert.equal(inferTitle(job, "Devis Mme Lefebvre — sèche-serviettes"), "Devis Mme Lefebvre — sèche-serviettes");
});

test("pilot: edits counted per line (changed, added, removed)", async () => {
  const { countLineEdits, pilotMetrics } = await import("../src/lib/pilot-metrics");
  const a = line({ id: "a" }), b = line({ id: "b" }), c = line({ id: "c" });
  assert.equal(countLineEdits([a, b, c], [a, { ...b, unit_price_ht: 120 }, line({ id: "d" })]), 3);
  assert.equal(countLineEdits([a], [a]), 0);
  assert.equal(countLineEdits(undefined, [a]), 0);
  const now = new Date("2026-10-14T12:00:00Z");
  const m = pilotMetrics(
    {
      artisans: [{ id: "x", name: "A", phone: "+33600000001", trade: "bâtiment", created_at: "" }],
      jobs: [{ id: "j", artisan_id: "x" } as never],
      quote_drafts: [
        { id: "d1", job_id: "j", status: "validated", validated_at: "2026-10-13", edit_count: 1, created_at: "2026-10-13T10:00:00Z" } as never,
        { id: "d2", job_id: "j", status: "validated", validated_at: "2026-10-13", edit_count: 5, created_at: "2026-10-13T11:00:00Z" } as never,
        { id: "d3", job_id: "j", status: "draft", created_at: "2026-09-01T00:00:00Z" } as never,
      ],
    },
    now
  );
  assert.equal(m.artisans_active, 1);
  assert.equal(m.drafts, 2);
  assert.equal(m.validated_few_edits_pct, 50);
  assert.equal(m.per_artisan[0].avg_edits, 3);
});

test("store: atomic write and one daily backup", async () => {
  const { mkdtempSync, readdirSync, existsSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { execFileSync } = await import("node:child_process");
  const dir = mkdtempSync(join(tmpdir(), "jingr-"));
  const script = `
    const m = await import(${JSON.stringify(new URL("../src/lib/db.ts", import.meta.url).href)});
    const db = m.db ?? m.default.db;
    await db.findOrCreateArtisan({ name: "A", phone: "0600000001" });
    await db.findOrCreateArtisan({ name: "B", phone: "0600000002" });
    await db.findOrCreateArtisan({ name: "C", phone: "0600000003" });`;
  execFileSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", script], {
    env: { ...process.env, DATA_DIR: dir },
  });
  assert.ok(existsSync(join(dir, "store.json")));
  assert.equal(readdirSync(join(dir, "backups")).length, 1);
  assert.ok(!readdirSync(dir).some((f) => f.endsWith(".tmp")));
});

test("quote terms: validity date, expiry and deposit on TTC (HT in franchise)", async () => {
  const { quoteTerms } = await import("../src/lib/quote-terms");
  const draft = { created_at: "2026-10-01T10:00:00Z", validated_at: "2026-10-02T10:00:00Z", total_ht: 1000, total_ttc: 1100 };
  const artisan = { id: "a", name: "A", phone: "", trade: "", created_at: "", acompte_pct: 30 };
  const t = quoteTerms(draft, artisan, new Date("2026-10-20T00:00:00Z"));
  assert.equal(t.validUntil.toISOString(), "2026-11-01T10:00:00.000Z");
  assert.equal(t.expired, false);
  assert.equal(t.acompteAmount, 330);
  assert.equal(quoteTerms(draft, { ...artisan, tva_franchise: true }).acompteAmount, 300);
  assert.equal(quoteTerms(draft, { ...artisan, validity_days: 15 }, new Date("2026-10-20T00:00:00Z")).expired, true);
  assert.equal(quoteTerms(draft, null).acomptePct, 0);
});
