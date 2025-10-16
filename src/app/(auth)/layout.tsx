import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to ResumeCraft AI - Create professional, ATS-friendly resumes with AI assistance. Access your dashboard, track applications, and build your career.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
