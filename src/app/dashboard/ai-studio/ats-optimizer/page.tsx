"use client";

import React, { useState, useRef, useEffect, useCallback, ComponentType } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { 
  Upload, 
  FileCheck2, 
  BrainCircuit, 
  Sparkles, 
  Rocket, 
  Users, 
  Trophy, 
  Clock, 
  Wand2, 
  ArrowRight, 
  ArrowUpRight,
  Star, 
  Cpu, 
  Globe, 
  MousePointerClick, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb, 
  Download, 
  Share2, 
  Eye, 
  ChevronRight,
  Loader2,
  X,
  Shield,
  Database,
  Cloud,
  BarChart3,
  Key,
  XCircle,
  TrendingUp
} from 'lucide-react';

// Particle Background Component
const ParticleBackground = () => {
  const particlesRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20"
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: 0
          }}
          animate={{
            opacity: [0, 0.4, 0],
            y: [`${particle.y}vh`, `${particle.y - 20}vh`],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};

// Floating Orbs Component
const FloatingOrbs = () => {
  return (
    <>
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </>
  );
};

// 3D Hover Card Component
const HoverCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
};

// Enhanced UI Components with dark theme styling
type CardProps = { children: React.ReactNode; className?: string };
const Card = ({ children, className = "" }: CardProps) => (
  <HoverCard className={`relative rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md p-6 sm:p-8 overflow-hidden ${className}`}>
    {children}
  </HoverCard>
);

const CardContent = ({ children, className = "" }: CardProps) => (
  <div className={`relative ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }: CardProps) => (
  <div className={`relative pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }: CardProps) => (
  <h2 className={`text-xl font-semibold text-white ${className}`}>
    {children}
  </h2>
);

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> & { 
  className?: string; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const Button = ({ children, className = "", variant = 'primary', size = 'md', ...props }: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed group";
  const variants = {
    primary: "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600 focus:ring-pink-500 shadow-lg hover:shadow-xl",
    secondary: "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 focus:ring-neutral-500 shadow-md hover:shadow-lg",
    outline: "border border-neutral-700 text-neutral-300 bg-transparent hover:bg-neutral-800 focus:ring-neutral-500",
    ghost: "text-neutral-400 hover:text-white hover:bg-neutral-800"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-base"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'>;
const Textarea = (props: TextareaProps) => (
  <motion.textarea 
    className="w-full p-4 rounded-xl border border-neutral-700 bg-neutral-800 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-neutral-300 placeholder-neutral-500"
    whileFocus={{ scale: 1.01 }}
    {...props} 
  />
);

// Modern Stats Component with dark theme
const StatsCard = ({ icon: Icon, title, value, description }: { 
  icon: ComponentType<{className?: string}>, title: string, value: string, description: string 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

 return (
   <motion.div
     ref={ref}
     initial={{ opacity: 0, y: 20 }}
     animate={isInView ? { opacity: 1, y: 0 } : {}}
     transition={{ duration: 0.6 }}
     className="bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700 shadow-lg">
      <div className="flex items-center gap-4">
        <motion.div 
          className="p-3 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl text-white shadow-md"
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-neutral-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-3">{description}</p>
    </motion.div>
  );
};

// Types
const analysisSteps = [
  "Parsing Resume & Job Description...",
  "Analyzing Keywords & Skills Match...", 
  "Evaluating Experience Relevancy...",
  "Checking for ATS Formatting...",
  "Compiling Actionable Recommendations...",
  "Finalizing Your Score..."
];

type JobSuggestion = { 
  title: string; 
  company: string; 
  location: string; 
  description: string; 
  keywords: string[]; 
  jobDescriptionText?: string; 
};

type ATSAnalysis = { 
  score: number; 
  categoryScores?: {
    contactInfo: number;
    workExperience: number;
    education: number;
    skills: number;
    formatting: number;
    keywords: number;
  };
  keywordAnalysis?: {
    totalKeywords: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    matchPercentage: number;
  };
  atsCompatibility?: {
    hasProblems: boolean;
    issues: string[];
    warnings: string[];
    goodPoints: string[];
  };
  recommendations: Array<{
    priority: "HIGH" | "MEDIUM" | "LOW";
    category: string;
    issue: string;
    action: string;
    impact: string;
  }> | string[];
  sectionAnalysis?: {
    summary: { status: "good" | "needs-work" | "missing"; feedback: string };
    experience: { status: "good" | "needs-work" | "missing"; feedback: string };
    education: { status: "good" | "needs-work" | "missing"; feedback: string };
    skills: { status: "good" | "needs-work" | "missing"; feedback: string };
  };
  // Legacy fields for backward compatibility
  missingKeywords?: string[]; 
};

type RawJobSuggestion = Partial<Omit<JobSuggestion, "keywords">> & {
  keywords?: string[] | string | null;
};

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

type AutoTableCellData = {
  section: "head" | "body" | "foot";
  column: { index: number };
  cell: { styles: { halign?: string } };
};

type PdfTextItem = { str: string };

const isPdfTextItem = (item: unknown): item is PdfTextItem =>
  typeof (item as PdfTextItem)?.str === "string";

const normalizeJobSuggestion = (job: RawJobSuggestion): JobSuggestion => ({
  title: job.title ?? "Untitled Role",
  company: job.company ?? "Unknown Company",
  location: job.location ?? "Remote",
  description: job.description ?? "",
  jobDescriptionText: job.jobDescriptionText,
  keywords: Array.isArray(job.keywords)
    ? job.keywords
    : typeof job.keywords === "string"
      ? job.keywords.split(/,\s*/)
      : [],
});

type PDFJS = typeof import('pdfjs-dist');

export default function ATSOptimizerPage() {
  // PDF.js and state management
  const pdfjsRef = useRef<PDFJS | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [resumeText, setResumeText] = useState<string>("");
  const [jd, setJd] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [result, setResult] = useState<ATSAnalysis | null>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<JobSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSuggestingJob, setIsSuggestingJob] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isLoadingMoreJobs, setIsLoadingMoreJobs] = useState<boolean>(false);

  // Load PDF.js dynamically using local worker file
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        const pdfjsModule = await import("pdfjs-dist");
        pdfjsModule.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        pdfjsRef.current = pdfjsModule;
        setPdfjsLoaded(true);
        console.log("PDF.js loaded successfully with local worker");
      } catch (error) {
        console.error("Failed to load PDF.js:", error);
        setPdfError("PDF library failed to load. Please refresh the page and try again.");
      }
    };
    loadPdfJs();
  }, []);

  const handleExportReport = () => {
    if (!result) return;

    const doc: JsPdfWithAutoTable = new jsPDF();
    const getNextTableStartY = (fallback: number) =>
      (doc.lastAutoTable?.finalY ?? fallback) + 10;
    const { score, missingKeywords, recommendations } = result;

    // Header
    doc.setFontSize(20);
    doc.text("ATS Analysis Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    // Score
  autoTable(doc, {
    startY: 40,
    head: [['ATS Match Score']],
    body: [[`${score}%`]],
    theme: 'grid',
    headStyles: { fillColor: [219, 39, 119] },
  });

    // Missing Keywords
    autoTable(doc, {
    startY: getNextTableStartY(40),
        head: [['Missing Keywords']],
        body: (missingKeywords && missingKeywords.length > 0) ? missingKeywords.map(k => [k]) : [['Great! No critical keywords are missing.']],
        theme: 'striped',
        headStyles: { fillColor: [249, 115, 22] },
    });

    // Recommendations
    const recommendationsText = typeof recommendations === 'string' 
      ? recommendations 
      : Array.isArray(recommendations) && recommendations.length > 0 && typeof recommendations[0] === 'object'
      ? recommendations.map((r: any) => `[${r.priority}] ${r.issue}\n${r.action}`).join('\n\n')
      : JSON.stringify(recommendations);
    
    autoTable(doc, {
    startY: getNextTableStartY(40),
        head: [['Actionable Recommendations']],
        body: [[recommendationsText]],
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166] },
    didParseCell: (data: AutoTableCellData) => {
      if (data.section === 'body' && data.column.index === 0) {
        data.cell.styles.halign = 'left';
      }
    }
    });

    // Footer with signature
  const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Generated by ResumeCraft', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save('ATS_Analysis_Report.pdf');
  };

  const handleShareResults = async () => {
    if (!result) return;

    const { score } = result;
    const shareData = {
        title: 'My ATS Analysis Report',
        text: `I just analyzed my resume and got an ATS match score of ${score}% with ResumeCraft!`,
        url: window.location.href,
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
        toast.success('Copied!', { description: 'Results copied to clipboard successfully.' });
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Share failed:', err);
            copyToClipboard();
        }
    } else {
        copyToClipboard();
    }
  };

  // Enhanced PDF parsing with better error handling and configuration
  const getTextFromPdf = useCallback(async (file: File): Promise<string> => {
    if (!pdfjsRef.current || !pdfjsLoaded) {
      throw new Error("PDF library is not loaded yet. Please try again in a moment.");
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsRef.current.getDocument({
        data: arrayBuffer,
        verbosity: 0,
        isEvalSupported: false,
        disableFontFace: true,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      let fullText = "";
      const totalPages = pdf.numPages;
      
      console.log(`Processing PDF with ${totalPages} pages...`);
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const items = Array.isArray(textContent.items) ? textContent.items : [];

          const pageText = items
            .flatMap((item) => {
              if (!isPdfTextItem(item)) {
                return [] as string[];
              }

              const trimmed = item.str.trim();
              if (!trimmed) {
                return [] as string[];
              }

              return trimmed.match(/[.!?;:]\s*$/) ? [trimmed] : [`${trimmed} `];
            })
            .join('');
            
          if (pageText.trim()) {
            fullText += pageText + '\n';
          }
          
          page.cleanup();
        } catch (pageError) {
          console.warn(`Failed to process page ${pageNum}:`, pageError);
          continue;
        }
      }
      
      pdf.cleanup();
      
      if (!fullText.trim()) {
        throw new Error("No readable text found in PDF. This might be a scanned document or image-based PDF. Please try converting it to a text-based PDF first.");
      }
      
      console.log(`Successfully extracted ${fullText.length} characters from PDF`);
      return fullText.trim();
    } catch (error: unknown) {
      console.error("PDF text extraction failed:", error);
      
      if (error instanceof Error) {
        if (error.name === 'InvalidPDFException') {
          throw new Error('Invalid PDF file. Please ensure the file is not corrupted.');
        } else if (error.name === 'MissingPDFException') {
          throw new Error('PDF file appears to be empty or corrupted.');
        } else if (error.message?.includes('Worker')) {
          throw new Error('PDF processing failed due to worker issues. Please refresh the page and try again.');
        } else {
          throw new Error(error.message || 'Failed to extract text from PDF. Please ensure it\'s a text-based PDF file.');
        }
      }
      throw new Error('An unknown error occurred during PDF processing.');
    }
  }, [pdfjsLoaded]);

  // Get resume text from file or textarea
  const getResumeText = useCallback(async (): Promise<string> => {
    if (file) {
      setIsParsing(true);
      setPdfError("");
      try {
        const text = await getTextFromPdf(file);
        setIsParsing(false);
        return text;
      } catch (error: unknown) {
        console.error("Failed to parse PDF:", error);
        setPdfError(error instanceof Error ? error.message : String(error));
        setIsParsing(false);
        throw error;
      }
    }
    return resumeText;
  }, [file, resumeText, getTextFromPdf]);

  // Handle job selection - populate job description
  const handleJobSelect = (job: JobSuggestion) => {
    setCurrentStep(3);
    if (job.jobDescriptionText) {
      setJd(job.jobDescriptionText);
    } else {
      const fallbackJD = `Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}

Job Description:
${job.description}

Required Skills:
${job.keywords.join(', ')}`;
      setJd(fallbackJD);
    }
  };

  // Suggest jobs based on resume
  const handleSuggestJob = async () => {
    if (!resumeText && !file) {
      toast.error("Resume Required", {
        description: "Please provide your resume first to get job suggestions."
      });
      return;
    }

    setIsSuggestingJob(true);
    setSuggestedJobs([]);
    setCurrentStep(2);
    
    try {
      const currentResume = await getResumeText();
      if (!currentResume.trim()) {
        toast.error("Extraction Failed", {
          description: "Could not extract text from resume. Please try again."
        });
        setIsSuggestingJob(false);
        return;
      }

      const response = await fetch("/api/ats/suggest-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: currentResume })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data?.jobs) && data.jobs.length > 0) {
        const jobs = data.jobs.map((job: RawJobSuggestion) => normalizeJobSuggestion(job));
        setSuggestedJobs(jobs);
      } else {
        toast.warning("No Suggestions", { description: "No job suggestions were returned by the AI." });
      }
    } catch (err: unknown) {
      console.error("Suggest jobs error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to get job suggestions.";
      toast.error("Error", { description: errorMsg });
    }
    setIsSuggestingJob(false);
  };

  // Suggest more jobs and append to existing list
  const handleSuggestMoreJobs = async () => {
    if (!resumeText && !file) {
      toast.error("Resume Required", {
        description: "Please provide your resume first to get job suggestions."
      });
      return;
    }

    setIsLoadingMoreJobs(true);
    try {
      const currentResume = await getResumeText();
      if (!currentResume.trim()) {
        toast.error("Extraction Failed", {
          description: "Could not extract text from resume. Please try again."
        });
        setIsLoadingMoreJobs(false);
        return;
      }

      const response = await fetch("/api/ats/suggest-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: currentResume })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data?.jobs) && data.jobs.length > 0) {
        const incoming = data.jobs.map((job: RawJobSuggestion) => normalizeJobSuggestion(job));

        // Deduplicate by title+company
        const seen = new Set<string>();
        const merged = [...suggestedJobs, ...incoming].filter(j => {
          const key = `${j.title}|${j.company}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setSuggestedJobs(merged);
      } else {
        toast.warning("No More Suggestions", {
          description: "No additional job suggestions were returned by the AI."
        });
      }
    } catch (err: unknown) {
      console.error("Suggest more jobs error:", err);
      toast.error("Suggestion Failed", {
        description: err instanceof Error ? err.message : "Failed to get more job suggestions."
      });
    }
    setIsLoadingMoreJobs(false);
  };

  // Analyze resume against job description
  const analyze = async () => {
    if (!jd.trim() || (!file && !resumeText.trim())) {
      toast.error("Missing Information", { description: "Please provide both resume and job description." });
      return;
    }

    setResult(null);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep(0);

    const progressInterval = setInterval(() => {
      setCurrentStep((prevStep) => Math.min(prevStep + 1, analysisSteps.length - 1));
      setAnalysisProgress((prev) => Math.min(prev + 15, 95));
    }, 800);

    try {
      const currentResume = await getResumeText();
      if (!currentResume.trim()) {
        toast.error("Extraction Failed", {
          description: "Could not extract text from resume. Please try again."
        });
        clearInterval(progressInterval);
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch("/api/ai/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resumeText: currentResume, 
          jobDescription: jd 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || errorData.error || `Analysis failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      const apiResponse = await response.json();
      const analysisData = apiResponse.data || apiResponse.analysis || apiResponse;
      
      clearInterval(progressInterval);
      setCurrentStep(analysisSteps.length - 1);
      setAnalysisProgress(100);

      if (analysisData?.score !== undefined) {
        setTimeout(() => {
          setResult(analysisData);
          setIsAnalyzing(false);
        }, 500);
      } else {
        throw new Error("No analysis data returned from API");
      }
    } catch (err: unknown) {
      clearInterval(progressInterval);
      console.error("Analysis error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze resume.";
      toast.error("Analysis Failed", { description: errorMsg });
      setIsAnalyzing(false);
    }
  };

  // File drag and drop handlers
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setResumeText("");
      setPdfError("");
      setCurrentStep(1);
    } else {
      toast.error("Invalid File Type", {
        description: "Please upload a PDF file only."
      });
    }
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setResumeText("");
      setPdfError("");
      setCurrentStep(1);
    } else if (f) {
      toast.error("Invalid File Type", {
        description: "Please upload a PDF file only."
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 h-full w-full bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <ParticleBackground />
      <FloatingOrbs />
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {(isAnalyzing || isSuggestingJob || isParsing) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="w-full max-w-md text-center bg-neutral-900/90 backdrop-blur-lg rounded-3xl p-8 border border-neutral-800"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center"
              >
                <Loader2 className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {isAnalyzing ? 'Analyzing...' : isParsing ? 'Reading PDF...' : 'Finding Jobs...'}
              </h2>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentStep} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  className="text-neutral-400 mb-6"
                >
                  {isAnalyzing ? analysisSteps[currentStep] : isParsing ? 'Extracting text content...' : 'Scanning job database...'}
                </motion.p>
              </AnimatePresence>
              {isAnalyzing && (
                <div className="w-full bg-neutral-800 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-pink-500 to-orange-500 h-full rounded-full" 
                    initial={{ width: "0%" }} 
                    animate={{ width: `${analysisProgress}%` }} 
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-1.5 text-sm text-neutral-300 mb-6"
          >
            <Sparkles className="h-4 w-4 text-pink-400" />
            AI-Powered ATS Optimizer v3
            <Rocket className="h-4 w-4 text-orange-400" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
          >
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Unlock Your Career Potential.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-neutral-400"
          >
            Go beyond simple keyword matching. Our advanced AI analyzes your resume against any job description to give you a true compatibility score and actionable feedback.
          </motion.p>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto"
          >
            <StatsCard 
              icon={Users} 
              title="Success Rate" 
              value="94%" 
              description="Candidates improved their interview rate"
            />
            <StatsCard 
              icon={Trophy} 
              title="Job Matches" 
              value="10K+" 
              description="Successful job placements this year"
            />
            <StatsCard 
              icon={Clock} 
              title="Avg. Time" 
              value="3 min" 
              description="To get comprehensive analysis"
            />
          </motion.div>
        </motion.section>

        {/* Main Application Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        >
          {/* Left Column - Input Section */}
          <div>
            <Card className="group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <motion.div 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-sm"
                    whileHover={{ rotate: 5 }}
                  >
                    1
                  </motion.div>
                  Your Resume
                </CardTitle>
                <p className="text-sm text-neutral-400 mt-1">Upload PDF or paste text</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-300 cursor-pointer group ${
                    isDragging ? 'border-pink-500 bg-neutral-800 scale-105' : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                  }`}
                  onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={handleFileClick}
                  whileHover={{ scale: 1.02 }}
                >
                  <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="hidden" />
                  {file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                        <FileCheck2 className="h-6 w-6 text-green-400" />
                        <div>
                          <p className="font-medium text-neutral-200 truncate max-w-xs">{file.name}</p>
                          <p className="text-sm text-neutral-400">PDF uploaded</p>
                        </div>
                      </div>
                      <Button onClick={(e) => { e.stopPropagation(); setFile(null); setPdfError(""); }} variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <motion.div 
                        className="mx-auto w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Upload className="h-6 w-6 text-white" />
                      </motion.div>
                      <p className="text-neutral-300"><span className="font-semibold text-pink-400">Click to upload</span> or drag & drop</p>
                      <p className="text-xs text-neutral-500">PDF files only • Max 10MB</p>
                    </div>
                  )}
                </motion.div>
                {pdfError && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <p className="text-red-400 text-sm">{pdfError}</p>
                  </motion.div>
                )}
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-neutral-800" />
                  <span className="flex-shrink mx-4 text-neutral-500 text-sm">OR</span>
                  <div className="flex-grow border-t border-neutral-800" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="resume-text" className="text-sm font-medium text-neutral-300">Paste Your Resume Text</label>
                  <Textarea id="resume-text" rows={6} value={resumeText} onChange={(e) => { setResumeText(e.target.value); setFile(null); setPdfError(""); }} placeholder="Paste your resume content here..." />
                </div>
              </CardContent>
            </Card>

            {/* AI Job Suggester Card */}
            <Card className="mt-8 group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <motion.div 
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-sm"
                        whileHover={{ rotate: 5 }}
                      >
                        2
                      </motion.div>
                      AI Job Suggester
                    </CardTitle>
                    <p className="text-sm text-neutral-400 mt-1">Find perfect matches for your skills</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSuggestJob}
                  disabled={isSuggestingJob || isParsing || (!file && !resumeText.trim()) || !pdfjsLoaded}
                  variant="secondary"
                  size="lg"
                  className="w-full mb-6"
                >
                  {isSuggestingJob ? (
                    <>
                      <Loader2 className="animate-spin" />
                      AI is thinking...
                    </>
                  ) : isParsing ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Reading PDF...
                    </>
                  ) : !pdfjsLoaded ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Wand2 />
                      Find My Dream Jobs
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {suggestedJobs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-bold text-green-400">Perfect Matches Found!</h4>
                      </div>

                      {suggestedJobs.map((job, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative p-6 bg-neutral-800 border-2 border-neutral-700 rounded-2xl cursor-pointer hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300"
                          onClick={() => handleJobSelect(job)}
                        >
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2 bg-pink-500 rounded-lg shadow-lg">
                              <MousePointerClick className="h-4 w-4 text-white" />
                            </div>
                          </div>

                          <div className="pr-12">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 bg-pink-500 rounded-lg flex-shrink-0">
                                <Cpu className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h5 className="font-bold text-lg text-white mb-1">{job.title}</h5>
                                <div className="flex items-center gap-2 text-sm text-neutral-400">
                                  <span className="font-medium">{job.company}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {job.location}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-neutral-300 mb-4 leading-relaxed">
                              {job.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {job.keywords.slice(0, 4).map((keyword, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.1 * i }}
                                  className="px-3 py-1 text-xs font-medium bg-neutral-700 text-neutral-300 rounded-full"
                                >
                                  {keyword}
                                </motion.span>
                              ))}
                              {job.keywords.length > 4 && (
                                <span className="px-3 py-1 text-xs font-medium bg-neutral-700 text-neutral-400 rounded-full">
                                  +{job.keywords.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="absolute inset-0 bg-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                      ))}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center pt-4 space-y-3"
                      >
                        <p className="text-sm text-neutral-500">
                          💡 Click any job to auto-fill the job description below
                        </p>
                        <div className="flex justify-center">
                          <Button
                            onClick={handleSuggestMoreJobs}
                            disabled={isLoadingMoreJobs || isParsing || isSuggestingJob}
                            variant="secondary"
                            size="md"
                            className="min-w-[220px]"
                          >
                            {isLoadingMoreJobs ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Suggesting more...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Suggest more jobs
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Section */}
          <div className="space-y-8">
            {/* Job Description Card */}
            <Card className="group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <motion.div 
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-sm"
                        whileHover={{ rotate: 5 }}
                      >
                        3
                      </motion.div>
                      Job Description
                    </CardTitle>
                    <p className="text-sm text-neutral-400 mt-1">Target role details</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="jd-text" className="text-sm font-medium text-neutral-300">Job Description Content</label>
                  <Textarea id="jd-text" rows={8} value={jd} onChange={(e) => { setJd(e.target.value); }} placeholder="Paste the job description here, or use AI to generate one..." />
                </div>
                <Button onClick={analyze} disabled={isAnalyzing || isParsing || (!file && !resumeText.trim()) || !jd.trim() || !pdfjsLoaded} variant="primary" size="lg" className="w-full">
                  {isAnalyzing ? 'Analyzing...' : 'Analyze My Resume'}
                  {!isAnalyzing && <ArrowUpRight className="h-5 w-5" />}
                </Button>
              </CardContent>
            </Card>

            {/* Results Card */}
            <AnimatePresence>
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-amber-400" />
                        Analysis Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Score Visualization */}
                      <div className="text-center">
                        <div className="relative inline-block">
                          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke="#374151"
                              strokeWidth="8"
                            />
                            <defs>
                              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#f97316" />
                              </linearGradient>
                            </defs>
                            <motion.circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke="url(#scoreGradient)"
                              strokeWidth="8"
                              strokeLinecap="round"
                              initial={{ strokeDashoffset: 339.292 }}
                              animate={{ strokeDashoffset: 339.292 - (339.292 * (result.score || 0)) / 100 }}
                              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                              strokeDasharray="339.292"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1, duration: 0.5, type: "spring" }}
                              className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
                            >
                              {result.score || 0}%
                            </motion.span>
                            <span className="text-sm font-semibold text-neutral-400 mt-1">ATS Match Score</span>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.5 }}
                              className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                                (result.score || 0) >= 80 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : (result.score || 0) >= 60 
                                    ? 'bg-yellow-500/20 text-yellow-300' 
                                    : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {(result.score || 0) >= 80 ? 'Excellent Match!' : 
                                (result.score || 0) >= 60 ? 'Good Match' : 
                                'Needs Improvement'}
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Category Scores Breakdown */}
                      {result.categoryScores && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-400" />
                            Score Breakdown
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(result.categoryScores).map(([key, value], i) => (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + (i * 0.1) }}
                                className="bg-neutral-800 border border-neutral-700 rounded-xl p-4"
                              >
                                <div className="text-sm text-neutral-400 mb-2 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="flex items-end gap-2">
                                  <span className={`text-2xl font-bold ${
                                    value >= 80 ? 'text-green-400' : 
                                    value >= 60 ? 'text-yellow-400' : 
                                    'text-red-400'
                                  }`}>
                                    {value}%
                                  </span>
                                </div>
                                <div className="mt-2 w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${value}%` }}
                                    transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                                    className={`h-full ${
                                      value >= 80 ? 'bg-green-500' : 
                                      value >= 60 ? 'bg-yellow-500' : 
                                      'bg-red-500'
                                    }`}
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Keyword Analysis */}
                      {result.keywordAnalysis && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Key className="h-5 w-5 text-purple-400" />
                            Keyword Match Analysis
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                              <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                                  {result.keywordAnalysis.matchPercentage}%
                                </div>
                                <div className="text-sm text-neutral-400 mt-2">
                                  Keywords Matched ({result.keywordAnalysis.matchedKeywords.length}/{result.keywordAnalysis.totalKeywords})
                                </div>
                              </div>
                            </div>
                            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                              <div className="text-center">
                                <div className="text-4xl font-bold text-amber-400">
                                  {result.keywordAnalysis.missingKeywords.length}
                                </div>
                                <div className="text-sm text-neutral-400 mt-2">
                                  Keywords to Add
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* ATS Compatibility Check */}
                      {result.atsCompatibility && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shield className="h-5 w-5 text-cyan-400" />
                            ATS Compatibility
                          </h3>
                          <div className="space-y-3">
                            {result.atsCompatibility.issues.length > 0 && (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                  <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-red-300 mb-2">Critical Issues</div>
                                    <ul className="space-y-1 text-sm text-red-200">
                                      {result.atsCompatibility.issues.map((issue, i) => (
                                        <li key={i}>• {issue}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                            {result.atsCompatibility.warnings.length > 0 && (
                              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-yellow-300 mb-2">Warnings</div>
                                    <ul className="space-y-1 text-sm text-yellow-200">
                                      {result.atsCompatibility.warnings.map((warning, i) => (
                                        <li key={i}>• {warning}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                            {result.atsCompatibility.goodPoints.length > 0 && (
                              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-green-300 mb-2">Good Practices</div>
                                    <ul className="space-y-1 text-sm text-green-200">
                                      {result.atsCompatibility.goodPoints.map((point, i) => (
                                        <li key={i}>• {point}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Missing Keywords Section (Legacy) */}
                      {(result.missingKeywords || result.keywordAnalysis?.missingKeywords) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-400" />
                          <h3 className="text-xl font-bold text-white">Missing Keywords</h3>
                        </div>
                        
                        {(result.missingKeywords && result.missingKeywords.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {result.missingKeywords.map((keyword, i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.8 + (i * 0.1) }}
                                className="px-3 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-md text-sm"
                              >
                                {keyword}
                              </motion.span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <p className="text-green-300 font-medium">Great! No critical keywords are missing.</p>
                          </div>
                        )}
                      </motion.div>
                      )}

                      {/* Recommendations Section - Priority-Based */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <Lightbulb className="h-5 w-5 text-teal-400" />
                          <h3 className="text-xl font-bold text-white">Recommendations</h3>
                        </div>
                        
                        {Array.isArray(result.recommendations) && result.recommendations.length > 0 && typeof result.recommendations[0] === 'object' ? (
                          <div className="space-y-4">
                            {/* HIGH Priority */}
                            {result.recommendations.filter((r: any) => r.priority === 'HIGH').length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-md">
                                    <span className="text-xs font-bold text-red-300">🔥 HIGH PRIORITY</span>
                                  </div>
                                </div>
                                {result.recommendations.filter((r: any) => r.priority === 'HIGH').map((rec: any, i: number) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 + (i * 0.1) }}
                                    className="bg-red-500/10 border-l-4 border-red-500 rounded-xl p-4"
                                  >
                                    <div className="font-semibold text-white mb-2">{rec.issue}</div>
                                    <div className="text-sm text-neutral-300 mb-2">{rec.action}</div>
                                    {rec.impact && (
                                      <div className="text-xs text-neutral-400 flex items-start gap-2">
                                        <TrendingUp className="h-3 w-3 mt-0.5 text-red-400" />
                                        <span>{rec.impact}</span>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            )}
                            
                            {/* MEDIUM Priority */}
                            {result.recommendations.filter((r: any) => r.priority === 'MEDIUM').length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-md">
                                    <span className="text-xs font-bold text-yellow-300">⚠️ MEDIUM PRIORITY</span>
                                  </div>
                                </div>
                                {result.recommendations.filter((r: any) => r.priority === 'MEDIUM').map((rec: any, i: number) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.3 + (i * 0.1) }}
                                    className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-xl p-4"
                                  >
                                    <div className="font-semibold text-white mb-2">{rec.issue}</div>
                                    <div className="text-sm text-neutral-300 mb-2">{rec.action}</div>
                                    {rec.impact && (
                                      <div className="text-xs text-neutral-400 flex items-start gap-2">
                                        <TrendingUp className="h-3 w-3 mt-0.5 text-yellow-400" />
                                        <span>{rec.impact}</span>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            )}
                            
                            {/* LOW Priority */}
                            {result.recommendations.filter((r: any) => r.priority === 'LOW').length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/40 rounded-md">
                                    <span className="text-xs font-bold text-blue-300">💡 LOW PRIORITY</span>
                                  </div>
                                </div>
                                {result.recommendations.filter((r: any) => r.priority === 'LOW').map((rec: any, i: number) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.4 + (i * 0.1) }}
                                    className="bg-blue-500/10 border-l-4 border-blue-500 rounded-xl p-4"
                                  >
                                    <div className="font-semibold text-white mb-2">{rec.issue}</div>
                                    <div className="text-sm text-neutral-300 mb-2">{rec.action}</div>
                                    {rec.impact && (
                                      <div className="text-xs text-neutral-400 flex items-start gap-2">
                                        <TrendingUp className="h-3 w-3 mt-0.5 text-blue-400" />
                                        <span>{rec.impact}</span>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Legacy string recommendations */
                          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6">
                            <div className="prose prose-sm prose-invert max-w-none prose-p:text-neutral-300 prose-strong:text-white prose-ul:list-disc prose-ul:pl-5">
                              <div className="whitespace-pre-wrap">{typeof result.recommendations === 'string' ? result.recommendations : JSON.stringify(result.recommendations, null, 2)}</div>
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="flex flex-wrap gap-2 pt-6 border-t border-neutral-800"
                      >
                        <Button variant="secondary" size="sm" onClick={handleExportReport}>
                          <Download className="h-4 w-4" />
                          Export Report
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleShareResults}>
                          <Share2 className="h-4 w-4" />
                          Share Results
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(true)}>
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center p-12 rounded-2xl border-2 border-dashed border-neutral-800 bg-neutral-900/50"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6"
                  >
                    <BrainCircuit className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Your Analysis Will Appear Here
                  </h3>
                  <p className="text-neutral-400 text-lg leading-relaxed max-w-md mx-auto">
                    Complete the steps above to get your comprehensive ATS compatibility report with personalized recommendations.
                  </p>
                  
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-sm text-neutral-400">Upload Resume</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-600" />
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-neutral-700 rounded-full"></div>
                      <span className="text-sm text-neutral-400">Add Job Description</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-600" />
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-neutral-700 rounded-full"></div>
                      <span className="text-sm text-neutral-400">Get Results</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tech Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Powered by Advanced Technology</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
            Our AI tools leverage cutting-edge technology to deliver the most accurate resume analysis
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Cpu className="h-8 w-8" />, label: "AI Processing" },
              { icon: <Shield className="h-8 w-8" />, label: "Secure" },
              { icon: <Database className="h-8 w-8" />, label: "Big Data" },
              { icon: <Cloud className="h-8 w-8" />, label: "Cloud Powered" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl">
                    {item.icon}
                  </div>
                </div>
                <div className="text-sm text-neutral-300">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsDetailModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-3xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Full Analysis Report</h2>
                    <p className="text-neutral-400">A detailed breakdown of your resume&#39;s performance.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(false)} className="!rounded-full !p-2 h-auto w-auto">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700">
                    <h3 className="font-bold text-neutral-300 mb-2">ATS Match Score</h3>
                    <p className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">{result.score}%</p>
                  </div>
                  <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700">
                    <h3 className="font-bold text-neutral-300 mb-2">Missing Keywords</h3>
                    {(result.missingKeywords && result.missingKeywords.length > 0) ? (
                      <p className="text-5xl font-bold text-orange-500">{result.missingKeywords.length}</p>
                    ) : (
                      <p className="text-3xl font-bold text-green-500">None!</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Actionable Recommendations</h3>
                  <div className="prose prose-invert max-w-none p-6 bg-neutral-800 rounded-2xl border border-neutral-700 h-64 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-neutral-300">
                      {typeof result.recommendations === 'string' 
                        ? result.recommendations 
                        : Array.isArray(result.recommendations) && result.recommendations.length > 0 && typeof result.recommendations[0] === 'object'
                        ? result.recommendations.map((r: any, i: number) => `[${r.priority}] ${r.issue}\n${r.action}`).join('\n\n')
                        : JSON.stringify(result.recommendations, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}