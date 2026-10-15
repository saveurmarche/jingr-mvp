"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Envoie une page vue au compteur interne (sans cookie). */
export function PageHit() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const body = JSON.stringify({
        path: pathname,
        src: params.get("utm_source") || params.get("src") || "",
        ref: document.referrer || "",
      });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/hit", new Blob([body], { type: "text/plain" }));
      else void fetch("/api/hit", { method: "POST", body, keepalive: true });
    } catch {
      // ignore
    }
  }, [pathname]);
  return null;
}
