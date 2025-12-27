import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // ✅ REQUIRED for Netlify stability
  output: "standalone",
};

export default nextConfig;
