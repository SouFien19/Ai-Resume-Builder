"use client";

import React from 'react';
import type { Template, TemplateData } from '@/lib/types';
import type { ResumeData } from '@/types/resume';
import dynamic from 'next/dynamic';

// Loading placeholder component
function LoadingFallback() {
  return (
    <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-lg overflow-hidden animate-pulse">
      <div className="w-full aspect-[210/297] p-8">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Define all available templates with their dynamic imports
// Using ssr: true for better performance and SEO
const templates = {
  azurill: dynamic(() => import('./templates/Azurill'), {
    loading: LoadingFallback,
    ssr: true
  }),
  pikachu: dynamic(() => import('./templates/Pikachu'), {
    loading: LoadingFallback,
    ssr: true
  }),
  gengar: dynamic(() => import('./templates/Gengar'), {
    loading: LoadingFallback,
    ssr: true
  }),
  onyx: dynamic(() => import('./templates/Onyx'), {
    loading: LoadingFallback,
    ssr: true
  }),
  chikorita: dynamic(() => import('./templates/Chikorita'), {
    loading: LoadingFallback,
    ssr: true
  }),
  bronzor: dynamic(() => import('./templates/Bronzor'), {
    loading: LoadingFallback,
    ssr: true
  }),
  ditto: dynamic(() => import('./templates/Ditto'), {
    loading: LoadingFallback,
    ssr: true
  }),
  glalie: dynamic(() => import('./templates/Glalie'), {
    loading: LoadingFallback,
    ssr: true
  }),
  kakuna: dynamic(() => import('./templates/Kakuna'), {
    loading: LoadingFallback,
    ssr: true
  }),
  leafish: dynamic(() => import('./templates/Leafish'), {
    loading: LoadingFallback,
    ssr: true
  }),
  nosepass: dynamic(() => import('./templates/Nosepass'), {
    loading: LoadingFallback,
    ssr: true
  }),
  rhyhorn: dynamic(() => import('./templates/Rhyhorn'), {
    loading: LoadingFallback,
    ssr: true
  })
};

interface Props {
  template: Template;
  data: ResumeData;
}

export default function TemplateRenderer({ template, data }: Props) {
  const templateId = template._id.toLowerCase();
  const style: TemplateData | undefined = template?.data;

  // Use predefined lazy-loaded components instead of dynamic string imports
  const TemplateComponent = templates[templateId as keyof typeof templates] || templates.azurill;
  
  return <TemplateComponent data={data} style={style} />;
}
