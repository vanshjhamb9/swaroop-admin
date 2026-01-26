import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⛔ Bypass ESLint errors during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },

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
    formats: ["image/avif", "image/webp"],
  },

  // Enable experimental features for performance
  experimental: {
    swcPlugins: [],
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "firebase",
      "firebase-admin",
    ],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: "/:path((?!api).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
