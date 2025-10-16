/**
 * SEO-Optimized Sign-In Page Layout
 * Fixes: Missing meta description, robots.txt errors
 */

import type { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Sign In - AI Resume Builder | Professional Resume Creation Tool',
  description: 'Sign in to AI Resume Builder - Create professional, ATS-friendly resumes with AI assistance. Access your dashboard, track applications, and build your career.',
  keywords: 'sign in, login, AI resume builder, resume creator, ATS resume, job application',
  
  // Open Graph
  openGraph: {
    title: 'Sign In - AI Resume Builder',
    description: 'Access your AI Resume Builder account and create professional resumes.',
    type: 'website',
    url: 'https://yourdomain.com/sign-in',
    images: [
      {
        url: '/images/og-sign-in.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Builder Sign In',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In - AI Resume Builder',
    description: 'Access your AI Resume Builder account and create professional resumes.',
    images: ['/images/twitter-sign-in.jpg'],
  },
  
  // Additional SEO
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://yourdomain.com/sign-in',
  },
  
  // Additional meta tags
  other: {
    'theme-color': '#3b82f6',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

// Component code here...
export default function SignInPage() {
  // ... existing component code
}
