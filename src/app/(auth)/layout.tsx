import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - AI Resume Builder | Professional Resume Creation Tool',
  description: 'Sign in to AI Resume Builder - Create professional, ATS-friendly resumes with AI assistance. Access your dashboard, track applications, and build your career.',
  keywords: 'sign in, login, AI resume builder, resume creator, ATS resume, job application, career tools',
  
  // Open Graph for social sharing
  openGraph: {
    title: 'Sign In - AI Resume Builder',
    description: 'Access your AI Resume Builder account and create professional resumes with AI assistance.',
    type: 'website',
    url: 'https://yourdomain.com/sign-in',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In - AI Resume Builder',
    description: 'Access your AI Resume Builder account and create professional resumes.',
  },
  
  // SEO Robots
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
  
  // Additional meta
  other: {
    'theme-color': '#3b82f6',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
