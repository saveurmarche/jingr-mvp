import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Compteur de visites sans cookie : on ne garde que le jour, la page et la provenance
 * (paramètre utm_source / src, sinon domaine du référent). Ni IP, ni identifiant.
 */
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|python|wget|playwright/i;

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.slice(0, max).replace(/[^\w\-./:@]/g, "") : "";
}

export async function POST(req: NextRequest) {
  try {
    if (BOT.test(req.headers.get("user-agent") || "")) return new NextResponse(null, { status: 204 });
    const body = JSON.parse((await req.text()) || "{}");
    const path = clean(body.path, 120) || "/";
    // Pages privées : on ne compte pas les liens personnels (revue, client, ops).
    if (/^\/(review|d|ops|api)(\/|$)/.test(path)) return new NextResponse(null, { status: 204 });
    let source = clean(body.src, 40).toLowerCase();
    if (!source && typeof body.ref === "string" && body.ref) {
      try {
        const host = new URL(body.ref).hostname.replace(/^www\./, "");
        source = host.endsWith("jingr.ai") ? "" : clean(host, 60);
      } catch {
        source = "";
      }
    }
    await db.recordHit(path, source || "direct");
  } catch {
    // Un compteur ne doit jamais casser la page.
  }
  return new NextResponse(null, { status: 204 });
}
