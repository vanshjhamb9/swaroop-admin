import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Enable React strict mode for development
  reactStrictMode: true,
  // Compress responses
  compress: true,
  // Optimize images
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  // Enable experimental features for performance
  experimental: {
    swcPlugins: [],
    // Optimize package imports
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'firebase',
      'firebase-admin',
    ],
  },
};

export default nextConfig;



