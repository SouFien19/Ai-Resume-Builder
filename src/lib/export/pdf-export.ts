"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Export using browser's native print dialog - preserves all CSS and styling perfectly
 */
export async function exportElementToPDFNative(el: HTMLElement, filename = "resume.pdf") {
  console.log('🖨️ Using native browser print for perfect CSS rendering');
  
  // Create a temporary container with only the resume content
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
        // Stylesheet access denied
        return '';
      }
    })
    .join('\n');

  // Create HTML for print window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          ${styles}
          @page {
            size: A4;
            margin: 0;
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
          }
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Trigger print dialog
  printWindow.print();
  
  // Close window after print
  setTimeout(() => printWindow.close(), 100);
}

/**
 * Capture a DOM element and export it to a single-page A4 PDF using html2canvas.
 * Falls back to this if native print is not desired.
 */
export async function exportElementToPDF(el: HTMLElement, filename = "resume.pdf") {
  console.log('🎯 Starting PDF Export', {
    element: el.tagName,
    hasDataAttribute: el.hasAttribute('data-export-container'),
    innerHTML: el.innerHTML.substring(0, 300)
  });

  // Ensure web fonts are loaded for correct layout metrics
  try {
    const anyDoc = document as unknown as { fonts?: { ready?: Promise<unknown> } };
    if (anyDoc.fonts && anyDoc.fonts.ready) {
      await Promise.race([
        anyDoc.fonts.ready!,
        new Promise((res) => setTimeout(res, 1000)), // fallback timeout
      ]);
    }
  } catch {}

  // Wait for any pending layout calculations
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const rect = el.getBoundingClientRect();
  let measuredWidth = Math.max(1, Math.round(rect.width));
  let measuredHeight = Math.max(1, Math.round(rect.height));
  
  console.log('📏 Element Measurements', {
    width: measuredWidth,
    height: measuredHeight,
    rect: { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right }
  });
  
  // Fallback to A4 dimensions if element not properly measured
  if (measuredWidth < 10 || measuredHeight < 10) {
    // Using A4 defaults for small dimensions
    // A4 at 96 DPI: 210mm = 794px, 297mm = 1123px
    measuredWidth = 794;
    measuredHeight = 1123;
  }
  
  const scale = 2; // render at 2x for sharper output

  // Temporarily make element visible and in viewport for capture
  const originalStyles = {
    position: el.style.position,
    top: el.style.top,
    left: el.style.left,
    visibility: el.style.visibility,
    zIndex: el.style.zIndex,
    transform: el.style.transform,
  };

  try {
    // Move element to viewport temporarily
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.visibility = 'visible';
    el.style.zIndex = '99999';
    el.style.transform = 'none';

    // Wait for layout to settle - multiple frames to ensure rendering completes
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 300)); // Additional time for complex layouts and font loading

    console.log('Capturing element DIRECTLY with html2canvas (now in viewport)', { 
      width: measuredWidth, 
      height: measuredHeight,
      scale,
      elementHTML: el.innerHTML.substring(0, 200) // Log first 200 chars to verify content
    });

    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false, // Disable verbose logging
      width: measuredWidth,
      height: measuredHeight,
      allowTaint: true, // Allow cross-origin images
      imageTimeout: 0, // No timeout for images
      removeContainer: true, // Clean up after rendering
      windowWidth: measuredWidth,
      windowHeight: measuredHeight,
      // Copy all computed styles to ensure Tailwind CSS is captured
      onclone: (clonedDoc, clonedEl) => {
        try {
          console.log('📋 Processing cloned document for CSS capture');
          
          // Get all elements from the cloned document
          const allElements = clonedDoc.querySelectorAll('*');
          const originalElements = el.querySelectorAll('*');
          
          // Match cloned elements with original elements by index
          allElements.forEach((clonedElement: Element, index: number) => {
            try {
              const originalElement = originalElements[index];
              if (!originalElement) return;
              
              const htmlElement = clonedElement as HTMLElement;
              const computedStyle = window.getComputedStyle(originalElement);
              
              // Copy critical computed styles to inline styles
              const criticalStyles = [
                'color', 'backgroundColor', 'fontSize', 'fontWeight', 
                'fontFamily', 'lineHeight', 'padding', 'margin',
                'border', 'borderRadius', 'display', 'width', 'height',
                'position', 'top', 'left', 'right', 'bottom',
                'flexDirection', 'justifyContent', 'alignItems',
                'gap', 'textAlign', 'textDecoration', 'textTransform'
              ];
              
              criticalStyles.forEach(prop => {
                try {
                  const value = computedStyle.getPropertyValue(prop);
                  if (value && value !== 'none' && value !== 'normal' && value !== '') {
                    htmlElement.style.setProperty(prop, value, 'important');
                  }
                } catch (e) {
                  // Silently skip if property access fails
                }
              });
            } catch (e) {
              // Silently skip if element processing fails
            }
          });
          
          console.log('✅ Inlined computed styles for better capture');
        } catch (error) {
          console.warn('⚠️ Could not inline styles, proceeding with default rendering', error);
        }
      }
    });

    console.log('Canvas created', { 
      canvasWidth: canvas.width, 
      canvasHeight: canvas.height,
      isEmpty: canvas.width === 0 || canvas.height === 0
    });
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas has zero dimensions - content may not be rendering');
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Fit image into A4 maintaining aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    console.log('Adding image to PDF', { 
      imgWidth, 
      imgHeight, 
      pageWidth, 
      pageHeight 
    });

    const y = imgHeight > pageHeight ? 0 : (pageHeight - imgHeight) / 2; // center vertically if shorter
    pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    
    console.log('PDF saved successfully', { filename });
  } catch (error) {
    console.error('❌ PDF Export Error:', error);
    throw error;
  } finally {
    // Restore original styles
    el.style.position = originalStyles.position;
    el.style.top = originalStyles.top;
    el.style.left = originalStyles.left;
    el.style.visibility = originalStyles.visibility;
    el.style.zIndex = originalStyles.zIndex;
    el.style.transform = originalStyles.transform;
    console.log('✅ Restored element to original position');
  }
}
