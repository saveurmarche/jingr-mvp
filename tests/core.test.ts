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
