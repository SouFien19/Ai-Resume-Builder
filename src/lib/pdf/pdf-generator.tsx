import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { ResumePDFDocument } from './resume-pdf-template';
import type { ResumeData } from '@/types/resume';

export interface PDFExportOptions {
  filename?: string;
  quality?: 'low' | 'medium' | 'high';
  preview?: boolean;
}

/**
 * Generate and download a professional PDF resume
 * Uses React-PDF for perfect styling preservation
 */
export async function generateResumePDF(
  data: ResumeData,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const {
    filename = generateFilename(data),
    quality = 'high',
  } = options;

  console.log('🎨 Generating PDF with React-PDF', { filename, quality });
  console.log('📊 Resume data structure:', {
    hasData: !!data,
    hasContent: !!data?.content,
    title: data?.title,
    sections: {
      personalInfo: !!data?.content?.personalInfo,
      workExp: Array.isArray(data?.content?.workExperience) ? data.content.workExperience.length : 0,
      education: Array.isArray(data?.content?.education) ? data.content.education.length : 0,
      skills: Array.isArray(data?.content?.skills) ? data.content.skills.length : 0,
    }
  });

  try {
    // Generate PDF blob
    const blob = await pdf(<ResumePDFDocument data={data} />).toBlob();
    
    console.log('✅ PDF generated successfully', {
      size: `${(blob.size / 1024).toFixed(2)} KB`,
      type: blob.type,
    });

    return blob;
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    console.error('Full error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Download PDF directly to user's device
 */
export async function downloadResumePDF(
  data: ResumeData,
  options: PDFExportOptions = {}
): Promise<void> {
  const filename = options.filename || generateFilename(data);
  
  try {
    const blob = await generateResumePDF(data, options);
    saveAs(blob, filename);
    console.log('💾 PDF downloaded:', filename);
  } catch (error) {
    console.error('❌ PDF download failed:', error);
    throw error;
  }
}

/**
 * Generate a professional filename from resume data
 * Format: FirstName_LastName_Resume.pdf
 */
function generateFilename(data: ResumeData): string {
  const personalInfo = data.content?.personalInfo;
  const fullName = personalInfo?.fullName || personalInfo?.name || data.title || 'Resume';
  
  // Clean and format name
  const cleanName = fullName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
  
  return `${cleanName}_Resume.pdf`;
}

/**
 * Fallback to browser print if React-PDF fails
 */
export function fallbackToPrint(el: HTMLElement, filename: string): void {
  console.log('🖨️ Falling back to browser print');
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window - popup blocker might be active');
  }

  // Clone all stylesheets
  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          ${styles}
          @page {
            size: letter;
            margin: 0.5in 0.75in;
          }
          body {
            margin: 0;
            padding: 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    setTimeout(() => printWindow.close(), 100);
  }, 500);
}
