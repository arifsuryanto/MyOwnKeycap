import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for catching bugs
  reactStrictMode: true,

  // Transpile monorepo packages
  transpilePackages: ['@keycap/shared', '@keycap/db'],

  // Experimental features
  experimental: {
    // Server Actions are stable in Next.js 15
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Security headers (additional headers set in middleware)
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
    {
      // Prevent framing for all pages
      source: '/(.*)',
      headers: [{ key: 'X-Frame-Options', value: 'DENY' }],
    },
  ],

  // Image configuration
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
