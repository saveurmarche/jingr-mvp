import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { draftToCsv } from "@/lib/csv-export";

/** Export des lignes du devis (jeton de revue = accès artisan) pour import dans un autre logiciel. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const data = await db.getByReviewToken(token);
  if (!data) return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 404 });
  const slug = data.job.client_name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return new NextResponse(draftToCsv(data.draft), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="devis-${slug || "jingr"}.csv"`,
    },
  });
}
