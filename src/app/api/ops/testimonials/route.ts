import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkOpsPassword } from "@/lib/ops-auth";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!checkOpsPassword(req.headers.get("x-ops-password"))) return unauthorized();
  const deletions = await db.listInboxByKind("deletion_request");
  return NextResponse.json({
    ok: true,
    testimonials: await db.listTestimonials(),
    deletion_requests: deletions.map((d) => ({ phone: d.from_phone, at: d.created_at })),
    beta_signups: await db.listBetaSignups(),
  });
}

const schema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected", "pending"]),
});

export async function POST(req: NextRequest) {
  if (!checkOpsPassword(req.headers.get("x-ops-password"))) return unauthorized();
  try {
    const { id, status } = schema.parse(await req.json());
    const t = await db.setTestimonialStatus(id, status);
    if (!t) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ ok: true, testimonial: t });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
