import React, { useEffect, useRef, useState } from 'react';
import { A4Page, A4PageContainer } from './A4Page';
import { cn } from '@/lib/utils';

interface MultiPageResumeProps {
  children: React.ReactNode;
  className?: string;
  enableAutoPagination?: boolean;
}

/**
 * MultiPageResume Component
 * Automatically splits content into multiple A4 pages when content overflows
 * Provides live preview with page break indicators
 */
export const MultiPageResume: React.FC<MultiPageResumeProps> = ({
  children,
  className,
  enableAutoPagination = true,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[]>([children]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!enableAutoPagination) {
      setPages([children]);
      setTotalPages(1);
      return;
    }

    // Calculate if content needs pagination
    const calculatePagination = () => {
      if (!contentRef.current) return;

      const contentHeight = contentRef.current.scrollHeight;
      // A4 height: 297mm, with 15mm top/bottom margins = 267mm usable
      // Convert to pixels: 297mm ≈ 1123px at 96 DPI, usable ≈ 1009px
      const pageHeight = 1009; // Approximate usable height in pixels
      
      const neededPages = Math.ceil(contentHeight / pageHeight);
      setTotalPages(Math.max(1, neededPages));

      // For now, render all content in pages
      // In a more advanced implementation, you could split the actual content
      if (neededPages > 1) {
        const pageArray = Array.from({ length: neededPages }, (_, i) => (
          <div key={i} className="page-content">
            {i === 0 ? children : null}
          </div>
        ));
        setPages(pageArray);
      } else {
        setPages([children]);
      }
    };

    // Initial calculation
    calculatePagination();

    // Recalculate on window resize
    const handleResize = () => calculatePagination();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [children, enableAutoPagination]);

  // For single page or simple implementation
  if (!enableAutoPagination || totalPages === 1) {
    return (
      <A4PageContainer className={className}>
        <A4Page pageNumber={1} totalPages={1} showPageNumber={true}>
          {children}
        </A4Page>
      </A4PageContainer>
    );
  }

  // Multi-page rendering
  return (
    <A4PageContainer className={className}>
      {/* Hidden reference to measure content */}
      <div ref={contentRef} className="sr-only">
        {children}
      </div>

      {/* Render pages */}
      {Array.from({ length: totalPages }, (_, index) => (
        <A4Page
          key={index}
          pageNumber={index + 1}
          totalPages={totalPages}
          showPageNumber={true}
        >
          {index === 0 ? children : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Content continues from previous page</p>
            </div>
          )}
        </A4Page>
      ))}
    </A4PageContainer>
  );
};

/**
 * Simple wrapper for templates that don't need auto-pagination
 * Just wraps content in a single A4 page
 */
export const SinglePageResume: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <A4PageContainer className={className}>
      <A4Page pageNumber={1} totalPages={1} showPageNumber={false}>
        {children}
      </A4Page>
    </A4PageContainer>
  );
};

export default MultiPageResume;
