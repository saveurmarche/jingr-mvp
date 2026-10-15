import { NextRequest, NextResponse } from "next/server";
import { countHit } from "@/lib/page-hits";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/**
 * Compteur de visites sans cookie : on ne garde que le jour, la page (liste publique,
 * sinon « autre ») et la provenance (utm_source / src, sinon domaine du référent).
 * Ni IP stockée, ni identifiant.
 */
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|python|wget|playwright/i;

export async function POST(req: NextRequest) {
  const done = new NextResponse(null, { status: 204 });
  try {
    if (BOT.test(req.headers.get("user-agent") || "")) return done;
    if (rateLimited(`hit:${clientIp(req.headers)}`, 60, 60_000)) return done;
    const body = JSON.parse((await req.text()).slice(0, 2000) || "{}");
    const pathname = typeof body.path === "string" ? body.path : "/";
    // Pages privées (liens personnels) : jamais comptées.
    if (/^\/(review|d|ops|api)(\/|$)/.test(pathname)) return done;
    let source = typeof body.src === "string" ? body.src : "";
    if (!source && typeof body.ref === "string" && body.ref) {
      try {
        const host = new URL(body.ref).hostname;
        if (!host.endsWith("jingr.ai") && !host.endsWith("azurewebsites.net")) source = host;
      } catch {
        // référent illisible : direct
      }
    }
    countHit(pathname, source);
  } catch {
    // Un compteur ne doit jamais casser la page.
  }
  return done;
}
