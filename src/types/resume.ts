// Shared TypeScript interfaces for the resume editor

export interface PersonalInfo {
  fullName?: string;
  name?: string;
  title?: string; // job title or headline
  position?: string; // alternate key used by some templates
  photoUrl?: string; // optional avatar/photo URL
  email?: string;
  phone?: string;
  location?: string;
  address?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  profiles?: SocialProfile[]; // social profiles used by some templates
}

export interface WorkExperience {
  id?: string;
  company: string;
  position: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements?: string[];
  highlights?: string[]; // used by some templates
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
  description?: string;
  // Additional optional fields used by various templates
  studyType?: string; // e.g., "Bachelor's in Computer Science"
  area?: string; // e.g., campus/location or major detail
  date?: string; // flexible date range string used by some templates
  score?: string; // GPA or score label used by some templates
}

export interface Skill {
  category: string;
  items: string[];
  name?: string; // alternate label used in some templates
  level?: string; // proficiency level used by some templates
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  date?: string;
  highlights?: string[];
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  credential?: string;
}

export interface Language {
  name: string;
  level?: string; // e.g., Native, Fluent, Advanced, Intermediate, Beginner
}

export interface SocialProfile {
  network: string; // e.g., LinkedIn, GitHub, Twitter
  username?: string;
  url?: string;
}

export interface ResumeContent {
  personalInfo?: PersonalInfo;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  interests?: string[];
}

export interface ResumeData {
  id?: string; // client-side convenience id
  _id?: string; // server document id
  title: string; // maps to Resume.name in DB
  templateId?: string;
  content: ResumeContent;
  createdAt?: string;
  updatedAt?: string;
}

// Helper type for section editing
export type SectionKey = keyof ResumeContent;

// Helper type for dynamic content updates
export type SectionData =
  | PersonalInfo
  | WorkExperience[]
  | Education[]
  | Skill[]
  | Project[]
  | Certification[]
  | Language[]
  | string[];
