import { timingSafeEqual } from "crypto";

/** Mot de passe ops. En production sans OPS_PASSWORD, tout accès ops est refusé. */
export function checkOpsPassword(given: string | null | undefined): boolean {
  const expected =
    process.env.OPS_PASSWORD || (process.env.NODE_ENV !== "production" ? "jingr-ops" : "");
  if (!expected || !given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
