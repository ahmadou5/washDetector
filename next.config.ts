import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Compilation & Build Optimizations */
  
  // Reduce build time by disabling source maps in development
  productionBrowserSourceMaps: false,
  
  // Experimental features for better performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      "lucide-react",
      "@moralisweb3/common-evm-utils",
    ],
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wsrv.nl",
        port: "",
        pathname: "/**",
      },
    ],
  },
  
  // Caching headers for static content
  headers: async () => {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=30, s-maxage=60",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  
  // Turbopack optimization (Next.js 16+)
  turbopack: {
    resolveAlias: {
      "@": "./*",
    },
  },
};

export default nextConfig;
