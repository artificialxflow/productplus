import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Liara deployment
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
  },
  // Fix static assets path
  assetPrefix: '',
  basePath: ''
};

export default nextConfig;
