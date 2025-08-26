import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Vercel deployment
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['bootstrap-icons']
  },
  // Ensure Prisma works properly
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  }
};

export default nextConfig;
