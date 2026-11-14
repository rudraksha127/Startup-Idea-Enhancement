import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["mongoose", "bcryptjs"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

