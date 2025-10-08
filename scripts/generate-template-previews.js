/**
 * Template Preview Image Generator
 * Generates placeholder preview images for all templates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templates = [
  { id: 'professional-modern', name: 'Professional Modern', color: '#1F4E78', icon: '💼' },
  { id: 'creative-bold', name: 'Creative Bold', color: '#6B2C91', icon: '🎨' },
  { id: 'executive-classic', name: 'Executive Classic', color: '#1C3D5A', icon: '👔' },
  { id: 'minimalist-clean', name: 'Minimalist Clean', color: '#333333', icon: '⚪' },
  { id: 'tech-minimal', name: 'Tech Minimal', color: '#0A66C2', icon: '💻' },
  { id: 'marketing-dynamic', name: 'Marketing Dynamic', color: '#E91E63', icon: '📢' },
  { id: 'student-friendly', name: 'Student Friendly', color: '#2196F3', icon: '🎓' },
  { id: 'consultant-strategy', name: 'Consultant Strategy', color: '#0F4C75', icon: '📊' },
  { id: 'healthcare-professional', name: 'Healthcare Professional', color: '#0277BD', icon: '🏥' },
  { id: 'academic-traditional', name: 'Academic Traditional', color: '#800020', icon: '📚' },
  { id: 'corporate-classic', name: 'Corporate Classic', color: '#003366', icon: '🏢' },
  { id: 'sales-impact', name: 'Sales Impact', color: '#2E7D32', icon: '💰' }
];

function generateSVG(template) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="850" height="1100" viewBox="0 0 850 1100" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="850" height="1100" fill="#f5f5f5"/>
  
  <!-- Header with color -->
  <rect width="850" height="150" fill="${template.color}"/>
  
  <!-- Template Name -->
  <text x="425" y="90" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">
    ${template.icon} ${template.name}
  </text>
  
  <!-- Content Area - Header Section -->
  <rect x="50" y="200" width="750" height="80" fill="white" rx="4"/>
  <text x="425" y="250" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#333" text-anchor="middle">
    John Doe
  </text>
  
  <!-- Content Area - Two Column Layout -->
  <rect x="50" y="300" width="350" height="40" fill="white" rx="4"/>
  <rect x="450" y="300" width="350" height="40" fill="white" rx="4"/>
  
  <rect x="50" y="360" width="350" height="40" fill="white" rx="4"/>
  <rect x="450" y="360" width="350" height="40" fill="white" rx="4"/>
  
  <rect x="50" y="420" width="350" height="40" fill="white" rx="4"/>
  <rect x="450" y="420" width="350" height="40" fill="white" rx="4"/>
  
  <!-- Experience Section -->
  <rect x="50" y="500" width="750" height="30" fill="${template.color}" opacity="0.2" rx="4"/>
  <rect x="50" y="550" width="750" height="60" fill="white" rx="4"/>
  <rect x="50" y="630" width="750" height="60" fill="white" rx="4"/>
  
  <!-- Skills Section -->
  <rect x="50" y="720" width="750" height="30" fill="${template.color}" opacity="0.2" rx="4"/>
  <rect x="50" y="770" width="150" height="30" fill="${template.color}" opacity="0.3" rx="15"/>
  <rect x="220" y="770" width="150" height="30" fill="${template.color}" opacity="0.3" rx="15"/>
  <rect x="390" y="770" width="150" height="30" fill="${template.color}" opacity="0.3" rx="15"/>
  
  <!-- Education Section -->
  <rect x="50" y="830" width="750" height="30" fill="${template.color}" opacity="0.2" rx="4"/>
  <rect x="50" y="880" width="750" height="60" fill="white" rx="4"/>
  
  <!-- Footer Decoration -->
  <line x1="50" y1="1050" x2="800" y2="1050" stroke="${template.color}" stroke-width="2"/>
  
  <!-- Preview Label -->
  <text x="425" y="1085" font-family="Arial, sans-serif" font-size="12" fill="#999" text-anchor="middle">
    Template Preview
  </text>
</svg>`;
}

// Create output directory
const outputDir = path.join(__dirname, '..', 'public', 'templates', 'images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate SVG for each template
templates.forEach(template => {
  const svg = generateSVG(template);
  const filename = `${template.id}.svg`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, svg, 'utf-8');
  console.log(`✅ Generated: ${filename}`);
});

// Create placeholder.svg
const placeholderSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="850" height="1100" viewBox="0 0 850 1100" xmlns="http://www.w3.org/2000/svg">
  <rect width="850" height="1100" fill="#e0e0e0"/>
  <text x="425" y="550" font-family="Arial, sans-serif" font-size="24" fill="#999" text-anchor="middle">
    📄 Resume Template
  </text>
</svg>`;

fs.writeFileSync(path.join(outputDir, 'placeholder.svg'), placeholderSVG, 'utf-8');
console.log('✅ Generated: placeholder.svg');

console.log(`\n🎉 Successfully generated ${templates.length + 1} template preview images!`);
console.log(`📁 Location: ${outputDir}`);
