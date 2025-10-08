import React from 'react';
import { cn } from '@/lib/utils';

interface A4PageProps {
  children: React.ReactNode;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
  showPageNumber?: boolean;
}

/**
 * A4 Page Component
 * Standard A4 dimensions: 210mm × 297mm (8.27" × 11.69")
 * Includes proper spacing, page breaks, and print optimization
 */
export const A4Page: React.FC<A4PageProps> = ({
  children,
  pageNumber,
  totalPages,
  className,
  showPageNumber = true,
}) => {
  return (
    <div
      className={cn(
        "a4-page relative bg-white",
        "shadow-lg print:shadow-none",
        "mx-auto mb-8 print:mb-0",
        "page-break-after",
        className
      )}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 20mm', // Professional margins
        boxSizing: 'border-box',
      }}
      data-page-number={pageNumber}
    >
      {/* Page Content */}
      <div className="h-full relative">
        {children}
      </div>

      {/* Page Number Footer - Only in preview, hidden in print */}
      {showPageNumber && pageNumber && (
        <div className="absolute bottom-4 right-8 text-xs text-gray-400 print:hidden">
          Page {pageNumber}{totalPages ? ` of ${totalPages}` : ''}
        </div>
      )}

      {/* Page Break Indicator - Only in preview */}
      {pageNumber && totalPages && pageNumber < totalPages && (
        <div className="absolute -bottom-4 left-0 right-0 flex items-center justify-center print:hidden">
          <div className="bg-gradient-to-r from-transparent via-gray-300 to-transparent h-px w-full" />
          <div className="absolute bg-white px-4 py-1 text-xs text-gray-500 border border-gray-300 rounded-full shadow-sm">
            Page Break
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * A4 Page Container for Multiple Pages
 */
interface A4PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const A4PageContainer: React.FC<A4PageContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div 
      className={cn(
        "a4-container",
        "w-full max-w-[210mm] mx-auto",
        "print:w-full print:max-w-none",
        className
      )}
    >
      {children}
    </div>
  );
};

export default A4Page;
