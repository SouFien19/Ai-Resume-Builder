/**
 * Template Data Management
 * Professional approach to handling template placeholder data
 *
 * Note: Template JSON files contain placeholder data for demonstration purposes.
 * In a production environment, consider:
 * 1. Moving template data to a database
 * 2. Using a content management system
 * 3. Implementing dynamic template generation
 */

export const TEMPLATE_PLACEHOLDER_DATA = {
  basics: {
    name: "[Your Name]",
    headline: "[Your Professional Title]",
    email: "[your.email@example.com]",
    phone: "[Your Phone Number]",
    location: "[Your Location]",
    url: {
      label: "[Website Label]",
      href: "[Your Website URL]",
    },
    summary:
      "[Your professional summary showcasing your key skills, experience, and career objectives.]",
  },
  company: {
    name: "[Company Name]",
    website: "[Company Website]",
  },
  education: {
    institution: "[University/School Name]",
    degree: "[Degree Type]",
    fieldOfStudy: "[Field of Study]",
  },
} as const;

/**
 * Sanitizes template data by replacing placeholder values
 * This should be called when loading templates for editing
 */
export function sanitizeTemplateData(templateData: unknown): unknown {
  if (typeof templateData === "string") {
    // Replace common placeholder patterns
    if (
      templateData.includes("John Doe") ||
      templateData.includes("jane.doe") ||
      templateData.includes("johndoe.me") ||
      templateData.includes("TechAdvancers") ||
      templateData.includes("(555)")
    ) {
      return "";
    }
  }

  if (typeof templateData === "object" && templateData !== null) {
    if (Array.isArray(templateData)) {
      return templateData.map((item) => sanitizeTemplateData(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(templateData)) {
      sanitized[key] = sanitizeTemplateData(value);
    }
    return sanitized;
  }

  return templateData;
}

/**
 * Generates clean template structure with placeholder hints
 */
export function generateCleanTemplate(templateName: string) {
  return {
    id: `template_${templateName}`,
    name: templateName,
    description: `Professional ${templateName} template`,
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    placeholders: TEMPLATE_PLACEHOLDER_DATA,
    instructions: [
      "Replace placeholder values with your actual information",
      "Remove sections that don't apply to your experience",
      "Customize colors and fonts to match your personal brand",
      "Ensure all links and contact information are accurate",
    ],
  };
}

/**
 * Validates template data structure
 */
export function validateTemplateStructure(template: unknown): boolean {
  if (!template || typeof template !== "object") {
    return false;
  }

  const templateObj = template as Record<string, unknown>;

  // Check for required top-level properties
  const requiredProps = ["basics", "sections"];
  return requiredProps.every((prop) => prop in templateObj);
}

/**
 * Template metadata for professional presentation
 */
export const TEMPLATE_METADATA = {
  categories: ["modern", "classic", "creative", "minimal", "professional"],
  industries: [
    "technology",
    "finance",
    "healthcare",
    "education",
    "marketing",
    "creative",
  ],
  experience_levels: ["entry", "mid", "senior", "executive"],
  features: ["ats_optimized", "customizable", "mobile_friendly", "printable"],
} as const;
