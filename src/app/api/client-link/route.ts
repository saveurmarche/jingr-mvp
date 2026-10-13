import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/intake";

/** L'artisan (jeton de revue) obtient le lien à envoyer à son client. */
const schema = z.object({ token: z.string().min(8) });

export async function POST(req: NextRequest) {
  try {
    const { token } = schema.parse(await req.json());
    const data = await db.getByReviewToken(token);
    if (!data) return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 404 });
    const link = await db.getOrCreateClientLink(data.draft.id);
    return NextResponse.json({ ok: true, url: `${appUrl()}/d/${link.token}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
