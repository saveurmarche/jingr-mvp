import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.APP_URL || "https://jingr.ai").replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ops", "/review/", "/d/", "/mes-devis"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
