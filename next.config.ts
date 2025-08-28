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
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
    }
    return config;
  },
  // Domain configuration for swpl.ir - اصلاح شده
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://swpl.ir' : '',
  basePath: '',
  // Add domain configuration
  env: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || 'https://swpl.ir',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://swpl.ir/api',
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  // اضافه کردن تنظیمات امنیتی
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  },
  // Fix for read-only file system
  distDir: '.next',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
};

export default nextConfig;
