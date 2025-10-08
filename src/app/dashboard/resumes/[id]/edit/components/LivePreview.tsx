"use client";

import React, { memo, useMemo, forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ResumeData } from '@/types/resume';
import TemplateRenderer from '@/components/resume/TemplateRenderer';
import { MultiPageResume } from '@/components/resume/MultiPageResume';
import { Template } from '@/lib/types';

export interface LivePreviewProps {
  resumeData: ResumeData;
  zoom?: number;
  className?: string;
  templateId?: string;
}

const LivePreview = memo(forwardRef<HTMLDivElement, LivePreviewProps>(function LivePreview({ 
  resumeData, 
  zoom = 1, 
  className,
  templateId
}, ref) {
  const shouldReduceMotion = useReducedMotion();
  
  // Memoize the template object to prevent recreation on every render
  const template: Template = useMemo(() => ({
    _id: templateId || resumeData?.templateId || 'azurill',
    name: templateId || resumeData?.templateId || 'Azurill',
    thumbnail: '',
    data: {
      page: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#1f2937',
        background: '#ffffff',
        margin: '40px'
      },
      headings: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '24px',
        lineHeight: '1.3',
        color: '#111827',
        background: 'transparent',
        fontWeight: '600',
        textAlign: 'left',
        borderBottom: '2px solid #e5e7eb',
        textTransform: 'none'
      },
      subheadings: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '18px',
        lineHeight: '1.4',
        color: '#374151',
        background: 'transparent',
        fontWeight: '500',
        textAlign: 'left',
        borderBottom: 'none',
        textTransform: 'none'
      },
      body: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#4b5563',
        background: 'transparent',
        fontWeight: '400',
        textAlign: 'left',
        borderBottom: 'none',
        textTransform: 'none'
      }
    },
    layout: [],
    primary: '#3b82f6'
  }), [templateId, resumeData?.templateId]);

  // Optimize animation settings based on user preference
  const animationProps = shouldReduceMotion
    ? { initial: { opacity: 1, scale: 1 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } };

  // Debug logging
  console.log('🖼️ LivePreview Render:', {
    templateId: template._id,
    hasResumeData: !!resumeData,
    hasContent: !!resumeData?.content,
    contentKeys: resumeData?.content ? Object.keys(resumeData.content) : []
  });

  return (
    <div className={cn("w-full mx-auto relative", className)}>
      <motion.div
        {...animationProps}
        className="relative"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      >
        {/* Multi-page A4 resume with automatic pagination */}
        <MultiPageResume enableAutoPagination={true}>
          <TemplateRenderer 
            template={template}
            data={resumeData}
          />
        </MultiPageResume>
      </motion.div>
      
      {/* Glowing border effect - positioned around A4 container */}
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg blur opacity-50 pointer-events-none -z-10" />
      
      {/* Hidden export container for PDF generation - proper A4 format */}
      <div 
        ref={ref} 
        className="pointer-events-none bg-white print:block" 
        style={{ 
          width: '210mm', 
          minHeight: '297mm',
          position: 'fixed',
          top: '-9999px',
          left: 0,
          visibility: 'hidden',
          zIndex: -1
        }}
        data-export-container="true"
      >
        <MultiPageResume enableAutoPagination={true}>
          <TemplateRenderer 
            template={template}
            data={resumeData}
          />
        </MultiPageResume>
      </div>
    </div>
  );
}));

export default LivePreview;
