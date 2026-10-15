/**
 * Limite simple en mémoire (une instance App Service) : protège le crédit IA contre les abus.
 * Clé = adresse IP + route. Remise à zéro à chaque redémarrage, suffisant pour le pilote.
 */
const hits = new Map<string, number[]>();

export function rateLimited(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.clear();
  return false;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-client-ip") || "unknown";
}
