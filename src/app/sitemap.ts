import type { MetadataRoute } from "next";
import { catalog } from "@/lib/seo-catalog";
import { landings } from "@/lib/seo-landings";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL || "https://jingr.ai").replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/logiciel-devis-artisan-lille`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/demo`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/modele-devis`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/facture-electronique-artisan`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    ...landings.map((l) => ({ url: `${base}/${l.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...catalog.map((e) => ({
      url: `${base}/modele-devis/${e.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
