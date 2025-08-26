import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for shared hosting
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['bootstrap-icons']
  }
};

export default nextConfig;
