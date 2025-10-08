/**
 * Professional TypeScript type definitions for ResumeCraft AI
 * Comprehensive type system for better code quality and developer experience
 */

// ================================
// Core Application Types
// ================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ================================
// User & Authentication Types
// ================================

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  subscription?: UserSubscription;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  aiSuggestions: boolean;
  analyticsEnabled: boolean;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'inactive' | 'canceled' | 'expired';
  startDate: Date;
  endDate?: Date;
  features: string[];
}

// ================================
// Resume Types
// ================================

export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  content: ResumeContent;
  metadata: ResumeMetadata;
  createdAt: Date;
  updatedAt: Date;
  status: ResumeStatus;
  version: number;
}

export type ResumeStatus = 'draft' | 'published' | 'archived';

export interface ResumeContent {
  basics: PersonalInfo;
  sections: ResumeSections;
  styling: StylingOptions;
}

export interface PersonalInfo {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  url?: UrlField;
  summary: string;
  picture?: ProfilePicture;
  customFields: CustomField[];
}

export interface ResumeSections {
  experience: ExperienceSection;
  education: EducationSection;
  skills: SkillsSection;
  projects: ProjectsSection;
  certifications: CertificationsSection;
  languages: LanguagesSection;
  volunteer: VolunteerSection;
  interests: InterestsSection;
  references: ReferencesSection;
}

export interface BaseSection {
  id: string;
  name: string;
  visible: boolean;
  columns: number;
  order: number;
}

export interface ExperienceSection extends BaseSection {
  items: ExperienceItem[];
}

export interface ExperienceItem {
  id: string;
  visible: boolean;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  summary: string;
  highlights: string[];
  url?: UrlField;
}

export interface EducationSection extends BaseSection {
  items: EducationItem[];
}

export interface EducationItem {
  id: string;
  visible: boolean;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  summary: string;
  url?: UrlField;
}

export interface SkillsSection extends BaseSection {
  items: SkillItem[];
}

export interface SkillItem {
  id: string;
  visible: boolean;
  name: string;
  level: SkillLevel;
  category: string;
  keywords: string[];
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ================================
// Template Types
// ================================

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  previewImage: string;
  thumbnailImage: string;
  isPremium: boolean;
  tags: string[];
  rating: number;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
  config: TemplateConfig;
}

export type TemplateCategory = 'modern' | 'classic' | 'creative' | 'minimal' | 'professional';

export interface TemplateConfig {
  colors: ColorScheme;
  fonts: FontConfig;
  layout: LayoutConfig;
  spacing: SpacingConfig;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  border: string;
}

export interface FontConfig {
  headings: FontSettings;
  body: FontSettings;
}

export interface FontSettings {
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
}

// ================================
// AI & Analytics Types
// ================================

export interface AtsScore {
  id: string;
  userId: string;
  resumeId: string;
  score: number;
  maxScore: number;
  analysis: AtsAnalysis;
  jobDescriptionId?: string;
  createdAt: Date;
}

export interface AtsAnalysis {
  overallScore: number;
  breakdown: ScoreBreakdown;
  recommendations: Recommendation[];
  keywords: KeywordAnalysis;
  formatting: FormattingAnalysis;
}

export interface ScoreBreakdown {
  content: number;
  keywords: number;
  formatting: number;
  structure: number;
}

export interface Recommendation {
  type: RecommendationType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
}

export type RecommendationType = 
  | 'keyword_optimization'
  | 'content_improvement'
  | 'formatting_fix'
  | 'structure_enhancement'
  | 'skill_addition';

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  density: Record<string, number>;
  suggestions: string[];
}

export interface CareerIntelligence {
  skillGaps: string[];
  salaryInsights: SalaryInsights;
  progression: CareerProgression[];
  interviewPrep: InterviewPrep[];
  jobMatches: JobMatch[];
}

export interface SalaryInsights {
  currentRange: SalaryRange;
  potentialRange: SalaryRange;
  marketData: MarketSalaryData;
}

export interface SalaryRange {
  min: number;
  max: number;
  median: number;
  currency: string;
}

// ================================
// UI & Component Types
// ================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FormFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: T[keyof T], record: T) => React.ReactNode;
}

export interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

// ================================
// Utility Types
// ================================

export interface UrlField {
  label: string;
  href: string;
}

export interface ProfilePicture {
  url: string;
  size: number;
  aspectRatio: number;
  borderRadius: number;
  effects: {
    hidden: boolean;
    border: boolean;
    grayscale: boolean;
  };
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'url' | 'email' | 'phone';
}

export interface StylingOptions {
  theme: string;
  colorScheme: ColorScheme;
  typography: FontConfig;
  spacing: SpacingConfig;
  layout: LayoutConfig;
}

export interface SpacingConfig {
  margin: string;
  padding: string;
  gap: string;
}

export interface LayoutConfig {
  columns: number;
  sidebar: 'left' | 'right' | 'none';
  headerStyle: 'minimal' | 'standard' | 'detailed';
}

export interface ResumeMetadata {
  totalExperience: number;
  industry: string;
  jobLevel: 'entry' | 'mid' | 'senior' | 'executive';
  targetRole: string;
  keywords: string[];
  lastOptimized?: Date;
  atsScore?: number;
}

// Additional section types
export interface ProjectsSection extends BaseSection {
  items: ProjectItem[];
}

export interface ProjectItem {
  id: string;
  visible: boolean;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  url?: UrlField;
  highlights: string[];
  technologies: string[];
}

export interface CertificationsSection extends BaseSection {
  items: CertificationItem[];
}

export interface CertificationItem {
  id: string;
  visible: boolean;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  url?: UrlField;
  credentialId?: string;
}

export interface LanguagesSection extends BaseSection {
  items: LanguageItem[];
}

export interface LanguageItem {
  id: string;
  visible: boolean;
  language: string;
  fluency: 'native' | 'fluent' | 'professional' | 'conversational' | 'elementary';
}

export interface VolunteerSection extends BaseSection {
  items: VolunteerItem[];
}

export interface VolunteerItem {
  id: string;
  visible: boolean;
  organization: string;
  position: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  summary: string;
  highlights: string[];
  url?: UrlField;
}

export interface InterestsSection extends BaseSection {
  items: InterestItem[];
}

export interface InterestItem {
  id: string;
  visible: boolean;
  name: string;
  keywords: string[];
}

export interface ReferencesSection extends BaseSection {
  items: ReferenceItem[];
}

export interface ReferenceItem {
  id: string;
  visible: boolean;
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
}

export interface FormattingAnalysis {
  hasProperSections: boolean;
  hasConsistentFormatting: boolean;
  readabilityScore: number;
  issues: string[];
}

export interface CareerProgression {
  title: string;
  description: string;
  timeline: string;
  skills: string[];
}

export interface InterviewPrep {
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  compatibility: number;
  reasons: string[];
  url?: string;
}

export interface MarketSalaryData {
  location: string;
  experience: string;
  industry: string;
  lastUpdated: Date;
}