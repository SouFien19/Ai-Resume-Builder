import bundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// PWA configuration
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/api\/(?!ai\/).*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
    {
      urlPattern: ({ url }) => {
        const isSameOrigin = self.origin === url.origin;
        if (!isSameOrigin) return false;
        const pathname = url.pathname;
        // Exclude auth, API routes, and admin
        if (pathname.startsWith('/api/')) return false;
        if (pathname.startsWith('/sign-in')) return false;
        if (pathname.startsWith('/sign-up')) return false;
        if (pathname.startsWith('/admin')) return false;
        return true;
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
  buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================
  // PRODUCTION-OPTIMIZED CONFIGURATION
  // ============================================
  
  // Output optimization for production
  // Disabled standalone mode to avoid Windows filename issues with node: protocol
  // output: 'standalone',
  
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
      '@clerk/nextjs', // Add Clerk for tree-shaking
      'react-icons', // Add if used
    ],
    // Use SWC for faster builds
    // swcTraceProfiling: process.env.ANALYZE === 'true', // Disabled: Not supported by Turbopack
    // Enable aggressive code splitting
    webpackBuildWorker: true,
  },
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  poweredByHeader: false, // Remove X-Powered-By header
  
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
      // Enhanced minification
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer,
        ],
        splitChunks: {
          chunks: 'all',
          minSize: 20000, // Only create chunks for files > 20KB
          maxSize: 244000, // Split chunks larger than 244KB
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for common libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Separate chunk for heavy libraries
            framerMotion: {
              name: 'framer-motion',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Clerk SDK separate chunk (lazy load)
            clerk: {
              name: 'clerk',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@clerk[\\/]/,
              priority: 35,
              reuseExistingChunk: true,
            },
            ai: {
              name: 'ai-libs',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@google|google)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Radix UI components
            radix: {
              name: 'radix-ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              priority: 28,
              reuseExistingChunk: true,
            },
            // Common UI components
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  
  // Add rewrites for PostHog tunneling to bypass ad blockers
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://eu.i.posthog.com/decide',
      },
    ];
  },
};

// Apply PWA, Bundle Analyzer, and Sentry wrappers
import { withSentryConfig } from "@sentry/nextjs";

const finalConfig = withBundleAnalyzer(pwaConfig(nextConfig));

export default withSentryConfig(
  finalConfig,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "soufiane-labiadh",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
