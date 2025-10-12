"use client";

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "/#website",
        "url": "/",
        "name": "ResumeCraft AI",
        "description": "AI-Powered Resume Builder",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "/#organization",
        "name": "ResumeCraft AI",
        "url": "/",
        "logo": {
          "@type": "ImageObject",
          "url": "/logo.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://twitter.com/resumecraft",
          "https://linkedin.com/company/resumecraft",
          "https://facebook.com/resumecraft"
        ]
      },
      {
        "@type": "WebPage",
        "@id": "/#webpage",
        "url": "/",
        "name": "ResumeCraft AI - AI-Powered Resume Builder",
        "isPartOf": {
          "@id": "/#website"
        },
        "about": {
          "@id": "/#organization"
        },
        "description": "Create professional, ATS-optimized resumes in minutes with our AI-powered resume builder. Get hired faster with intelligent suggestions and beautiful templates."
      },
      {
        "@type": "SoftwareApplication",
        "name": "ResumeCraft AI",
        "operatingSystem": "Web",
        "applicationCategory": "BusinessApplication",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "10000",
          "bestRating": "5",
          "worstRating": "1"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "description": "AI-powered resume builder that helps professionals create ATS-optimized resumes with intelligent suggestions and professional templates."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does the AI resume builder work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our AI analyzes your profile, work experience, and target job description to generate compelling, ATS-friendly content. It uses advanced natural language processing to create professional resume content tailored to your career goals."
            }
          },
          {
            "@type": "Question",
            "name": "Is my data secure and private?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! We use enterprise-grade encryption (AES-256) to protect your data. Your resume information is never shared with third parties or used for training purposes. We're GDPR and CCPA compliant."
            }
          },
          {
            "@type": "Question",
            "name": "Can I create multiple versions of my resume?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Pro and Enterprise users can create unlimited resume projects. This is perfect for tailoring different versions for various job applications, industries, or career paths."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
