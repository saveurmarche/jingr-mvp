import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mergeIntoPriceList, parsePriceListText } from "@/lib/price-list";

/** Mise à jour du profil artisan, authentifiée par un jeton de revue. */
const schema = z.object({
  token: z.string().min(8),
  name: z.string().min(1).optional(),
  company_name: z.string().optional(),
  siret: z.string().optional(),
  address: z.string().optional(),
  marge_pct: z.number().min(0).max(200).optional(),
  default_tva: z.union([z.literal(10), z.literal(20), z.literal(5.5)]).optional(),
  tva_franchise: z.boolean().optional(),
  tutoiement: z.boolean().optional(),
  acompte_pct: z.number().int().min(0).max(100).optional(),
  validity_days: z.number().int().min(7).max(180).optional(),
  billing_software: z.string().max(60).nullable().optional(),
  /** Tarif collé : une ligne par article « désignation ; unité ; prix HT » */
  price_list_text: z.string().max(50_000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { token, price_list_text, ...fields } = schema.parse(await req.json());
    const data = await db.getByReviewToken(token);
    if (!data?.artisan) {
      return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 404 });
    }
    let artisan = await db.findOrCreateArtisan({
      ...fields,
      name: fields.name ?? data.artisan.name,
      phone: data.artisan.phone,
    });
    let imported = 0;
    if (price_list_text?.trim()) {
      const items = parsePriceListText(price_list_text);
      imported = items.length;
      if (imported) {
        artisan = (await db.updateArtisan(artisan.id, {
          price_list: mergeIntoPriceList(
            artisan.price_list,
            items.map((p, i) => ({ id: String(i), label: p.label, quantity: 1, unit: p.unit, unit_price_ht: p.unit_price_ht, tva_rate: artisan.default_tva ?? 10 }))
          ),
        })) ?? artisan;
      }
    }
    return NextResponse.json({ ok: true, artisan, imported });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
