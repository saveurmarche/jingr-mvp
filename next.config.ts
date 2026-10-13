import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle autonome (.next/standalone) : déployé tel quel sur Azure, sans npm install côté serveur.
  output: "standalone",
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
