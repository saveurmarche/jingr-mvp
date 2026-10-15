import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkOpsPassword } from "@/lib/ops-auth";
import { pilotMetrics } from "@/lib/pilot-metrics";

/** Visites des 14 derniers jours : total par jour, top pages, top provenances. */
function summarizeHits(hits: { day: string; path: string; source: string; count: number }[]) {
  const since = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
  const recent = hits.filter((h) => h.day >= since);
  const sum = (key: "day" | "path" | "source") => {
    const m = new Map<string, number>();
    for (const h of recent) m.set(h[key], (m.get(h[key]) ?? 0) + h.count);
    return [...m.entries()].map(([k, n]) => ({ k, n }));
  };
  return {
    total: recent.reduce((a, h) => a + h.count, 0),
    by_day: sum("day").sort((a, b) => b.k.localeCompare(a.k)),
    top_pages: sum("path").sort((a, b) => b.n - a.n).slice(0, 10),
    top_sources: sum("source").sort((a, b) => b.n - a.n).slice(0, 10),
  };
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!checkOpsPassword(req.headers.get("x-ops-password"))) return unauthorized();
  const deletions = await db.listInboxByKind("deletion_request");
  const pioneers = await db.listInboxByKind("pioneer_payment_pending");
  return NextResponse.json({
    ok: true,
    testimonials: await db.listTestimonials(),
    deletion_requests: deletions.map((d) => ({ phone: d.from_phone, at: d.created_at })),
    beta_signups: await db.listBetaSignups(),
    pilot: pilotMetrics(await db.snapshot()),
    pioneer_payments: pioneers.map((d) => ({ phone: d.from_phone, at: d.created_at })),
    visits: summarizeHits(await db.listPageHits()),
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
