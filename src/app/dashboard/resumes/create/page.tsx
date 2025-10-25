"use client";

// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { useAIStream } from "@/hooks/useAIStream";
import { useOptimizedAnimations } from "@/hooks/useOptimizedAnimations";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, FileText, Sparkles, Loader2, Briefcase, Globe, ZoomIn, ZoomOut, GraduationCap, AlertCircle, Download } from "lucide-react";
import LivePreview from "../[id]/edit/components/LivePreview";
import ContactStep, { ContactFieldErrors } from "./components/ContactStep";
import TargetAndTemplateStep from "./components/TargetAndTemplateStep";
import SkillsStep from "./components/SkillsStep";
import ExperienceStep from "./components/ExperienceStep";
import ProjectsStep from "./components/ProjectsStep";
import EducationStep from "./components/EducationStep";
import CertificationsStep from "./components/CertificationsStep";
import LanguagesStep from "./components/LanguagesStep";
import InterestsStep from "./components/InterestsStep";
import ReviewStep from "./components/ReviewStep";
import type { Template } from "@/lib/types";
import type { ResumeData, WorkExperience as WorkItem, Education as EduItem, Certification as CertType, Project, Language } from "@/types/resume";
import { toast } from "sonner";
import { exportElementToPDF } from "@/lib/export/pdf-export";

type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const steps = [
  { id: 1, title: "Contact", description: "Add your contact details and links", icon: <User className="h-5 w-5" /> },
  { id: 2, title: "Target & Template", description: "Choose your role and a professional template", icon: <Briefcase className="h-5 w-5" /> },
  { id: 3, title: "Skills & Summary", description: "Select skills and craft a strong summary", icon: <FileText className="h-5 w-5" /> },
  { id: 4, title: "Experience", description: "Add roles and achievements (optional)", icon: <Briefcase className="h-5 w-5" /> },
  { id: 5, title: "Projects", description: "Showcase your best projects (optional)", icon: <Globe className="h-5 w-5" /> },
  { id: 6, title: "Education", description: "Add your academic background (optional)", icon: <GraduationCap className="h-5 w-5" /> },
  { id: 7, title: "Certifications", description: "Show your certifications (optional)", icon: <FileText className="h-5 w-5" /> },
  { id: 8, title: "Languages", description: "Add languages you speak (optional)", icon: <Globe className="h-5 w-5" /> },
  { id: 9, title: "Interests", description: "Share interests (optional)", icon: <FileText className="h-5 w-5" /> },
  { id: 10, title: "Review", description: "Preview and create your resume", icon: <Sparkles className="h-5 w-5" /> },
] as const;

const allowedTemplateIds = [
  "azurill",
  "pikachu",
  "gengar",
  "onyx",
  "chikorita",
  "bronzor",
  "ditto",
  "glalie",
  "kakuna",
  "leafish",
  "nosepass",
  "rhyhorn"
] as const;

const industries = ["Software", "Product", "Design", "Marketing", "Sales", "Operations", "Finance", "Healthcare", "Education"] as const;
const seniorities = ["Entry", "Mid", "Senior", "Lead", "Manager"] as const;

const roleSkillPresets: Record<string, string[]> = {
  "Software Engineer": ["JavaScript", "TypeScript", "React", "Node.js", "REST APIs", "Testing", "CI/CD"],
  "Product Manager": ["Roadmapping", "User Research", "A/B Testing", "Data Analysis", "Stakeholder Management"],
  "UI/UX Designer": ["Wireframing", "Prototyping", "Figma", "User Research", "Design Systems"],
  "Data Analyst": ["SQL", "Python", "Dashboards", "ETL", "A/B Testing", "Experimentation"],
  "Data Scientist": ["Python", "Machine Learning", "Pandas", "Feature Engineering", "Model Evaluation"],
  "DevOps Engineer": ["CI/CD", "Docker", "Kubernetes", "Terraform", "Monitoring"],
  "Frontend Engineer": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Accessibility"],
  "Backend Engineer": ["Node.js", "Databases", "Microservices", "REST", "GraphQL"],
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUrl = (value: string | null | undefined): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const normalized = hasProtocol ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`;

  try {
    const url = new URL(normalized);
    if (!url.hostname || !url.hostname.includes('.')) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
};

const hasMinimumDigits = (value: string, count: number) => value.replace(/\D/g, "").length >= count;

function generateSummary({ role, seniority, industry, skills }: { role: string; seniority: string; industry: string; skills: string[] }) {
  const top = skills.slice(0, 3).join(", ");
  const s = seniority ? `${seniority.toLowerCase()} ` : "";
  const ind = industry ? ` in ${industry}` : "";
  return `Results-driven ${s}${role}${ind} with strength in ${top}. Proven ability to deliver measurable outcomes, collaborate across teams, and continuously improve processes.`;
}

function improveSummary(base: string, opts: { role: string; seniority: string; industry: string; skills: string[]; tone: "Professional" | "Impactful" | "Concise" }) {
  const { role, seniority, industry, skills, tone } = opts;
  const lead = seniority ? `${seniority} ${role}` : role;
  const top = skills.slice(0, 5);
  const key = top.length ? top.join(", ") : "core competencies";
  const ind = industry ? ` within ${industry}` : "";
  const bodies = {
    Professional: `Seasoned ${lead}${ind} specializing in ${key}. Demonstrated track record delivering high-quality outcomes, mentoring teams, and aligning initiatives with business goals.`,
    Impactful: `High-impact ${lead}${ind} with expertise in ${key}. Known for accelerating delivery, raising quality bars, and driving measurable product and revenue outcomes.`,
    Concise: `${lead}${ind}. Focus: ${key}. Executes fast, communicates clearly, delivers results.`,
  } as const;
  return bodies[tone];
}

export default function CreateResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { streamAI, reset: resetAIStream } = useAIStream();
  const { getPageTransition, getProgressTransition, shouldReduceMotion } = useOptimizedAnimations();

  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    searchParams?.get("templateId") || allowedTemplateIds[0]
  );

  const [target, setTarget] = useState({
    role: searchParams?.get("role") || "Software Engineer",
    industry: (searchParams?.get("industry") as string) || "Software",
    seniority: (searchParams?.get("seniority") as string) || "Mid",
  });

  const [personal, setPersonal] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    photoUrl: "",
  });

  const [resumeName, setResumeName] = useState(() => {
    const raw = searchParams?.get("prefillName");
    return raw ? raw.trim().slice(0, 100) : "";
  });

  const [skills, setSkills] = useState<string[]>(() => roleSkillPresets[target.role] || []);
  const [summary, setSummary] = useState<string>("");
  const [tone, setTone] = useState<"Professional" | "Impactful" | "Concise">("Professional");
  const [previewZoom, setPreviewZoom] = useState(1.05);
  const [experience, setExperience] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [education, setEducation] = useState<EduItem[]>([]);
  const [certifications, setCertifications] = useState<CertType[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [jobDesc, setJobDesc] = useState<string>("");
  const [jdSuggestions, setJdSuggestions] = useState<string[]>([]);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsRecs, setAtsRecs] = useState<string[]>([]);
  const [career, setCareer] = useState<{ skillGaps: string[]; salaryInsights: string; progression: string[]; interviewPrep: string[] } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const personalWebsite = useMemo(() => sanitizeUrl(personal.website), [personal.website]);
  const personalLinkedIn = useMemo(() => sanitizeUrl(personal.linkedin), [personal.linkedin]);

  useEffect(() => {
    const candidate = personal.name.trim();
    if (!resumeName && candidate.length >= 3) {
      setResumeName(candidate.slice(0, 100));
    }
  }, [personal.name, resumeName]);
  const experienceHasGaps = useMemo(
    () =>
      experience.some((exp) => {
        const company = exp.company?.trim();
        const role = (exp.position || exp.role)?.trim();
        const start = exp.startDate?.trim();
        const hasAnyDetail = Boolean(
          company ||
            role ||
            start ||
            exp.endDate?.trim() ||
            exp.description?.trim() ||
            (Array.isArray(exp.achievements) && exp.achievements.length > 0) ||
            (Array.isArray(exp.highlights) && exp.highlights.length > 0)
        );
        if (!hasAnyDetail) {
          return false;
        }
        return !company || !role || !start;
      }),
    [experience]
  );

  const validateStep = useCallback(
    (step: StepId): string[] => {
      const errors: string[] = [];

      if (step === 1) {
        const trimmedName = personal.name.trim();
        const trimmedEmail = personal.email.trim();
        const trimmedPhone = personal.phone.trim();

        if (!trimmedName) {
          errors.push("Add your full name so we can personalize the resume header.");
        } else if (trimmedName.length < 3) {
          errors.push("Name should be at least 3 characters.");
        }

        if (!trimmedEmail) {
          errors.push("Email address is required.");
        } else if (!emailPattern.test(trimmedEmail)) {
          errors.push("Enter a valid email address (e.g. name@company.com).");
        }

        if (trimmedPhone && !hasMinimumDigits(trimmedPhone, 7)) {
          errors.push("Phone number should include at least 7 digits.");
        }

        if (personal.website.trim() && !personalWebsite) {
          errors.push("Website should be a full URL like https://yourname.com.");
        }

        if (personal.linkedin.trim() && !personalLinkedIn) {
          errors.push("LinkedIn link should include linkedin.com and a valid profile path.");
        }
      }

      if (step === 2) {
        if (!target.role.trim()) {
          errors.push("Select the role you're targeting.");
        }
        if (!target.industry.trim()) {
          errors.push("Choose an industry so we can tailor suggestions.");
        }
        if (!target.seniority.trim()) {
          errors.push("Select your seniority level.");
        }
        if (!selectedTemplateId) {
          errors.push("Pick a template to visualize your resume.");
        }
      }

      if (step === 3) {
        if (skills.length < 3) {
          errors.push("Add at least three key skills to showcase your strengths.");
        }
        if (summary && summary.trim().length < 40) {
          errors.push("Expand your summary to at least 40 characters to make it impactful.");
        }
      }

      if (step === 4 && experienceHasGaps) {
        errors.push("Complete each experience with a company, role, and start date or remove the partial entry.");
      }

      return errors;
    },
    [experienceHasGaps, personal.email, personal.linkedin, personal.name, personal.phone, personal.website, personalLinkedIn, personalWebsite, selectedTemplateId, skills.length, summary, target.industry, target.role, target.seniority]
  );

  const handlePrev = () => {
    setStepErrors([]);
    setCurrentStep((s) => (Math.max(1, (s - 1)) as StepId));
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);
    if (errors.length) {
      setStepErrors(errors);
      return;
    }
    setStepErrors([]);
    setCurrentStep((s) => (Math.min(10, (s + 1)) as StepId));
  };

  const contactFieldErrors = useMemo<ContactFieldErrors>(() => {
    const trimmedName = personal.name.trim();
    const trimmedEmail = personal.email.trim();
    const trimmedPhone = personal.phone.trim();
    const trimmedWebsite = personal.website.trim();
    const trimmedLinkedIn = personal.linkedin.trim();

    const errors: ContactFieldErrors = {};

    if (!trimmedName) {
      errors.name = "Full name is required.";
    } else if (trimmedName.length < 3) {
      errors.name = "Name should be at least 3 characters.";
    }

    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!emailPattern.test(trimmedEmail)) {
      errors.email = "Enter a valid email address (e.g. name@company.com).";
    }

    if (trimmedPhone && !hasMinimumDigits(trimmedPhone, 7)) {
      errors.phone = "Phone number should include at least 7 digits.";
    }

    if (trimmedWebsite && !personalWebsite) {
      errors.website = "Website should be a full URL like https://yourname.com.";
    }

    if (trimmedLinkedIn && !personalLinkedIn) {
      errors.linkedin = "LinkedIn link should include linkedin.com and a valid profile path.";
    }

    return errors;
  }, [personal.email, personal.linkedin, personal.name, personal.phone, personal.website, personalLinkedIn, personalWebsite]);

  const showContactValidation = currentStep === 1 && stepErrors.length > 0;

  const isStepReady = useMemo(() => {
    switch (currentStep) {
      case 1: {
        return Object.keys(contactFieldErrors).length === 0;
      }
      case 2:
        return Boolean(
          target.role.trim() &&
            target.industry.trim() &&
            target.seniority.trim() &&
            selectedTemplateId
        );
      case 3:
        return skills.length >= 3 && (!summary || summary.trim().length >= 40);
      case 4:
        return !experienceHasGaps;
      default:
        return true;
    }
  }, [contactFieldErrors, currentStep, experienceHasGaps, selectedTemplateId, skills.length, summary, target.industry, target.role, target.seniority]);


  // Lightweight JD analyzer to extract role-relevant keywords
  const stopwords = useMemo(() => new Set([
    "and","the","for","with","from","that","this","into","your","you","our","are","will","have","has","not","but","all","per","via","as","an","or","be","to","of","in","on","at","by","a","is","we","they","their","it","them","them","who","what","when","where","why","how","over","under","across","between","within","must","should","can","able","experience","years","year","including","preferred","plus","etc","eg","i.e","ie"
  ]), []);

  const phraseLexicon = useMemo(() => [
    "machine learning","deep learning","natural language processing","computer vision","data analysis","data visualization","project management","product management","design systems","user research","test automation","continuous integration","continuous delivery","cloud computing","microservices architecture"
  ], []);

  const keywordLexicon = useMemo(() => new Set([
    // Tech
    "javascript","typescript","react","next.js","node","node.js","express","graphql","rest","api","python","pandas","numpy","sql","postgres","mysql","mongodb","docker","kubernetes","terraform","aws","gcp","azure","ci/cd","jest","vitest","cypress","playwright","tailwind","figma",
    // Product/Design/General
    "roadmapping","a/b testing","experimentation","analytics","stakeholder management","wireframing","prototyping","usability","accessibility","seo","sem",
    // Soft skills / process
    "communication","leadership","collaboration","mentoring","agile","scrum","kanban","prioritization","problem solving","critical thinking"
  ]), []);

  const extractKeywords = (text: string): string[] => {
    if (!text) return [];
  const found = new Map<string, number>();
    const lower = text.toLowerCase();
    // capture phrases first
    for (const p of phraseLexicon) {
      const re = new RegExp(p.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
      const matches = lower.match(re);
      if (matches && matches.length) found.set(p, (found.get(p) || 0) + matches.length);
    }
    // tokenize
    const tokens = lower
      .replace(/[^a-z0-9+.#/\-\s]/g, " ")
      .split(/\s+/)
      .filter(t => t && t.length > 2 && !stopwords.has(t));
    for (const t of tokens) {
      const norm = t;
      // favor lexicon terms; allow some tech tokens (e.g., next.js, node.js)
      if (keywordLexicon.has(norm) || /^(next\.js|node\.js|ci\/cd|a\/b)$/.test(norm)) {
        found.set(norm, (found.get(norm) || 0) + 1);
      }
    }
    return Array.from(found.entries()).sort((a,b) => b[1]-a[1]).map(([k]) => k).slice(0, 15);
  };
 
  const generateJobDescription = async () => {
    setIsAiWorking(true);
    try {
      const res = await fetch("/api/ai/generate-job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: target.role,
          company: "Leading Company",
          industry: target.industry,
          requirements: `${target.seniority} level position`
        })
      });
      const data = await res.json();
      if (data.jobDescription) {
        setJobDesc(data.jobDescription);
      }
    } catch (error) {
      console.error('Failed to generate job description:', error);
    } finally {
      setIsAiWorking(false);
    }
  };

  const generateSkillsFromAI = async () => {
    setIsAiWorking(true);
    try {
      const res = await fetch("/api/ai/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: target.role,
          industry: target.industry,
          seniority: target.seniority,
          experience: `Professional experience in ${target.role}`
        })
      });
      const data = await res.json();
      if (data.skills && Array.isArray(data.skills)) {
        // Add suggested skills that aren't already in the list
        data.skills.forEach((skill: string) => {
          if (!skills.includes(skill)) {
            addSkill(skill);
          }
        });
      }
    } catch (error) {
      console.error('Failed to generate skills:', error);
    } finally {
      setIsAiWorking(false);
    }
  };

  const analyzeJD = async () => {
    if (!jobDesc.trim()) return;
    
    setIsAiWorking(true);
    try {
      const res = await fetch("/api/ai/extract-skills-from-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDesc,
          currentSkills: skills
        })
      });
      
      const data = await res.json();
      if (data.skills && Array.isArray(data.skills)) {
        // Filter out skills that are already in the list (case-insensitive)
        const newSkills = (data.skills as string[]).filter(
          (skill: string) => !skills.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        setJdSuggestions(newSkills);
        
        // If no custom summary yet, regenerate with JD context
        if (!summary && newSkills.length > 0) {
          const enriched = Array.from(new Set([...skills, ...newSkills.slice(0, 3)]));
          setSummary(generateSummary({ 
            role: target.role, 
            seniority: target.seniority, 
            industry: target.industry, 
            skills: enriched 
          }));
        }
      }
    } catch (error) {
      console.error('Failed to analyze job description:', error);
      // Fallback to simple keyword extraction
      const kws = extractKeywords(jobDesc);
      const miss = kws.filter(k => !skills.some(s => s.toLowerCase() === k.toLowerCase()));
      setJdSuggestions(miss);
    } finally {
      setIsAiWorking(false);
    }
  };

  const aiImproveSummary = useCallback(async () => {
    resetAIStream();
    await streamAI('/api/ai/summary-stream', {
      role: target.role,
      seniority: target.seniority,
      industry: target.industry,
      skills,
      current: summary
    }, {
      onProgress: (text) => {
        setSummary(text);
      },
      onComplete: (text) => {
        setSummary(text);
      },
      onError: (error) => {
        console.error('AI Summary failed:', error);
      }
    });
  }, [target.role, target.seniority, target.industry, skills, summary, streamAI, resetAIStream]);



  const getCareerIntel = async () => {
    setIsAiWorking(true);
    try {
      const res = await fetch("/api/ai/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: `${target.seniority} ${target.role}`.trim(), location: personal.location, skills, resume: draftResume })
      });
      const data = await res.json();
      setCareer({
        skillGaps: Array.isArray(data?.skillGaps) ? data.skillGaps : [],
        salaryInsights: typeof data?.salaryInsights === "string" ? data.salaryInsights : "",
        progression: Array.isArray(data?.progression) ? data.progression : [],
        interviewPrep: Array.isArray(data?.interviewPrep) ? data.interviewPrep : [],
      });
    } finally { setIsAiWorking(false); }
  };

  const aiSuggestCerts = async () => {
    setIsAiWorking(true);
    try {
      const res = await fetch("/api/ai/certifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: `${target.seniority} ${target.role}`.trim(), industry: target.industry, skills }) });
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items as Array<{ name?: string; issuer?: string }> : [];
      if (items.length) {
        setCertifications(prev => {
          const merged = [...prev];
          for (const it of items) {
            const name = (it.name || "").trim();
            if (!name) continue;
            if (!merged.some(m => m.name?.toLowerCase() === name.toLowerCase())) {
              merged.push({ id: crypto.randomUUID?.() || undefined, name, issuer: it.issuer || "", date: "" });
            }
          }
          return merged as CertType[];
        });
      }
    } finally {
      setIsAiWorking(false);
    }
  };

  const aiSuggestInterests = async () => {
    setIsAiWorking(true);
    try {
      const res = await fetch("/api/ai/interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: `${target.seniority} ${target.role}`.trim(), summary }) });
      const data = await res.json();
      const items = Array.isArray(data?.items) ? (data.items as string[]) : [];
      if (items.length) {
        setInterests(prev => Array.from(new Set([...(prev || []), ...items])));
      }
    } finally {
      setIsAiWorking(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) return;
  const list: Template[] = await res.json();
  // normalize and filter allowed
  const allow: Set<string> = new Set<string>(Array.from(allowedTemplateIds));
  const filtered = list.filter(t => allow.has(t._id.toLowerCase()))
        if (!cancelled) setTemplates(filtered);
      } catch {
        // ignore
      }
    };
    loadTemplates();
    return () => { cancelled = true; };
  }, []);

  // Update presets when role changes
  useEffect(() => {
    if (!skills.length && roleSkillPresets[target.role]) {
      setSkills(roleSkillPresets[target.role]);
    }
  }, [target.role]);

  const progress = (currentStep / steps.length) * 100;

  // Create immediate resume data for validation but debounce for preview
  const immediateDraftResume: ResumeData = useMemo(() => ({
    _id: "draft",
    title: (resumeName || `${target.seniority} ${target.role} Resume`).trim(),
    templateId: selectedTemplateId,
    content: {
      personalInfo: {
        name: personal.name,
        email: personal.email,
        phone: personal.phone,
        location: personal.location,
        address: personal.location,
        website: personalWebsite || personal.website.trim(),
        linkedin: personalLinkedIn || personal.linkedin.trim(),
        photoUrl: personal.photoUrl,
        summary: summary || generateSummary({ role: target.role, seniority: target.seniority, industry: target.industry, skills }),
      },
      workExperience: experience,
      education: education.map(edu => ({
        ...edu,
        studyType: edu.degree,
        area: edu.field,
        date: edu.graduationDate,
        score: edu.gpa,
        description: edu.description,
      })),
      skills: [
        { category: "Core", items: skills }
      ],
      projects,
      certifications,
      languages,
      interests,
    },
  }), [certifications, education, experience, interests, languages, personal, personalLinkedIn, personalWebsite, projects, resumeName, selectedTemplateId, skills, summary, target.industry, target.role, target.seniority]);

  // Debounce the resume data for LivePreview updates (300ms delay)
  const [debouncedDraftResume] = useDebounce(immediateDraftResume, 300);
  
  // Use immediate data for AI calls, debounced for preview
  const draftResume = immediateDraftResume;

  const selectedTemplate = useMemo(() => templates.find(t => t._id.toLowerCase() === selectedTemplateId), [templates, selectedTemplateId]);

  // Dynamic theme colors based on selected template
  const themeColor = useMemo(() => {
    const color = selectedTemplate?.primary || "#EC4899";
    return color;
  }, [selectedTemplate]);

  const runATSCheck = useCallback(async () => {
    const currentResume = immediateDraftResume;
    if (!currentResume) return;
    setIsAiWorking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for ATS analysis
      
      const res = await fetch("/api/ai/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDesc, resume: currentResume }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data?.score === "number") setAtsScore(Math.max(0, Math.min(100, Math.round(data.score))));
      setAtsRecs(Array.isArray(data?.recommendations) ? data.recommendations : []);
      const missing = Array.isArray(data?.missingKeywords) ? data.missingKeywords as string[] : [];
      if (missing.length) setJdSuggestions(prev => Array.from(new Set([...prev, ...missing])));
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('ATS Check failed:', error);
      }
    } finally { 
      setIsAiWorking(false); 
    }
  }, [jobDesc, immediateDraftResume]);

  const createResume = async () => {
    // Prevent duplicate submissions
    if (isCreating) {
      console.warn('Resume creation already in progress, skipping duplicate request');
      return;
    }
    
    setIsCreating(true);
    setIsLoading(true);
    try {
      // Debug: Log the values we're working with
      console.log('Creating resume with values:', {
        draftResumeTitle: draftResume.title,
        targetRole: target.role,
        targetSeniority: target.seniority,
        personalName: personal.name,
        personalEmail: personal.email,
      });

      // Clean and validate data before sending
      // Schema preprocessor will convert empty strings to undefined
      const cleanPersonalInfo: Record<string, string> = {};

      const trimmedPersonalName = personal.name.trim();
      const trimmedEmail = personal.email.trim();
      const trimmedPhone = personal.phone.trim();
      const trimmedLocation = personal.location.trim();
      const sanitizedWebsite = personalWebsite;
      const sanitizedLinkedIn = personalLinkedIn;

      if (trimmedPersonalName) cleanPersonalInfo.name = trimmedPersonalName;
      if (trimmedEmail) cleanPersonalInfo.email = trimmedEmail;
      if (trimmedPhone) cleanPersonalInfo.phone = trimmedPhone;
      if (trimmedLocation) {
        cleanPersonalInfo.location = trimmedLocation;
        cleanPersonalInfo.address = trimmedLocation;
      }
      if (sanitizedWebsite) cleanPersonalInfo.website = sanitizedWebsite;
      if (sanitizedLinkedIn) cleanPersonalInfo.linkedin = sanitizedLinkedIn;
      if (personal.photoUrl) cleanPersonalInfo.photoUrl = personal.photoUrl;

      const resolvedSummary = summary && summary.trim().length > 0
        ? summary.trim()
        : generateSummary({ role: target.role, seniority: target.seniority, industry: target.industry, skills });

      cleanPersonalInfo.summary = resolvedSummary;

      // Filter out incomplete work experience entries
      const cleanWorkExperience = experience.filter(exp => 
        exp.company && exp.company.trim() !== '' && 
        (exp.position || exp.role) && 
        exp.startDate && exp.startDate.trim() !== ''
      ).map(exp => ({
        ...exp,
        position: exp.position || exp.role,
        role: exp.role || exp.position,
        endDate: exp.endDate || 'Present',
      }));

      // Filter out incomplete education entries
      const cleanEducation = education.filter(edu => 
        edu.institution && edu.institution.trim() !== '' &&
        edu.degree && edu.degree.trim() !== '' &&
        edu.field && edu.field.trim() !== '' &&
        edu.graduationDate && edu.graduationDate.trim() !== ''
      ).map(edu => ({
        ...edu,
        studyType: edu.degree,
        area: edu.field,
        date: edu.graduationDate,
        score: edu.gpa || undefined,
        description: edu.description || undefined,
      }));

      // Filter out incomplete certifications
      const cleanCertifications = certifications.filter(cert =>
        cert.name && cert.name.trim() !== '' &&
        cert.issuer && cert.issuer.trim() !== '' &&
        cert.date && cert.date.trim() !== ''
      ).map(cert => ({
        ...cert,
        credential: cert.credential || undefined,
      }));

      // Filter out incomplete projects
      const cleanProjects = projects.filter(proj =>
        proj.name && proj.name.trim() !== ''
      ).map(proj => ({
        ...proj,
        description: proj.description && proj.description.trim() !== '' ? proj.description : 'Project description',
        technologies: (proj.technologies || []).filter(t => t && t.trim() !== ''),
        link: sanitizeUrl(proj.link) || '',
        github: sanitizeUrl(proj.github) || '',
      }));

      // Filter out empty languages
      const cleanLanguages = languages.filter(lang =>
        lang.name && lang.name.trim() !== ''
      );

      // Filter out empty interests
      const cleanInterests = interests.filter(int =>
        int && int.trim() !== ''
      );

      const cleanContent = {
        personalInfo: cleanPersonalInfo,
        workExperience: cleanWorkExperience.length > 0 ? cleanWorkExperience : undefined,
        education: cleanEducation.length > 0 ? cleanEducation : undefined,
        skills: skills.length > 0 ? [{ category: "Core", items: skills }] : undefined,
        projects: cleanProjects.length > 0 ? cleanProjects : undefined,
        certifications: cleanCertifications.length > 0 ? cleanCertifications : undefined,
        languages: cleanLanguages.length > 0 ? cleanLanguages : undefined,
        interests: cleanInterests.length > 0 ? cleanInterests : undefined,
      };

      // Ensure title is never empty or undefined - build from scratch with guaranteed fallback
      let resumeTitle = resumeName.trim();

      // Prefer the live draft title if the user hasn't set an explicit name
      if (!resumeTitle && draftResume.title && draftResume.title.trim() !== '') {
        resumeTitle = draftResume.title.trim();
      }
      // Try to build from target role/seniority when no explicit title is available
      if (!resumeTitle && target.role && target.role.trim() !== '') {
        const seniorityPart = target.seniority && target.seniority.trim() !== '' ? target.seniority.trim() + ' ' : '';
        const now = new Date();
        const timestamp = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        resumeTitle = `${seniorityPart}${target.role.trim()} Resume - ${timestamp} (${randomSuffix})`;
      }
      // Absolute fallback
      if (!resumeTitle) {
        const now = new Date();
        const timestamp = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        resumeTitle = `Professional Resume - ${timestamp} (${randomSuffix})`;
      }

      console.log('Creating resume with title:', resumeTitle);
      console.log('Clean personal info:', cleanPersonalInfo);
      console.log('Website value:', cleanPersonalInfo.website, 'Type:', typeof cleanPersonalInfo.website);

      const normalizedTitle = resumeTitle.trim().slice(0, 100) || 'Untitled Resume';
      const requestBody = {
        title: normalizedTitle,
        name: normalizedTitle,
        templateId: selectedTemplateId,
        content: cleanContent,
      };
      
      console.log('Full request body:', JSON.stringify(requestBody, null, 2));

      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Resume creation failed:', errorData);
        console.error('Response status:', res.status);
        console.error('Full error details:', JSON.stringify(errorData, null, 2));
        throw new Error(JSON.stringify(errorData, null, 2));
      }
      
      const created = await res.json();
      console.log('✅ Resume creation response:', created);
      
      const createdResumeId = created?.data?._id ?? created?._id;
      console.log('📝 Extracted resume ID:', createdResumeId);

      if (!createdResumeId) {
        console.error('❌ Unexpected create resume response structure:', created);
        throw new Error('Resume was created but response did not include an ID');
      }

  console.log('🚀 Redirecting to resumes dashboard after creation');
  router.push('/dashboard/resumes');
    } catch (e) {
      console.error('Failed to create resume:', e);
      alert('Failed to create resume. Please check the console for details.');
    } finally {
      setIsLoading(false);
      setIsCreating(false);
    }
  };

  const addSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev : [...prev, s]);
  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white relative overflow-hidden">
      {/* Optimized Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {!shouldReduceMotion && (
          <>
            {/* Simplified Floating Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/8 to-purple-500/8 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-cyan-500/8 to-blue-500/8 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          </>
        )}
        
        {/* Static Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <motion.div {...getPageTransition()} className="relative z-10 py-6 md:py-8">
        {/* Modern Header with enhanced progress */}
        <div className="mb-8 px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Create Your Professional Resume
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Build a standout resume with our AI-powered wizard. Choose from premium templates and get instant feedback.
            </p>
          </motion.div>

          {/* Enhanced Progress Stepper */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center relative z-10">
                      <motion.div
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? 'border-transparent' 
                            : isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent' 
                            : 'border-neutral-600 bg-neutral-800/50'
                        }`}
                        style={isActive ? {
                          background: `linear-gradient(to right, ${themeColor}, ${themeColor}cc)`,
                          boxShadow: `0 4px 20px ${themeColor}40`
                        } : {}}
                        whileHover={{ scale: 1.05 }}
                        animate={isActive ? { 
                          boxShadow: [`0 0 20px ${themeColor}30`, `0 0 30px ${themeColor}40`, `0 0 20px ${themeColor}30`]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white"
                          >
                            ✓
                          </motion.div>
                        ) : (
                          <div className={`${isActive ? 'text-white' : 'text-neutral-400'}`}>
                            {step.icon}
                          </div>
                        )}
                      </motion.div>
                      <div className={`mt-2 text-xs font-medium text-center max-w-20 ${
                        isActive ? 'text-pink-400' : isCompleted ? 'text-green-400' : 'text-neutral-500'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Progress Line - Dynamic Color */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-neutral-800 -z-10">
                <motion.div 
                  className="h-full"
                  style={{ 
                    background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)`
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  transition={getProgressTransition()}
                />
              </div>
            </div>
            
            <div className="text-center mt-4">
              <span className="text-sm text-neutral-400">
                Step {currentStep} of {steps.length} • {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 px-6 max-w-full mx-auto">
          {/* Left: Enhanced Wizard Card */}
          <div className="xl:w-2/5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl"
            >
              <div className="p-6 pb-4 bg-gradient-to-r from-neutral-800/50 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500">
                    {steps[currentStep - 1].icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{steps[currentStep - 1].title}</h3>
                    <p className="text-neutral-400 text-sm">{steps[currentStep - 1].description}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-4">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <ContactStep
                  personal={personal}
                  setPersonal={setPersonal}
                  errors={contactFieldErrors}
                  showValidation={showContactValidation}
                />
              )}

              {currentStep === 2 && (
                <TargetAndTemplateStep
                  target={target}
                  setTarget={setTarget}
                  templates={templates}
                  selectedTemplateId={selectedTemplateId}
                  setSelectedTemplateId={setSelectedTemplateId}
                  roleSkillPresets={roleSkillPresets}
                  setSkills={setSkills}
                  industries={industries}
                  seniorities={seniorities}
                />
              )}

              {currentStep === 3 && (
                <SkillsStep
                  target={target}
                  skills={skills}
                  setSkills={setSkills}
                  addSkill={addSkill}
                  removeSkill={removeSkill}
                  summary={summary}
                  setSummary={setSummary}
                  tone={tone}
                  setTone={setTone}
                  jobDesc={jobDesc}
                  setJobDesc={setJobDesc}
                  jdSuggestions={jdSuggestions}
                  setJdSuggestions={setJdSuggestions}
                  atsScore={atsScore}
                  isAiWorking={isAiWorking}
                  roleSkillPresets={roleSkillPresets}
                  generateJobDescription={generateJobDescription}
                  analyzeJD={analyzeJD}
                  runATSCheck={runATSCheck}
                  generateSkillsFromAI={generateSkillsFromAI}
                  aiImproveSummary={aiImproveSummary}
                  improveSummary={improveSummary}
                  generateSummary={generateSummary}
                />
              )}

              {currentStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <ExperienceStep
                    experience={experience}
                    setExperience={setExperience}
                    isAiWorking={isAiWorking}
                  />
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <ProjectsStep
                    projects={projects}
                    setProjects={setProjects}
                    isAiWorking={isAiWorking}
                  />
                </motion.div>
              )}

              {currentStep === 6 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <EducationStep
                    education={education}
                    setEducation={setEducation}
                  />
                </motion.div>
              )}

              {currentStep === 7 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <CertificationsStep
                    certifications={certifications}
                    setCertifications={setCertifications}
                    isAiWorking={isAiWorking}
                    aiSuggestCerts={aiSuggestCerts}
                    themeColor={themeColor}
                  />
                </motion.div>
              )}

              {currentStep === 8 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <LanguagesStep
                    languages={languages}
                    setLanguages={setLanguages}
                    themeColor={themeColor}
                  />
                </motion.div>
              )}

              {currentStep === 9 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <InterestsStep
                    interests={interests}
                    setInterests={setInterests}
                    isAiWorking={isAiWorking}
                    aiSuggestInterests={aiSuggestInterests}
                    themeColor={themeColor}
                  />
                </motion.div>
              )}

              {currentStep === 10 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <ReviewStep
                    personal={personal}
                    skills={skills}
                    summary={summary}
                    experience={experience}
                    projects={projects}
                    education={education}
                    certifications={certifications}
                    languages={languages}
                    interests={interests}
                    atsScore={atsScore}
                    atsRecs={atsRecs}
                    career={career}
                    isAiWorking={isAiWorking}
                    getCareerIntel={getCareerIntel}
                    setCurrentStep={(step: number) => {
                      setStepErrors([]);
                      setCurrentStep(step as StepId);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {stepErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold tracking-wide">Let’s tidy up a few things before moving on</div>
                    <ul className="space-y-1 list-disc list-inside">
                      {stepErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-neutral-700/50">
              <motion.button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-300 font-medium ${
                  currentStep === 1 
                    ? "border-neutral-700 bg-neutral-800/30 text-neutral-500 cursor-not-allowed" 
                    : "border-neutral-600 bg-neutral-800/50 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-700/50 hover:text-white"
                }`}
                whileHover={currentStep !== 1 ? { scale: 1.02, x: -2 } : {}}
                whileTap={currentStep !== 1 ? { scale: 0.98 } : {}}
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="text-sm text-neutral-400">
                  {currentStep === 10 ? 'Ready to create your resume?' : `${steps.length - currentStep} steps remaining`}
                </div>
                
                {currentStep === 10 ? (
                  <motion.button
                    onClick={createResume}
                    disabled={isLoading || isCreating}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-all duration-300 font-semibold text-white ${
                      isLoading || isCreating 
                        ? "opacity-50 cursor-not-allowed" 
                        : ""
                    }`}
                    style={{
                      background: isLoading 
                        ? `linear-gradient(to right, ${themeColor}80, ${themeColor}60)`
                        : `linear-gradient(to right, ${themeColor}, ${themeColor}dd)`,
                      boxShadow: isLoading ? 'none' : `0 4px 20px ${themeColor}40`
                    }}
                    whileHover={!isLoading ? { scale: 1.05, y: -1 } : {}}
                    whileTap={!isLoading ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Create Resume
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleNext}
                    disabled={!isStepReady}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-semibold text-white ${ 
                      !isStepReady
                        ? "bg-neutral-700/50 !text-neutral-500 cursor-not-allowed border border-neutral-700"
                        : ""
                    }`}
                    style={isStepReady ? {
                      background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)`,
                      boxShadow: `0 4px 20px ${themeColor}40`
                    } : {}}
                    whileHover={isStepReady ? { scale: 1.02, x: 2 } : {}}
                    whileTap={isStepReady ? { scale: 0.98 } : {}}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          </motion.div>
          </div>

          {/* Right: Enhanced Live Preview */}
          <div className="xl:w-3/5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl"
              >
                <div className="p-6 pb-4 bg-gradient-to-r from-neutral-800/50 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                        <Globe className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Live Preview</h3>
                        <p className="text-neutral-400 text-sm">Real-time resume preview</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isExporting}
                        onClick={async () => {
                          const el = previewRef.current;
                          if (!el) {
                            toast.error("Preview not ready yet");
                            return;
                          }

                          setIsExporting(true);
                          const toastId = "create-export-pdf";
                          toast.loading("Opening print dialog...", { id: toastId });
                          try {
                            const { exportElementToPDFNative } = await import('@/lib/export/pdf-export');
                            await exportElementToPDFNative(el, `${draftResume.title || 'resume'}.pdf`);
                            toast.success("Print dialog opened! Save as PDF.", { id: toastId, duration: 5000 });
                          } catch (error) {
                            console.error("PDF export failed", error);
                            toast.error("Couldn't open print dialog, please try again", { id: toastId });
                          } finally {
                            setIsExporting(false);
                          }
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 border-emerald-500/40"
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </>
                        )}
                      </Button>
                      <motion.div 
                        className="flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-xs text-neutral-400 px-2">
                          {Math.round(previewZoom * 100)}%
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setPreviewZoom(z => Math.max(0.7, parseFloat((z - 0.1).toFixed(2))))} 
                          className="text-neutral-400 hover:text-white hover:bg-neutral-700"
                          title="Zoom out"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs w-12 text-center text-neutral-400 font-mono">
                          {Math.round(previewZoom * 100)}%
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setPreviewZoom(z => Math.min(1.6, parseFloat((z + 0.1).toFixed(2))))} 
                          className="text-neutral-400 hover:text-white hover:bg-neutral-700"
                          title="Zoom in"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-4">
                  <div className="w-full flex justify-center">
                    {selectedTemplate ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <LivePreview 
                          resumeData={debouncedDraftResume}
                          templateId={selectedTemplateId}
                          zoom={previewZoom}
                          className="w-full"
                          ref={previewRef}
                        />
                        {/* Glowing border effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg blur opacity-75 pointer-events-none" />
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-[297mm] max-w-[210mm] bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-lg shadow-xl overflow-hidden flex flex-col items-center justify-center text-neutral-400 border border-neutral-600/50"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-600 mb-4">
                          <FileText className="h-12 w-12" />
                        </div>
                        <div className="text-lg font-medium mb-2">Select a Template</div>
                        <div className="text-sm text-center px-6">
                          Choose from our professional templates to see your resume come to life
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
