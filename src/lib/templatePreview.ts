import type { Template } from '@/lib/types';

const PDF_BASE_PATH = '/templates/pdf';
const IMAGE_BASE_PATH = '/templates/images';

export function getTemplatePreviewUrl(template: Template) {
  const templateId = template._id.toLowerCase();
  
  // Try PDF first
  const pdfUrl = `${PDF_BASE_PATH}/${templateId}.pdf`;
  if (templateHasPreview(templateId)) {
    return pdfUrl;
  }

  // Fall back to image
  const imageUrl = `${IMAGE_BASE_PATH}/${templateId}.png`;
  if (templateHasPreview(templateId)) {
    return imageUrl;
  }

  return null;
}

// Helper to check if file exists (this is static since we know our available templates)
function templateHasPreview(templateId: string) {
  const templates = [
    'professional-modern', 'creative-bold', 'executive-classic', 'minimalist-clean',
    'tech-minimal', 'marketing-dynamic', 'student-friendly', 'consultant-strategy',
    'healthcare-professional', 'academic-traditional', 'corporate-classic', 'sales-impact'
  ];

  return templates.includes(templateId);
}
