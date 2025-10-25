import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { WebVitals } from "./web-vitals";
import ToastProvider from "@/components/providers/ToastProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";

// Force dynamic rendering for all pages (no prerendering/SSG)
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "ResumeCraft AI - AI-Powered Resume Builder | Create Professional Resumes in Minutes",
    template: "%s | ResumeCraft AI"
  },
  description: "Transform your career with ResumeCraft AI. Our intelligent resume builder uses advanced AI to create ATS-optimized, professional resumes that get you hired. Free templates, real-time suggestions, and keyword optimization.",
  keywords: [
    "AI resume builder",
    "professional resume",
    "ATS-optimized resume",
    "resume templates",
    "CV builder",
    "job application",
    "career tools",
    "resume maker",
    "AI resume writer",
    "cover letter generator"
  ],
  authors: [{ name: "ResumeCraft AI Team" }],
  creator: "ResumeCraft AI",
  publisher: "ResumeCraft AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "ResumeCraft AI - AI-Powered Resume Builder",
    description: "Create professional, ATS-optimized resumes in minutes with our AI-powered resume builder. Get hired faster with intelligent suggestions and beautiful templates.",
    siteName: "ResumeCraft AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResumeCraft AI - AI-Powered Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeCraft AI - AI-Powered Resume Builder",
    description: "Create professional, ATS-optimized resumes in minutes with AI. Get hired faster!",
    images: ["/twitter-image.png"],
    creator: "@resumecraft",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
  // PWA specific metadata
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ResumeCraft AI",
  },
  applicationName: "ResumeCraft AI",
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Favicons - Multiple sizes for all browsers */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
          
          {/* PWA Meta Tags */}
          <meta name="theme-color" content="#3b82f6" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="ResumeCraft AI" />
        </head>
        <body
          suppressHydrationWarning
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
          {gaId && <GoogleAnalytics gaId={gaId} />}
          <AnalyticsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ErrorBoundary>
                {children}
                <Toaster 
                position="top-right" 
                richColors 
                expand={false}
                duration={4000}
                closeButton
                theme="dark"
                toastOptions={{
                  style: {
                    background: 'rgba(23, 23, 23, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                  },
                  className: 'font-medium',
                }}
              />
              <ToastProvider />
              <WebVitals />
              <CookieConsent />
              <PWAInstallPrompt />
            </ErrorBoundary>
          </ThemeProvider>
          </AnalyticsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
