import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================
  // PRODUCTION-OPTIMIZED CONFIGURATION
  // ============================================
  
  // Output optimization for production
  // Note: Use 'standalone' only for Docker deployments
  // For standard production use: set output to undefined or remove this line
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // Enable React Compiler optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features for better performance
  experimental: {
    // CSS optimization
    optimizeCss: true,
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      'framer-motion', 
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-tabs',
      'recharts',
      'date-fns',
    ],
    // Use SWC for faster builds
    swcTraceProfiling: process.env.ANALYZE === 'true',
  },
  
  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Image optimization with modern formats
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img-prod-cms-rt-microsoft-com.akamaized.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.uifaces.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  
  // Compression
  compress: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  generateEtags: true,
  poweredByHeader: false,
  
  webpack: (config, { dev, isServer }) => {
    // Add loaders for PDF files
    config.module.rules.push({
      test: /\.pdf$/,
      type: 'asset/resource',
    });

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for common libraries
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20
          },
          // Separate chunk for heavy libraries
          framerMotion: {
            name: 'framer-motion',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            priority: 30
          },
          ai: {
            name: 'ai-libs',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@google|google)[\\/]/,
            priority: 30
          },
          // Common UI components
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            priority: 25
          }
        }
      };
    }

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);

