import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Studio | AI-Powered Career Tools',
  description: 'Harness the power of artificial intelligence to optimize your resume, generate compelling content, and find perfect job opportunities.',
  keywords: 'AI resume optimizer, ATS optimizer, job matcher, content generator, career tools',
  openGraph: {
    title: 'AI Studio - AI-Powered Career Intelligence',
    description: 'Transform your career with AI-powered resume optimization, content generation, and job matching tools.',
    type: 'website',
  },
};

export default function AIStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}