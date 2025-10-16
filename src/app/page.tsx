"use client";

import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SocialProof from "@/components/landing/SocialProof";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import ScrollProgress from "@/components/landing/ScrollProgress";
import BackToTop from "@/components/landing/BackToTop";
import StructuredData from "@/components/landing/StructuredData";
import SkipToContent from "@/components/landing/SkipToContent";
import { ThemeProvider } from "next-themes";
import { useUserSync } from "@/hooks/useUserSync";

export default function LandingPage() {
  // Auto-sync logged-in users to MongoDB
  useUserSync();
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StructuredData />
      <SkipToContent />
      <ScrollProgress />
      <BackToTop />
      <div className="bg-white dark:bg-gray-950">
        <Header />
        <main id="main-content">
          <Hero />
          <SocialProof />
          <Features />
          <HowItWorks />
          <Testimonials />
          <Pricing />
          <FAQ />
          <CTA />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}