import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle autonome (.next/standalone) : déployé tel quel sur Azure, sans npm install côté serveur.
  output: "standalone",
  serverExternalPackages: ["@react-pdf/renderer"],
  // pdfkit charge ses polices standard par chemin dynamique : le traçage du bundle standalone ne les voit pas.
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/pdfkit/js/standard-fonts/**/*"],
  },
};

export default nextConfig;
