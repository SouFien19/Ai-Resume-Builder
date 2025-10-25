/**
 * Zod Validation Schemas
 * Centralized validation for all data types in the application
 */

import { z } from 'zod';

// ============================================
// RESUME SCHEMAS
// ============================================

// Helper to transform empty strings to undefined for optional URL fields
const optionalUrl = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) {
      return undefined;
    }

    if (typeof val !== 'string') {
      return undefined;
    }

    const trimmed = val.trim();
    if (!trimmed) {
      return undefined;
    }

    const hasProtocol = /^https?:\/\//i.test(trimmed);
    const sanitized = hasProtocol ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;

    try {
      const url = new URL(sanitized);
      // Reject clearly invalid values like plain words without a domain segment
      if (!url.hostname || !url.hostname.includes('.')) {
        return undefined;
      }
      return url.toString();
    } catch {
      return undefined;
    }
  },
  z.string().url().optional()
);

const optionalEmail = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().email().optional()
);

const optionalTrimmedString = (max?: number) =>
  z.preprocess(
    (val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val !== 'string') return val;
      const trimmed = val.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    (max !== undefined ? z.string().max(max) : z.string()).optional()
  );

const optionalStringArray = (maxLength: number) =>
  z.preprocess(
    (val) => {
      if (!Array.isArray(val)) return undefined;
      const cleaned = val
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0);
      return cleaned.length > 0 ? cleaned : undefined;
    },
    z.array(z.string().max(maxLength)).optional()
  );

const optionalObjectArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => {
      if (!Array.isArray(val)) return undefined;
      const cleaned = val
        .map((item) => (typeof item === 'object' && item !== null ? item : undefined))
        .filter((item): item is Record<string, unknown> => item !== undefined);
      return cleaned.length > 0 ? cleaned : undefined;
    },
    z.array(schema).optional()
  );

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100).optional(),
  title: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  photoUrl: optionalUrl,
  email: optionalEmail,
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  address: z.string().max(300).optional(),
  website: optionalUrl,
  linkedin: optionalUrl,
  github: optionalUrl,
  summary: z.string().max(2000).optional(),
  profiles: z.array(z.object({
    network: z.string(),
    username: z.string().optional(),
    url: z.string().url().optional(),
  })).optional(),
});

export const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company name is required').max(100),
  position: z.string().min(1, 'Position is required').max(100),
  role: z.string().min(1).max(100),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().max(2000),
  achievements: z.array(z.string().max(500)).optional(),
  highlights: z.array(z.string().max(500)).optional(),
});

export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required').max(200),
  degree: z.string().min(1, 'Degree is required').max(100),
  field: z.string().min(1, 'Field of study is required').max(100),
  graduationDate: z.string().min(1, 'Graduation date is required'),
  gpa: z.string().max(10).optional(),
  description: z.string().max(500).optional(),
  studyType: z.string().max(100).optional(),
  area: z.string().max(100).optional(),
  date: z.string().optional(),
  score: z.string().max(10).optional(),
});

export const SkillSchema = z.object({
  category: z.string().min(1).max(50),
  items: z.array(z.string().max(50)),
  name: z.string().max(50).optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
});

export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000),
  technologies: z.array(z.string().max(50)),
  link: optionalUrl,
  github: optionalUrl,
  date: z.string().optional(),
  highlights: z.array(z.string().max(300)).optional(),
});

export const CertificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Certification name is required').max(200),
  issuer: z.string().min(1, 'Issuer is required').max(100),
  date: z.string().min(1, 'Date is required'),
  credential: z.string().max(100).optional(),
  url: optionalUrl,
});

export const LanguageSchema = z.object({
  name: z.string().min(1, 'Language name is required').max(50),
  level: z.enum(['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner']).optional(),
});

export const ResumeContentSchema = z.object({
  personalInfo: PersonalInfoSchema.optional(),
  workExperience: z.array(WorkExperienceSchema).optional(),
  education: z.array(EducationSchema).optional(),
  skills: z.array(SkillSchema).optional(),
  projects: z.array(ProjectSchema).optional(),
  certifications: z.array(CertificationSchema).optional(),
  languages: z.array(LanguageSchema).optional(),
  interests: z.array(z.string().max(50)).optional(),
});

const EditablePersonalInfoSchema = PersonalInfoSchema.extend({
  fullName: optionalTrimmedString(100),
  name: optionalTrimmedString(100),
});

const EditableWorkExperienceSchema = z.object({
  id: optionalTrimmedString(),
  company: optionalTrimmedString(100),
  position: optionalTrimmedString(100),
  role: optionalTrimmedString(100),
  startDate: optionalTrimmedString(50),
  endDate: optionalTrimmedString(50),
  description: optionalTrimmedString(2000),
  achievements: optionalStringArray(500),
  highlights: optionalStringArray(500),
});

const EditableEducationSchema = z.object({
  id: optionalTrimmedString(),
  institution: optionalTrimmedString(200),
  degree: optionalTrimmedString(100),
  field: optionalTrimmedString(100),
  graduationDate: optionalTrimmedString(50),
  gpa: optionalTrimmedString(10),
  description: optionalTrimmedString(500),
  studyType: optionalTrimmedString(100),
  area: optionalTrimmedString(100),
  date: optionalTrimmedString(50),
  score: optionalTrimmedString(10),
});

const EditableSkillSchema = z.object({
  category: optionalTrimmedString(50),
  items: optionalStringArray(50),
  name: optionalTrimmedString(50),
  level: optionalTrimmedString(50),
});

const EditableProjectSchema = z.object({
  id: optionalTrimmedString(),
  name: optionalTrimmedString(100),
  description: optionalTrimmedString(1000),
  technologies: optionalStringArray(50),
  link: optionalUrl,
  github: optionalUrl,
  date: optionalTrimmedString(50),
  highlights: optionalStringArray(300),
});

const EditableCertificationSchema = z.object({
  id: optionalTrimmedString(),
  name: optionalTrimmedString(200),
  issuer: optionalTrimmedString(100),
  date: optionalTrimmedString(50),
  credential: optionalTrimmedString(100),
  url: optionalUrl,
});

const EditableLanguageSchema = z.object({
  name: optionalTrimmedString(50),
  level: optionalTrimmedString(50),
});

const EditableResumeContentSchema = z.object({
  personalInfo: EditablePersonalInfoSchema.optional(),
  workExperience: optionalObjectArray(EditableWorkExperienceSchema),
  education: optionalObjectArray(EditableEducationSchema),
  skills: optionalObjectArray(EditableSkillSchema),
  projects: optionalObjectArray(EditableProjectSchema),
  certifications: optionalObjectArray(EditableCertificationSchema),
  languages: optionalObjectArray(EditableLanguageSchema),
  interests: optionalStringArray(50),
});

export const CreateResumeSchema = z.object({
  title: z.string()
    .min(1, 'Resume title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  name: z.string()
    .min(1, 'Resume name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  templateId: z.string()
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid template ID format')
    .min(1, 'Template ID is required'),
  content: ResumeContentSchema.optional(),
  data: ResumeContentSchema.optional(), // Alias for content
});

const optionalTemplateId = z.preprocess(
  (val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val !== 'string') return val;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  CreateResumeSchema.shape.templateId.optional()
);

export const UpdateResumeSchema = z.object({
  title: optionalTrimmedString(100),
  name: optionalTrimmedString(100),
  templateId: optionalTemplateId,
  content: EditableResumeContentSchema.optional(),
  data: EditableResumeContentSchema.optional(),
});

// ============================================
// USER SCHEMAS
// ============================================

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  photo: z.string().url().optional(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
});

// ============================================
// ANALYTICS SCHEMAS
// ============================================

export const TrackApplicationSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200),
  company: z.string().min(1, 'Company name is required').max(200),
  location: z.string().max(200).optional(),
  matchScore: z.number().min(0).max(100).optional(),
  status: z.enum(['Applied', 'Saved', 'Assessment', 'Interviewing', 'Offer', 'Rejected']),
  url: z.string().url().optional().or(z.literal('')),
  appliedAt: z.date().optional(),
});

export const TrackScoreSchema = z.object({
  score: z.number()
    .min(0, 'Score must be at least 0')
    .max(100, 'Score must be at most 100'),
  resumeId: z.string().optional(),
  resumeText: z.string().optional(),
  jobDescription: z.string().optional(),
  analysis: z.object({
    missingKeywords: z.array(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
  }).optional(),
});

// ============================================
// AI SERVICE SCHEMAS
// ============================================

export const AIGenerationSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000),
  context: z.string().max(10000).optional(),
  maxTokens: z.number().min(1).max(2000).optional(),
  temperature: z.number().min(0).max(1).optional(),
  contentType: z.enum([
    'cover-letter',
    'linkedin-post',
    'job-description',
    'skills-keywords',
    'resume-summary',
    'work-experience',
    'achievements'
  ]).optional(),
});

export const ATSAnalysisSchema = z.object({
  resumeText: z.string().min(100, 'Resume text is too short').max(50000),
  jobDescription: z.string().min(50, 'Job description is too short').max(20000),
});

export const ATSResponseSchema = z.object({
  score: z.number().min(0).max(100),
  categoryScores: z.object({
    contactInfo: z.number().min(0).max(100),
    workExperience: z.number().min(0).max(100),
    education: z.number().min(0).max(100),
    skills: z.number().min(0).max(100),
    formatting: z.number().min(0).max(100),
    keywords: z.number().min(0).max(100),
  }).optional(),
  keywordAnalysis: z.object({
    totalKeywords: z.number(),
    matchedKeywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    matchPercentage: z.number().min(0).max(100),
  }).optional(),
  atsCompatibility: z.object({
    hasProblems: z.boolean(),
    issues: z.array(z.string()),
    warnings: z.array(z.string()),
    goodPoints: z.array(z.string()),
  }).optional(),
  recommendations: z.array(
    z.object({
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
      category: z.enum(["keywords", "experience", "formatting", "skills", "education"]),
      issue: z.string(),
      action: z.string(),
      impact: z.string(),
    })
  ).optional(),
  sectionAnalysis: z.object({
    summary: z.object({
      status: z.enum(["good", "needs-work", "missing"]),
      feedback: z.string(),
    }),
    experience: z.object({
      status: z.enum(["good", "needs-work", "missing"]),
      feedback: z.string(),
    }),
    education: z.object({
      status: z.enum(["good", "needs-work", "missing"]),
      feedback: z.string(),
    }),
    skills: z.object({
      status: z.enum(["good", "needs-work", "missing"]),
      feedback: z.string(),
    }),
  }).optional(),
  // Legacy fields for backward compatibility
  missingKeywords: z.array(z.string()).optional(),
});

// ============================================
// TEMPLATE SCHEMAS
// ============================================

export const TemplateFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  isPremium: z.boolean().optional(),
});

// ============================================
// EXPORT TYPE DEFINITIONS
// ============================================

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type ResumeContent = z.infer<typeof ResumeContentSchema>;
export type CreateResumeInput = z.infer<typeof CreateResumeSchema>;
export type UpdateResumeInput = z.infer<typeof UpdateResumeSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type TrackApplication = z.infer<typeof TrackApplicationSchema>;
export type TrackScore = z.infer<typeof TrackScoreSchema>;
export type AIGeneration = z.infer<typeof AIGenerationSchema>;
export type ATSAnalysis = z.infer<typeof ATSAnalysisSchema>;
export type TemplateFilter = z.infer<typeof TemplateFilterSchema>;
