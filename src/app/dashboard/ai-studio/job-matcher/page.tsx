"use client";

// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Briefcase, 
  TrendingUp,
  ChevronDown,
  Sparkles,
  Save,
  Heart,
  Share2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  FileText,
  Building2,
  Calendar,
  Target,
  Eye,
  Bell,
  Grid3x3,
  List,
  SlidersHorizontal,
  BookmarkPlus,
  Award,
  Zap,
  ArrowUpRight,
  Upload,
  FileCheck2,
  X,
  BrainCircuit,
  Wand2,
  RotateCcw
} from 'lucide-react';

// Type Definitions
interface Job {
  id: string;
  title: string;
  company?: string;
  location: string;
  salary: string;
  matchScore: number;
  featured?: boolean;
  remote?: boolean;
  posted?: string;
  type: string;
  applicants?: number;
  description: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  link?: string;
  url?: string;
  applyLink?: string;
  applicationUrl?: string;
}

type SortOption = 'match-high' | 'match-low' | 'date-new' | 'date-old' | 'relevance';

// Helper functions moved outside component for better performance
const extractLocationFromResume = (resumeText: string): string => {
  if (!resumeText) return '';
  
  // Common tech terms to exclude (NOT locations)
  const techExclusions = /\b(React|Angular|Vue|Node|Django|Flask|FastAPI|Express|Spring|Laravel|Symfony|Rails|Next|Nuxt|Svelte|jQuery|Bootstrap|Tailwind|MongoDB|MySQL|PostgreSQL|Redis|Docker|Kubernetes|AWS|Azure|GCP|TypeScript|JavaScript|Python|Java|Ruby|PHP|Go|Rust|Swift|Kotlin)\b/gi;
  
  // INTERNATIONAL location patterns - works for Germany, Europe, USA, and worldwide
  const patterns = [
    // Pattern 1: "located in/based in [City, Country]" - Most explicit
    /(?:located in|based in|residing in|living in|living at|location:|address:)\s*:?\s*([A-Z][a-zA-Z\s\-\']+(?:,\s*[A-Z][a-zA-Z\s\-]+){1,2})/i,
    
    // Pattern 3: Major German cities (with or without country/state)
    /\b(Berlin|München|Munich|Hamburg|Frankfurt|Köln|Cologne|Stuttgart|Düsseldorf|Dortmund|Essen|Leipzig|Bremen|Dresden|Hanover|Hannover|Nuremberg|Nürnberg|Duisburg|Bochum|Wuppertal|Bonn|Bielefeld|Mannheim|Karlsruhe|Augsburg|Wiesbaden|Freiburg|Aachen)(?:,?\s*(?:Germany|Deutschland|Bavaria|Bayern|NRW|Nordrhein-Westfalen))?\b/i,
    
    // Pattern 4: Other major European cities
    /\b(London|Paris|Madrid|Rome|Amsterdam|Brussels|Vienna|Wien|Prague|Praha|Copenhagen|Stockholm|Oslo|Helsinki|Dublin|Lisbon|Lisboa|Athens|Warsaw|Warszawa|Budapest|Bucharest|Sofia|Zagreb|Belgrade|Bratislava|Ljubljana|Zurich|Geneva|Basel|Luxembourg)(?:,?\s*[A-Z][a-zA-Z\s]+)?\b/i,
    
    // Pattern 5: Major global cities
    /\b(Toronto|Vancouver|Montreal|Sydney|Melbourne|Singapore|Hong Kong|Tokyo|Seoul|Shanghai|Mumbai|Bangalore|Dubai|Tel Aviv|Istanbul|New York|Los Angeles|Chicago|San Francisco|Boston|Seattle|Austin)(?:,?\s*[A-Z][a-zA-Z\s]+)?\b/i,
    
    // Pattern 6: Country names (if no city found)
    /\b(Germany|Deutschland|France|Spain|Italy|Netherlands|Belgium|Austria|Switzerland|Sweden|Norway|Denmark|Poland|Czech Republic|United Kingdom|UK|USA|United States|Canada|Australia)(?![\w])/i,
    
    // Pattern 2: City, Country format (e.g., "Berlin, Germany") - LAST to avoid false positives
    // More restrictive: requires at least 4 characters per word to avoid matching "Go, PHP"
    /\b([A-Z][a-z]{3,}(?:[\s\-][A-Z][a-z]+)*,\s*[A-Z][a-z]{3,}(?:[\s\-][A-Z][a-z]+)*)\b/,
  ];
  
  for (const pattern of patterns) {
    const match = resumeText.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      
      // Filter out obvious false positives
      if (location.length > 2 && 
          !location.match(/^(the|and|for|with|from|about|this|that|here|there)$/i) &&
          !techExclusions.test(location)) {
        console.log('[LOCATION_DETECTED]', location);
        return location;
      }
    }
  }
  
  return '';
};

const parseDaysAgo = (posted: string | undefined): number => {
  if (!posted) return 999; // Return high number for undefined/null
  const match = posted.match(/(\d+)\s*(day|hour|week|month)/i);
  if (!match) return 999;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit.startsWith('hour')) return num / 24;
  if (unit.startsWith('day')) return num;
  if (unit.startsWith('week')) return num * 7;
  if (unit.startsWith('month')) return num * 30;
  return 999;
};

const sortJobs = (jobs: Job[], sortBy: SortOption): Job[] => {
  const sorted = [...jobs];
  
  switch (sortBy) {
    case 'match-high':
      return sorted.sort((a, b) => b.matchScore - a.matchScore);
    case 'match-low':
      return sorted.sort((a, b) => a.matchScore - b.matchScore);
    case 'date-new':
      return sorted.sort((a, b) => parseDaysAgo(a.posted) - parseDaysAgo(b.posted));
    case 'date-old':
      return sorted.sort((a, b) => parseDaysAgo(b.posted) - parseDaysAgo(a.posted));
    case 'relevance':
    default:
      return sorted;
  }
};

// Enhanced UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md shadow-lg ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}>
    {children}
  </h3>
);

const Button = ({ children, className = "", variant = "default", size = "default", disabled = false, onClick, ...props }: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "premium";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  [key: string]: any;
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600 shadow-lg hover:shadow-xl",
    secondary: "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 shadow-md hover:shadow-lg",
    outline: "border border-neutral-700 bg-transparent hover:bg-neutral-800 text-neutral-300 shadow-sm hover:shadow-md",
    ghost: "hover:bg-neutral-800 text-neutral-400",
    premium: "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl"
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-lg px-3 text-xs",
    lg: "h-12 rounded-xl px-6 text-base",
    icon: "h-10 w-10"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`flex w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${className}`}
    {...props}
  />
);

const Badge = ({ children, variant = "default", className = "" }: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "premium";
  className?: string;
}) => {
  const variants = {
    default: "bg-pink-500 text-white",
    secondary: "bg-neutral-700 text-neutral-300",
    outline: "border border-pink-500 text-pink-400",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    premium: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
  };
  
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-neutral-900 rounded-lg shadow-xl border border-neutral-700 whitespace-nowrap z-50"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// PDF.js setup (simplified)
const loadPdfJs = async () => {
  try {
    const pdfjs = await import('pdfjs-dist');
    // Use the local worker file from the public directory
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    return pdfjs;
  } catch (error) {
    console.error('Failed to load PDF.js:', error);
    return null;
  }
};

// Main Enhanced Page Component
export default function EnhancedJobMatcherPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSuggestingJob, setIsSuggestingJob] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [jobListings, setJobListings] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeLocation, setResumeLocation] = useState<string>(""); // Detected from resume
  const [showFilters, setShowFilters] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [matchScore, setMatchScore] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyFilter, setCompanyFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [hasError, setHasError] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState("");
  
  // Enhanced filters
  const [titleFilter, setTitleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [datePostedFilter, setDatePostedFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'match-high' | 'match-low' | 'date-new' | 'date-old' | 'relevance'>('match-high');
  
  // Debounced filter values
  const [debouncedCompany, setDebouncedCompany] = useState('');
  const [debouncedTitle, setDebouncedTitle] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');

  const handleQuickApply = async (job: Job) => {
    try {
      const response = await fetch('/api/analytics/track-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          company: job.company || 'Company Not Specified',
          matchScore: job.matchScore,
          status: 'Applied',
        }),
      });

      if (response.ok) {
        setNotification({ message: 'Application tracked successfully!', type: 'success' });
      } else if (response.status === 409) {
        setNotification({ message: 'Application already tracked!', type: 'warning' });
      } else {
        setNotification({ message: 'Failed to track application.', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to track application:', error);
      setNotification({ message: 'Failed to track application.', type: 'error' });
    }

    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);

    // Open job link
    const jobLink = job.link || job.url || job.applyLink || job.applicationUrl;
    if (jobLink) {
      window.open(jobLink, '_blank', 'noopener,noreferrer');
    } else {
      const companyPart = job.company ? ` ${job.company}` : '';
      const searchQuery = encodeURIComponent(`${job.title}${companyPart} jobs`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveJob = async (job: Job) => {
    try {
      const response = await fetch('/api/analytics/track-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          company: job.company || 'Company Not Specified',
          matchScore: job.matchScore,
          status: 'Saved',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toggleSaveJob(job.id);
        setNotification({ message: 'Job saved successfully!', type: 'success' });
      } else if (response.status === 409) {
        // Job already saved
        setNotification({ message: result.message || 'Job is already saved!', type: 'warning' });
      } else {
        setNotification({ message: 'Failed to save job. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to save job:', error);
      setNotification({ message: 'Failed to save job. Please try again.', type: 'error' });
    }

    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  // Removed wasteful initial load - jobs are fetched when user provides resume

  // Debounce text filters for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCompany(companyFilter);
      setDebouncedTitle(titleFilter);
      setDebouncedLocation(locationFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [companyFilter, titleFilter, locationFilter]);

  // Helper functions for filtering and sorting
  const getActiveFilterCount = () => {
    let count = 0;
    if (companyFilter) count++;
    if (titleFilter) count++;
    if (locationFilter) count++;
    if (jobTypeFilter !== 'all') count++;
    if (remoteFilter !== 'all') count++;
    if (datePostedFilter !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    setCompanyFilter('');
    setTitleFilter('');
    setLocationFilter('');
    setJobTypeFilter('all');
    setRemoteFilter('all');
    setDatePostedFilter('all');
    setExperienceFilter('');
  };

  // Enhanced filtering with debounce and memoization
  useEffect(() => {
    let jobs = [...jobListings];

    // Text filters (using debounced values)
    if (debouncedCompany) {
      jobs = jobs.filter(job => 
        job.company?.toLowerCase().includes(debouncedCompany.toLowerCase()) || false
      );
    }

    if (debouncedTitle) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(debouncedTitle.toLowerCase())
      );
    }

    if (debouncedLocation) {
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(debouncedLocation.toLowerCase())
      );
    }

    if (experienceFilter) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(experienceFilter.toLowerCase()) ||
        job.description.toLowerCase().includes(experienceFilter.toLowerCase())
      );
    }

    // Job type filter
    if (jobTypeFilter !== 'all') {
      jobs = jobs.filter(job => 
        job.type.toLowerCase().includes(jobTypeFilter.toLowerCase())
      );
    }

    // Remote/on-site filter
    if (remoteFilter === 'remote') {
      jobs = jobs.filter(job => job.remote);
    } else if (remoteFilter === 'onsite') {
      jobs = jobs.filter(job => !job.remote);
    }

    // Date posted filter
    if (datePostedFilter !== 'all') {
      jobs = jobs.filter(job => {
        const daysAgo = parseDaysAgo(job.posted);
        if (datePostedFilter === '24h') return daysAgo <= 1;
        if (datePostedFilter === '7days') return daysAgo <= 7;
        if (datePostedFilter === '30days') return daysAgo <= 30;
        return true;
      });
    }

    // Apply sorting
    const sortedJobs = sortJobs(jobs, sortBy);
    setFilteredJobs(sortedJobs);
  }, [jobListings, debouncedCompany, debouncedTitle, debouncedLocation, experienceFilter,
      jobTypeFilter, remoteFilter, datePostedFilter, sortBy]);

  // Load PDF text from file
  const extractTextFromPDF = async (file: File) => {
    setIsParsing(true);
    setPdfError("");
    
    try {
      const pdfjs = await loadPdfJs();
      if (!pdfjs) {
        throw new Error('PDF library failed to load');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      setIsParsing(false);
      return fullText;
    } catch (error) {
      setIsParsing(false);
      setPdfError('Failed to extract text from PDF. Please try another file or paste text manually.');
      throw error;
    }
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    
    if (!droppedFile) return;
    
    // Validate file type
    if (droppedFile.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file only.');
      toast.error("Invalid File Type", {
        description: "Only PDF files are supported."
      });
      return;
    }
    
    // Validate file size (5MB limit)
    if (droppedFile.size > 5 * 1024 * 1024) {
      setPdfError('File is too large. Please upload a PDF smaller than 5MB.');
      toast.error("File Too Large", {
        description: "Please upload a PDF smaller than 5MB."
      });
      return;
    }
    
    setFile(droppedFile);
    try {
      const text = await extractTextFromPDF(droppedFile);
      setResumeText(text);
      setPdfError("");
      toast.success("Resume Uploaded", {
        description: "Your resume has been successfully processed."
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      setPdfError('Failed to extract text from PDF. Please try another file.');
      toast.error("Parsing Failed", {
        description: "Could not read the PDF. Try another file or paste text manually."
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file only.');
      toast.error("Invalid File Type", {
        description: "Only PDF files are supported."
      });
      return;
    }
    
    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setPdfError('File is too large. Please upload a PDF smaller than 5MB.');
      toast.error("File Too Large", {
        description: "Please upload a PDF smaller than 5MB."
      });
      return;
    }
    
    setFile(selectedFile);
    try {
      const text = await extractTextFromPDF(selectedFile);
      setResumeText(text);
      setPdfError("");
      toast.success("Resume Uploaded", {
        description: "Your resume has been successfully processed."
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      setPdfError('Failed to extract text from PDF. Please try another file.');
      toast.error("Parsing Failed", {
        description: "Could not read the PDF. Try another file or paste text manually."
      });
    }
  };

  const handleSearch = async () => {
    if (!resumeText.trim()) {
      toast.error("Resume Required", {
        description: "Please provide your resume first by uploading a PDF or pasting text.",
      });
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setLastErrorMessage("");
    
    try {
      // Extract location from resume if not already detected
      let detectedLocation = resumeLocation;
      if (!detectedLocation) {
        detectedLocation = extractLocationFromResume(resumeText);
        if (detectedLocation) {
          setResumeLocation(detectedLocation);
          console.log('[JOB_MATCH] Detected location from resume:', detectedLocation);
        }
      }
      
      // Build filter criteria object to send to API
      // User's location filter overrides detected location
      const filterCriteria = {
        company: companyFilter.trim(),
        title: titleFilter.trim(),
        location: locationFilter.trim() || detectedLocation, // Use filter if provided, else detected location
        experience: experienceFilter.trim(),
        jobType: jobTypeFilter !== 'all' ? jobTypeFilter : '',
        remote: remoteFilter !== 'all' ? remoteFilter : '',
        datePosted: datePostedFilter !== 'all' ? datePostedFilter : '',
      };

      const response = await fetch('/api/ai/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText,
          location: filterCriteria.location,
          preferences: filterCriteria.experience || filterCriteria.jobType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job matches');
      }

      const data = await response.json();
      
      console.log('[JOB_MATCH_FRONTEND] Received data:', {
        hasMatches: !!data.matches,
        matchCount: data.matches?.length || 0,
        hasSuggestions: !!data.suggestions,
        suggestionCount: data.suggestions?.length || 0
      });
      
      // Check if we got any results
      if (!data.matches || data.matches.length === 0) {
        toast.warning("No Matches Found", {
          description: "Try updating your resume or adjusting your preferences.",
        });
        setJobListings([]);
        setSuggestions(data.suggestions || []);
        setIsLoading(false);
        return;
      }
      
      // Transform API matches into full Job objects with all required fields
      const postedOptions = ['1 day ago', '2 days ago', '3 days ago', '5 days ago', '1 week ago', '2 weeks ago'];
      const typeOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
      const salaryRanges = ['$60k - $90k', '$80k - $120k', '$100k - $140k', '$120k - $160k', '$90k - $130k'];
      
      // Determine location source
      const baseLocation = filterCriteria.location; // This already has filter OR detected location
      const hasUserLocation = !!baseLocation;
      
      // Generate location variations based on detected/filtered location
      const getJobLocation = (idx: number): string => {
        if (!hasUserLocation) {
          // No location info - show diverse international mix (not just US cities!)
          const globalLocations = [
            'Remote',
            'Berlin, Germany',
            'London, UK',
            'Amsterdam, Netherlands',
            'Paris, France',
            'New York, USA',
            'Toronto, Canada',
            'Sydney, Australia',
            'Singapore',
            'Munich, Germany',
            'Barcelona, Spain',
            'Dublin, Ireland',
          ];
          return globalLocations[idx % globalLocations.length];
        }
        
        // Use detected/filtered location for most jobs, with some remote options
        if (idx % 4 === 0) return 'Remote'; // 25% remote jobs
        if (idx % 5 === 0) return `${baseLocation} (Hybrid)`; // 20% hybrid
        return baseLocation; // 55% in specified location
      };
      
      const jobsWithIds = data.matches.map((match: any, idx: number) => {
        const score = match.fitScore || match.matchScore || 0;
        const jobLocation = getJobLocation(idx);
        
        return {
          id: match.id || `job-${Date.now()}-${idx}`,
          title: match.title || 'Untitled Position',
          company: match.company || undefined,
          location: jobLocation,
          salary: salaryRanges[idx % salaryRanges.length],
          matchScore: score,
          featured: idx === 0 && score >= 80, // First job is featured if high match
          remote: jobLocation.toLowerCase().includes('remote'),
          posted: postedOptions[idx % postedOptions.length],
          type: typeOptions[idx % typeOptions.length],
          applicants: Math.floor(Math.random() * 80) + 15, // Random 15-95
          description: match.summary || match.description || 'Exciting opportunity to join our growing team.',
          matchedSkills: match.keywords || match.matchedSkills || [],
          missingSkills: [], // Could be enhanced with AI analysis
          query: match.query,
        };
      });
      
      setJobListings(jobsWithIds);
      setSuggestions(data.suggestions || []);
      setHasError(false);
      
      // Calculate average match score
      const avgScore = data.matches.reduce((sum: number, job: Job) => sum + job.matchScore, 0) / data.matches.length;
      setMatchScore(Math.round(avgScore));
      
      // Show success toast with location info
      const locationInfo = filterCriteria.location 
        ? (locationFilter.trim() 
            ? ` in ${locationFilter.trim()}` 
            : ` in ${filterCriteria.location}`)
        : '';
      
      toast.success("Matches Found!", {
        description: `Found ${data.matches.length} job matches${locationInfo} and ${data.suggestions?.length || 0} career suggestions.`,
      });
    } catch (error) {
      console.error("Error fetching job matches:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not fetch job suggestions. Please try again.";
      setHasError(true);
      setLastErrorMessage(errorMessage);
      toast.error("Search Failed", {
        description: errorMessage,
        action: {
          label: "Try Again",
          onClick: () => handleSearch(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed unused analyzeJobCompatibility function - feature not implemented

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const copyJobDetails = async (job: Job, index: number) => {
    const companyInfo = job.company ? ` at ${job.company}` : '';
    const details = `${job.title}${companyInfo}\nLocation: ${job.location}\nSalary: ${job.salary}\nMatch Score: ${job.matchScore}%`;
    try {
      await navigator.clipboard.writeText(details);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const featuredJobs = filteredJobs.filter(job => job.featured);
  const regularJobs = filteredJobs.filter(job => !job.featured);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-neutral-950 text-white"
    >
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-4 py-3 rounded-lg shadow-lg border ${
              notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
              notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
              'bg-red-500/20 border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {notification.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                {notification.type === 'error' && <AlertCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  JobMatcher AI
                </h1>
                <p className="text-sm text-neutral-400">
                  AI-powered job matching with resume analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
              <Button variant="outline" size="sm">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Saved ({savedJobs.length})
              </Button>
              <Button variant="premium" size="sm">
                <Award className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            {/* Resume Input Section */}
            <Card className="shadow-xl border-2 border-neutral-800 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-pink-400" />
                  Your Resume
                </CardTitle>
                <p className="text-sm text-neutral-400">
                  Upload PDF or paste text to start matching
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragging ? 'border-pink-500 bg-neutral-800 scale-105' : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                  }`}
                  onDrop={handleFileDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".pdf" 
                    onChange={handleFileSelect}
                    className="hidden" 
                  />
                  
                  {file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                        <FileCheck2 className="h-6 w-6 text-green-400" />
                        <div>
                          <p className="font-medium text-neutral-200 truncate max-w-xs">{file.name}</p>
                          <p className="text-sm text-neutral-400">PDF uploaded</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setResumeText("");
                          setPdfError("");
                        }}
                        className="text-red-500 hover:bg-red-500/10"
                      >
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
                      <p className="text-neutral-300">
                        <span className="font-semibold text-pink-400">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-neutral-400">PDF files only • Max 10MB</p>
                    </div>
                  )}
                </div>

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
                  <span className="flex-shrink mx-4 text-neutral-400 text-sm">OR</span>
                  <div className="flex-grow border-t border-neutral-800" />
                </div>

                {/* Resume Text Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Paste Your Resume Text</label>
                  <Textarea 
                    rows={6} 
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      setFile(null);
                      setPdfError("");
                    }}
                    placeholder="Paste your resume content here..."
                    className="min-h-[120px]"
                  />
                </div>

                {resumeText && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <p className="text-green-400 text-sm">
                        Resume ready for analysis ({resumeText.split(' ').length} words)
                      </p>
                    </div>
                    
                    {resumeLocation && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                      >
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <div className="flex-1">
                          <p className="text-blue-400 text-sm">
                            <span className="font-semibold">Location detected:</span> {resumeLocation}
                          </p>
                          <p className="text-xs text-blue-300/70 mt-0.5">
                            Jobs will be shown for this location. Use filters to search other areas.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:w-2/3">
            {/* Job Search & Matching Section */}
            <Card className="shadow-xl border-2 border-neutral-800 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-pink-400" />
                    Find Your Perfect Job Match
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Sort Dropdown */}
                    {filteredJobs.length > 0 && (
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="h-8 px-3 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="match-high">Match: High to Low</option>
                        <option value="match-low">Match: Low to High</option>
                        <option value="date-new">Date: Newest First</option>
                        <option value="date-old">Date: Oldest First</option>
                        <option value="relevance">Relevance</option>
                      </select>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </Button>
                    <div className="flex items-center bg-neutral-800 rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-7"
                        aria-label="Grid view"
                      >
                        <Grid3x3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-7"
                        aria-label="List view"
                      >
                        <List className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-pink-400" />
                            AI Job Search Filters
                          </h3>
                          <p className="text-xs text-neutral-400 mt-1">
                            Set filters and click search - AI will find jobs matching your criteria
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getActiveFilterCount() > 0 && (
                            <span className="text-xs text-neutral-400">
                              {getActiveFilterCount()} active
                            </span>
                          )}
                          {getActiveFilterCount() > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                              className="h-6 text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Text Filters Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-medium text-neutral-400 block mb-1">Company Name</label>
                          <Input 
                            placeholder="e.g. Google, Microsoft" 
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-400 block mb-1">Job Title</label>
                          <Input 
                            placeholder="e.g. Software Engineer" 
                            value={titleFilter}
                            onChange={(e) => setTitleFilter(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-400 block mb-1 flex items-center gap-1">
                            Location
                            {resumeLocation && !locationFilter && (
                              <span className="text-blue-400 text-[10px]">
                                (using: {resumeLocation})
                              </span>
                            )}
                          </label>
                          <Input 
                            placeholder={resumeLocation ? `Override: ${resumeLocation}` : "e.g. San Francisco, Remote"} 
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Button Filters Row */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-medium text-neutral-400 block mb-1">Experience Level</label>
                          <Input 
                            placeholder="e.g. Senior, Mid-level"
                            value={experienceFilter}
                            onChange={(e) => setExperienceFilter(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-400 block mb-1">Job Type</label>
                          <div className="flex items-center bg-neutral-800 rounded-lg p-1">
                            <Button
                              variant={jobTypeFilter === "all" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setJobTypeFilter("all")}
                              className="h-7 flex-1 text-xs"
                            >
                              All
                            </Button>
                            <Button
                              variant={jobTypeFilter === "full-time" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setJobTypeFilter("full-time")}
                              className="h-7 flex-1 text-xs"
                            >
                              Full-time
                            </Button>
                            <Button
                              variant={jobTypeFilter === "contract" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setJobTypeFilter("contract")}
                              className="h-7 flex-1 text-xs"
                            >
                              Contract
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-400 block mb-1">Work Setting</label>
                          <div className="flex items-center bg-neutral-800 rounded-lg p-1">
                            <Button
                              variant={remoteFilter === "all" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setRemoteFilter("all")}
                              className="h-7 flex-1 text-xs"
                            >
                              All
                            </Button>
                            <Button
                              variant={remoteFilter === "remote" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setRemoteFilter("remote")}
                              className="h-7 flex-1 text-xs"
                            >
                              Remote
                            </Button>
                            <Button
                              variant={remoteFilter === "onsite" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setRemoteFilter("onsite")}
                              className="h-7 flex-1 text-xs"
                            >
                              On-site
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-400 block mb-1">Date Posted</label>
                          <div className="flex items-center bg-neutral-800 rounded-lg p-1">
                            <Button
                              variant={datePostedFilter === "all" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setDatePostedFilter("all")}
                              className="h-7 flex-1 text-xs"
                            >
                              All
                            </Button>
                            <Button
                              variant={datePostedFilter === "24h" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setDatePostedFilter("24h")}
                              className="h-7 flex-1 text-xs"
                            >
                              24h
                            </Button>
                            <Button
                              variant={datePostedFilter === "7days" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setDatePostedFilter("7days")}
                              className="h-7 flex-1 text-xs"
                            >
                              7d
                            </Button>
                            <Button
                              variant={datePostedFilter === "30days" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => setDatePostedFilter("30days")}
                              className="h-7 flex-1 text-xs"
                            >
                              30d
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
              <CardContent className="space-y-6">
                {/* Job Description Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Job Description (Optional - for precise matching)
                  </label>
                  <Textarea 
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste a specific job description for targeted matching..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Quick Stats */}
                {jobListings.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-pink-400">{filteredJobs.length}</div>
                      <div className="text-xs text-neutral-400">Total Matches</div>
                    </div>
                    <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{matchScore}%</div>
                      <div className="text-xs text-neutral-400">Avg Match</div>
                    </div>
                    <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400">{featuredJobs.length}</div>
                      <div className="text-xs text-neutral-400">Featured</div>
                    </div>
                    <div className="bg-neutral-800/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">{savedJobs.length}</div>
                      <div className="text-xs text-neutral-400">Saved</div>
                    </div>
                  </div>
                )}

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
                        <BrainCircuit className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            AI Career Suggestions
                            <Badge variant="premium" className="text-xs">Powered by Gemini</Badge>
                          </h3>
                          <p className="text-sm text-neutral-300 mt-1">
                            Based on your resume, here are alternative roles you might excel in:
                          </p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                          {suggestions.map((suggestion, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="bg-neutral-900/80 border border-neutral-700 rounded-lg p-3 hover:border-pink-500/50 transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-pink-400 group-hover:text-pink-300" />
                                <span className="text-sm text-neutral-200 group-hover:text-white">
                                  {suggestion}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Search Action */}
                <div className="space-y-3">
                  {getActiveFilterCount() > 0 && jobListings.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                      <SlidersHorizontal className="h-4 w-4 text-pink-400" />
                      <p className="text-pink-400 text-sm flex-1">
                        {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active. Click search to find jobs matching your filters.
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleSearch} 
                    disabled={isLoading || isParsing || !resumeText.trim()}
                    size="lg" 
                    className="w-full"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Parsing Resume...
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Finding Best Matches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {jobListings.length > 0 ? 'Search Again with Current Filters' : 'Find AI-Powered Job Matches'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-8">
          {isLoading ? (
            /* Skeleton Loader */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="h-5 w-5 text-pink-500 animate-spin" />
                <h2 className="text-xl font-semibold">Finding Your Perfect Matches...</h2>
              </div>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-neutral-800 rounded w-3/4" />
                      <div className="h-4 bg-neutral-800 rounded w-1/2" />
                      <div className="h-4 bg-neutral-800 rounded w-full" />
                      <div className="h-4 bg-neutral-800 rounded w-full" />
                      <div className="flex gap-2 mt-4">
                        <div className="h-6 bg-neutral-800 rounded w-20" />
                        <div className="h-6 bg-neutral-800 rounded w-20" />
                        <div className="h-6 bg-neutral-800 rounded w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobListings.length > 0 ? (
            filteredJobs.length > 0 ? (
            <>
              {/* Featured Jobs */}
              {featuredJobs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-semibold">Featured Opportunities</h2>
                    <Badge variant="premium">Top Matches</Badge>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {featuredJobs.map((job, index) => (
                      <JobCard 
                        key={job.id || `featured-${index}`} 
                        job={job} 
                        index={index} 
                        savedJobs={savedJobs}
                        toggleSaveJob={handleSaveJob}
                        copyJobDetails={copyJobDetails}
                        copiedIndex={copiedIndex}
                        featured={true}
                        handleQuickApply={handleQuickApply}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Jobs */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold tracking-tight">All Job Matches</h2>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Target className="h-4 w-4" />
                    {regularJobs.length} matches found
                  </div>
                </div>

                <div className={viewMode === "grid" ? "grid gap-6 lg:grid-cols-2" : "space-y-4"}>
                  {regularJobs.map((job, index) => (
                    <JobCard 
                      key={job.id || `regular-${index}`} 
                      job={job} 
                      index={index + featuredJobs.length} 
                      savedJobs={savedJobs}
                      toggleSaveJob={handleSaveJob}
                      copyJobDetails={copyJobDetails}
                      copiedIndex={copiedIndex}
                      viewMode={viewMode}
                      handleQuickApply={handleQuickApply}
                    />
                  ))}
                </div>
              </div>
              
              {/* Generate More Jobs Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-8"
              >
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="flex items-center gap-3">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating More Matches...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                        Generate More Jobs
                        <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </button>
              </motion.div>
            </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6"
                  >
                    <Filter className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    No Jobs Match Your Filters
                  </h3>
                  <p className="text-neutral-400 text-lg max-w-md mx-auto mb-6">
                    Try adjusting your filters or clearing them to see all available job matches.
                  </p>
                  <Button onClick={() => {
                    setCompanyFilter("");
                    setExperienceFilter("");
                    setRemoteFilter("all");
                  }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )
          ) : !file && !resumeText.trim() ? (
            /* Initial Empty State - No Resume Uploaded */
            <Card className="text-center py-16">
              <CardContent>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="mx-auto w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
                >
                  <Sparkles className="h-12 w-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Start Your AI-Powered Job Search
                </h2>
                <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                  Upload your resume and let our AI find the perfect job matches for you. 
                  Get personalized recommendations based on your skills, experience, and career goals.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                  <Button 
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Resume (PDF)
                  </Button>
                  <span className="text-neutral-400 text-sm">or</span>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      const textarea = document.querySelector('textarea');
                      textarea?.focus();
                    }}
                    className="w-full sm:w-auto"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Paste Resume Text
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
                  <div className="flex items-start gap-3 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
                    <div className="p-2 bg-pink-500/10 rounded-lg">
                      <BrainCircuit className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">AI-Powered Matching</h3>
                      <p className="text-sm text-neutral-400">Smart algorithms find jobs that perfectly match your profile</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Target className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Match Score</h3>
                      <p className="text-sm text-neutral-400">See how well you match each job opportunity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Zap className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Instant Results</h3>
                      <p className="text-sm text-neutral-400">Get job matches in seconds, not hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Empty State - Resume Uploaded But No Matches Yet */
            <Card className="text-center py-12">
              <CardContent>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                  className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6"
                >
                  <BrainCircuit className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ready to Find Your Perfect Match?
                </h3>
                <p className="text-neutral-400 text-lg max-w-md mx-auto mb-6">
                  Your resume is ready! Click the button below to discover jobs tailored to your skills and experience.
                </p>
                <Button onClick={handleSearch} size="lg">
                  <Wand2 className="h-5 w-5 mr-2" />
                  Find AI-Powered Job Matches
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Modern Job Card Component
const JobCard = ({ job, index, savedJobs, toggleSaveJob, copyJobDetails, copiedIndex, featured = false, viewMode = "grid", handleQuickApply }: {
  job: Job;
  index: number;
  savedJobs: string[];
  toggleSaveJob: (job: Job) => void;
  copyJobDetails: (job: Job, index: number) => void;
  copiedIndex: number | null;
  featured?: boolean;
  viewMode?: "grid" | "list";
  handleQuickApply: (job: Job) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isNew = parseDaysAgo(job.posted) <= 2;
  const isUrgent = parseDaysAgo(job.posted) <= 7 && (job.applicants || 0) > 50;
  
  return (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.05 * index }}
    whileHover={{ y: -4 }}
  >
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl backdrop-blur-sm ${
      featured ? 'border-2 border-pink-500 bg-gradient-to-br from-pink-500/10 to-orange-500/10' : 'hover:border-pink-500/50 bg-neutral-900/95'
    } ${viewMode === "list" ? "flex" : ""}`}>
      
      {/* Glassmorphism Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        job.matchScore >= 85 ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-400' :
        job.matchScore >= 70 ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400' :
        'bg-gradient-to-r from-orange-500 via-red-500 to-orange-400'
      }`} />

      {/* Top Right Badges */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isNew && (
          <Badge variant="premium" className="animate-pulse">
            <Sparkles className="h-3 w-3 mr-1" />
            New
          </Badge>
        )}
        {featured && (
          <Badge variant="premium">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {isUrgent && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <Bell className="h-3 w-3 mr-1" />
            Urgent
          </Badge>
        )}
      </div>

      {/* Company Logo Placeholder + Match Score */}
      <div className="absolute top-4 left-4 z-10 flex flex-col items-center gap-2">
        {/* Company Logo Circle */}
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-neutral-700 flex items-center justify-center shadow-xl group-hover:border-pink-500/50 transition-all duration-300"
        >
          <Building2 className="h-7 w-7 text-neutral-400 group-hover:text-pink-400 transition-colors" />
        </motion.div>
        
        {/* Match Score Ring */}
        <Tooltip content={`${job.matchScore}% match with your skills`}>
          <div className="relative">
            {/* Circular Progress Ring */}
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-neutral-800"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - job.matchScore / 100)}`}
                className={`transition-all duration-1000 ${
                  job.matchScore >= 85 ? 'text-green-400' :
                  job.matchScore >= 70 ? 'text-yellow-400' :
                  'text-orange-400'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${
                job.matchScore >= 85 ? 'text-green-400' :
                job.matchScore >= 70 ? 'text-yellow-400' :
                'text-orange-400'
              }`}>
                {job.matchScore}
              </span>
            </div>
          </div>
        </Tooltip>
      </div>

      <div className={viewMode === "list" ? "flex w-full" : ""}>
        <CardHeader className={`${viewMode === "list" ? "flex-1" : ""} pb-3 pt-6`}>
          {/* Job Title & Company */}
          <div className="flex items-start justify-between gap-4 mb-4 ml-20">
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title Row with Remote Badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
                  {job.title}
                </h3>
                {job.remote && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      Remote
                    </div>
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                  {job.type}
                </Badge>
              </div>
              
              {/* Company & Location Info */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400">
                {job.company && (
                  <motion.div 
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-pink-400" />
                    <span className="font-medium">{job.company}</span>
                  </motion.div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span>{job.posted || 'Recently'}</span>
                </div>
              </div>

              {/* Salary & Stats Row */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg"
                >
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-semibold text-green-400">{job.salary}</span>
                </motion.div>
                
                {job.applicants !== undefined && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-neutral-700/50 rounded-lg">
                    <Users className="h-4 w-4 text-neutral-400" />
                    <span className="text-xs text-neutral-300">
                      <span className="font-semibold">{job.applicants}</span> applicants
                    </span>
                  </div>
                )}

                {parseDaysAgo(job.posted) <= 7 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-medium text-orange-400">Trending</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              <Tooltip content={savedJobs.includes(job.id) ? "Remove from saved" : "Save job"}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSaveJob(job)}
                  className={`h-8 w-8 ${savedJobs.includes(job.id) ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
                >
                  <Heart className="h-4 w-4" fill={savedJobs.includes(job.id) ? "currentColor" : "none"} />
                </Button>
              </Tooltip>
              <Tooltip content="Copy job details">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyJobDetails(job, index)}
                  className="h-8 w-8"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`${viewMode === "list" ? "flex-1" : ""} pt-0 space-y-4`}>
          {/* Job Description with Expand/Collapse */}
          <div className="relative">
            <p className={`text-sm text-neutral-300 leading-relaxed transition-all duration-300 ${
              isExpanded ? '' : 'line-clamp-2'
            }`}>
              {job.description}
            </p>
            {job.description.length > 120 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-pink-400 hover:text-pink-300 font-medium mt-1 flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-3 w-3 rotate-180 transition-transform" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 transition-transform" />
                    Read more
                  </>
                )}
              </button>
            )}
          </div>

          {/* Skills Match Section with Visual Upgrade */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-400" />
                </div>
                <p className="text-sm font-semibold text-white">Skills Match</p>
              </div>
              <span className="text-xs text-neutral-400">
                {job.matchedSkills?.length || 0} / {(job.matchedSkills?.length || 0) + (job.missingSkills?.length || 0)} skills
              </span>
            </div>
            
            {/* Matched Skills */}
            {job.matchedSkills && job.matchedSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  You have these skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.matchedSkills.map((skill, idx) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                      <Tooltip content="✓ Match: This skill is on your resume">
                        <Badge 
                          variant="success" 
                          className="flex items-center gap-1 cursor-default hover:scale-105 transition-transform"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {skill}
                        </Badge>
                      </Tooltip>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Missing Skills */}
            {job.missingSkills && job.missingSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Skills to develop
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.missingSkills.map((skill, idx) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                      <Tooltip content="⚠️ Gap: Consider learning this skill">
                        <Badge 
                          variant="warning" 
                          className="flex items-center gap-1 cursor-default hover:scale-105 transition-transform"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {skill}
                        </Badge>
                      </Tooltip>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
            <div className="flex items-center gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleQuickApply(job)}
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Apply
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const jobLink = job.link || job.url || job.applyLink || job.applicationUrl;
                    
                    if (jobLink) {
                      window.open(jobLink, '_blank', 'noopener,noreferrer');
                    } else if (job.company) {
                      const companySlug = job.company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                      window.open(`https://www.linkedin.com/company/${companySlug}/jobs/`, '_blank', 'noopener,noreferrer');
                    } else {
                      const searchQuery = encodeURIComponent(`${job.title} jobs`);
                      window.open(`https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="border-neutral-700 hover:border-pink-500/50 hover:bg-pink-500/10 group"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </motion.div>

              <Tooltip content="Share this job">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: job.title,
                        text: `Check out this job: ${job.title} at ${job.company || 'a great company'}`,
                        url: window.location.href
                      });
                    }
                  }}
                  className="hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
            
            {/* Match Score Badge */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20">
                <span className="text-xs font-medium text-neutral-400">
                  Match: <span className="font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">{job.matchScore}%</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  </motion.div>
  );
};
