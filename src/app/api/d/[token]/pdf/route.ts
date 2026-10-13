import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { QuotePdfDocument } from "@/lib/pdf-document";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const data = await db.getByClientToken(token);
  if (!data) return NextResponse.json({ ok: false, error: "Devis introuvable" }, { status: 404 });
  const element = React.createElement(QuotePdfDocument, data);
  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  const company = (data.artisan?.company_name || data.artisan?.name || "artisan").replace(/\s+/g, "-").toLowerCase();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="devis-${company}.pdf"`,
    },
  });
}
