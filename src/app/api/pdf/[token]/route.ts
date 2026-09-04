import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { QuotePdfDocument } from "@/lib/pdf-document";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  const data = await db.getByReviewToken(token);
  if (!data) {
    return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 404 });
  }

  const element = React.createElement(QuotePdfDocument, {
    draft: data.draft,
    job: data.job,
    artisan: data.artisan,
  });

  // @react-pdf/renderer types expect Document; createElement is fine at runtime
  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="devis-jingr-${data.job.client_name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
