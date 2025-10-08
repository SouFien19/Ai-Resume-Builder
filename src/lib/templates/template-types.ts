/**
 * Template System Types
 * Professional resume template metadata and interfaces
 */

export type TemplateCategory =
  | "professional"
  | "modern"
  | "creative"
  | "minimalist"
  | "academic";
export type TemplateRegion =
  | "us-canadian"
  | "european"
  | "uk"
  | "asia-pacific"
  | "international";
export type TemplateStyle =
  | "one-column"
  | "two-column"
  | "sidebar"
  | "grid"
  | "timeline";
export type ATSCompatibility =
  | "maximum"
  | "high"
  | "medium"
  | "low"
  | "creative";
export type CareerLevel = "entry" | "mid" | "senior" | "executive";
export type PhotoPosition =
  | "top-left"
  | "top-right"
  | "sidebar"
  | "center"
  | null;

export interface PhotoConfiguration {
  supported: boolean;
  required: boolean;
  position: PhotoPosition;
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  region: TemplateRegion;
  style: TemplateStyle;
  photo: PhotoConfiguration;
  atsScore: number;
  atsCompatibility: ATSCompatibility;
  printReady: boolean;
  bestFor: string[];
  industries: string[];
  careerLevel: CareerLevel[];
  colors: ColorScheme[];
  tags: string[];
  languages: string[];
  version: string;
  featured: boolean;
  premium: boolean;
  popularity: number;
}

export interface ResumeBasics {
  name: string;
  headline?: string;
  email: string;
  phone: string;
  location: string;
  url?: {
    label: string;
    href: string;
  };
  customFields?: any[];
  picture?: {
    url: string;
    size: number;
    aspectRatio: number;
    borderRadius: number;
    effects: {
      hidden: boolean;
      border: boolean;
      grayscale: boolean;
    };
  };
}

export interface ResumeSection {
  name: string;
  columns: number;
  visible: boolean;
  id: string;
  content?: string;
  items?: any[];
}

export interface ResumeSections {
  summary?: ResumeSection;
  awards?: ResumeSection;
  certifications?: ResumeSection;
  education?: ResumeSection;
  experience?: ResumeSection;
  interests?: ResumeSection;
  languages?: ResumeSection;
  profiles?: ResumeSection;
  projects?: ResumeSection;
  publications?: ResumeSection;
  references?: ResumeSection;
  skills?: ResumeSection;
  volunteer?: ResumeSection;
  [key: string]: ResumeSection | undefined;
}

export interface ResumeTemplate {
  _metadata: TemplateMetadata;
  basics: ResumeBasics;
  sections: ResumeSections;
}

export interface TemplateFilters {
  region?: TemplateRegion | "all";
  category?: TemplateCategory | "all";
  photoSupport?: boolean | "all";
  minAtsScore?: number;
  search?: string;
  careerLevel?: CareerLevel | "all";
  featured?: boolean;
  premium?: boolean;
}

export interface TemplateStats {
  totalTemplates: number;
  byRegion: Record<TemplateRegion, number>;
  byCategory: Record<TemplateCategory, number>;
  avgAtsScore: number;
  featuredCount: number;
  premiumCount: number;
}

// Helper type guards
export function isTemplateWithMetadata(
  template: any
): template is ResumeTemplate {
  return template && typeof template === "object" && "_metadata" in template;
}

export function hasPhotoSupport(template: ResumeTemplate): boolean {
  return template._metadata.photo.supported;
}

export function isPhotoRequired(template: ResumeTemplate): boolean {
  return template._metadata.photo.required;
}

export function isATSOptimized(
  template: ResumeTemplate,
  minScore: number = 90
): boolean {
  return template._metadata.atsScore >= minScore;
}

export function supportsRegion(
  template: ResumeTemplate,
  region: TemplateRegion
): boolean {
  return (
    template._metadata.region === region ||
    template._metadata.region === "international"
  );
}
