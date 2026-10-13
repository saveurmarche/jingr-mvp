import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

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
});

export async function POST(req: NextRequest) {
  try {
    const { token, ...fields } = schema.parse(await req.json());
    const data = await db.getByReviewToken(token);
    if (!data?.artisan) {
      return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 404 });
    }
    const artisan = await db.findOrCreateArtisan({
      ...fields,
      name: fields.name ?? data.artisan.name,
      phone: data.artisan.phone,
    });
    return NextResponse.json({ ok: true, artisan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
