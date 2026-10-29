import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "bcryptjs"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

