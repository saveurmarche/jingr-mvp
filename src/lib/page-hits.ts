import { promises as fs } from "fs";
import path from "path";
import { catalog } from "./seo-catalog";
import { landings } from "./seo-landings";
import type { PageHit } from "./types";

/**
 * Compteur de visites, à part de store.json : les pages vues s'accumulent en mémoire et
 * sont écrites dans hits.json au plus une fois par minute. Ainsi un compteur ne peut
 * jamais écraser une écriture de devis, et un script ne peut pas gonfler les données
 * (pages limitées à la liste publique, provenances plafonnées par jour).
 */
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const HITS_PATH = path.join(DATA_DIR, "hits.json");
const KEEP_DAYS = 120;
const MAX_SOURCES_PER_DAY = 40;
const FLUSH_MS = 60_000;

const PUBLIC_PATHS = new Set<string>([
  "/",
  "/go",
  "/demo",
  "/logiciel-devis-artisan-lille",
  "/facture-electronique-artisan",
  "/confidentialite",
  "/mentions-legales",
  "/mes-devis",
  "/modele-devis",
  ...landings.map((l) => `/${l.slug}`),
  ...catalog.map((e) => `/modele-devis/${e.slug}`),
]);

export function normalizeHitPath(p: string): string {
  const clean = p.split("?")[0].replace(/\/+$/, "") || "/";
  return PUBLIC_PATHS.has(clean) ? clean : "autre";
}

export function normalizeHitSource(s: string): string {
  const clean = s.toLowerCase().replace(/^www\./, "").replace(/[^a-z0-9.\-_]/g, "").slice(0, 40);
  return clean || "direct";
}

let pending = new Map<string, number>(); // "day|path|source" -> count
let timer: NodeJS.Timeout | null = null;

export function countHit(rawPath: string, rawSource: string, day = new Date().toISOString().slice(0, 10)): void {
  const key = `${day}|${normalizeHitPath(rawPath)}|${normalizeHitSource(rawSource)}`;
  pending.set(key, (pending.get(key) ?? 0) + 1);
  if (!timer) {
    timer = setTimeout(() => void flushHits(), FLUSH_MS);
    timer.unref?.();
  }
}

async function readHits(): Promise<PageHit[]> {
  try {
    return JSON.parse(await fs.readFile(HITS_PATH, "utf8")) as PageHit[];
  } catch {
    return [];
  }
}

export async function flushHits(): Promise<void> {
  if (timer) clearTimeout(timer);
  timer = null;
  if (pending.size === 0) return;
  const batch = pending;
  pending = new Map();
  const hits = await readHits();
  let lastDay = "";
  for (const [key, n] of batch) {
    const [day, p, src] = key.split("|");
    if (day > lastDay) lastDay = day;
    const sourcesToday = new Set(hits.filter((h) => h.day === day).map((h) => h.source));
    const source = sourcesToday.has(src) || sourcesToday.size < MAX_SOURCES_PER_DAY ? src : "autre";
    const row = hits.find((h) => h.day === day && h.path === p && h.source === source);
    if (row) row.count += n;
    else hits.push({ day, path: p, source, count: n });
  }
  const cutoff = new Date(Date.parse(lastDay) - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  const kept = hits.filter((h) => h.day >= cutoff);
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${HITS_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(kept));
  await fs.rename(tmp, HITS_PATH);
}

/** Lecture pour /ops : on vide d'abord ce qui attend en mémoire. */
export async function listPageHits(): Promise<PageHit[]> {
  await flushHits();
  return readHits();
}
