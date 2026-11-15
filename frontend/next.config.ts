import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  serverExternalPackages: ["mongoose", "bcryptjs"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

