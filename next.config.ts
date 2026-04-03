import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseBuiltinSass: true,
  },
};

export default nextConfig;
