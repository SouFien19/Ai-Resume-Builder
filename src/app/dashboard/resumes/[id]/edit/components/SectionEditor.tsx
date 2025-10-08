"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import LanguagesSection from '@/app/dashboard/resumes/components/sections/Languages';
import InterestsSection from '@/app/dashboard/resumes/components/sections/Interests';
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Copy,
  MapPin,
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Code,
  Rocket,
  Trophy,
  Award,
  X,
  Heart,
  Globe,
  Loader2
} from 'lucide-react';
import type {
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  Language,
  ResumeData,
  SectionKey
} from '@/types/resume';

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.06
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
} as const;

const fieldVariants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(99,102,241,0)',
    borderColor: 'rgba(63,63,70,0.5)'
  },
  focus: {
    boxShadow: '0 0 0 8px rgba(99,102,241,0.12)',
    borderColor: 'rgba(99,102,241,0.65)',
    transition: { duration: 0.18, ease: 'easeOut' }
  },
  error: {
    boxShadow: '0 0 0 8px rgba(248,113,113,0.14)',
    borderColor: 'rgba(248,113,113,0.7)',
    transition: { duration: 0.18, ease: 'easeOut' }
  }
} as const;

type IconType = React.ComponentType<{ className?: string }>;

interface AnimatedFieldProps {
  label: string;
  icon?: IconType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

interface AnimatedInputProps extends AnimatedFieldProps {
  type?: string;
}

const AnimatedInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error,
  className
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [debouncedValue] = useDebounce(localValue, 250);

  const hasValue = Boolean(localValue?.trim?.());

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  return (
    <motion.div className={cn('space-y-2', className)} variants={itemVariants}>
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
        {Icon && <Icon className="h-4 w-4 text-neutral-400" />}
        <span>{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>

      <motion.div className="relative">
        <motion.input
          type={type}
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full rounded-xl border bg-neutral-800/50 p-3.5 pr-10 text-white transition-all duration-200',
            'backdrop-blur-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
            error ? 'border-red-500/50 bg-red-950/20' : 'border-neutral-700/60 focus:border-indigo-400/60'
          )}
          placeholder={placeholder}
          variants={fieldVariants}
          initial="initial"
          animate={error ? 'error' : isFocused ? 'focus' : 'initial'}
        />

        <AnimatePresence>
          {hasValue && !error && (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400"
            >
              <CheckCircle className="h-4 w-4" />
            </motion.div>
          )}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"
            >
              <AlertCircle className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-1 text-sm text-red-400"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface AnimatedTextareaProps extends AnimatedFieldProps {
  maxLength?: number;
  rows?: number;
  actionSlot?: React.ReactNode;
}

const AnimatedTextarea = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  maxLength = 500,
  rows = 4,
  className,
  actionSlot
}: AnimatedTextareaProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [debouncedValue] = useDebounce(localValue, 250);

  const characterCount = localValue?.length ?? 0;
  const isNearLimit = characterCount > maxLength * 0.8;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  return (
    <motion.div className={cn('space-y-2', className)} variants={itemVariants}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
          {Icon && <Icon className="h-4 w-4 text-neutral-400" />}
          <span>{label}</span>
          {required && <span className="text-red-500 text-xs">*</span>}
        </div>
        {actionSlot ? <div className="flex items-center gap-2">{actionSlot}</div> : null}
      </div>

      <motion.div className="relative">
        <motion.textarea
          value={localValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (nextValue.length <= maxLength) {
              setLocalValue(nextValue);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full resize-none rounded-xl border bg-neutral-800/60 p-3.5 text-white transition-all duration-200',
            'backdrop-blur-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
            error ? 'border-red-500/50 bg-red-950/20' : 'border-neutral-700/60 focus:border-indigo-400/60'
          )}
          placeholder={placeholder}
          rows={rows}
          variants={fieldVariants}
          initial="initial"
          animate={error ? 'error' : isFocused ? 'focus' : 'initial'}
        />

        <motion.div
          className={cn(
            'absolute bottom-2 right-2 rounded-lg px-2 py-1 text-xs backdrop-blur-sm transition-colors',
            isNearLimit ? 'bg-orange-900/30 text-orange-300' : 'bg-neutral-900/60 text-neutral-400'
          )}
          animate={{
            color: isNearLimit ? 'rgb(253 186 116)' : 'rgb(163 163 163)',
            backgroundColor: isNearLimit ? 'rgba(124,45,18,0.3)' : 'rgba(23,23,23,0.6)'
          }}
        >
          {characterCount}/{maxLength}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-1 text-sm text-red-400"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Personal Info Component
const PersonalInfoComponent = ({ data, onChange }: { 
  data: PersonalInfo; 
  onChange: (field: string, value: string) => void 
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValidUrl = (value: string) => {
    if (!value) return true;
    const trimmed = value.trim();
    if (!trimmed) return true;
    const sanitized = trimmed.replace(/^\/+/u, '');
    const hasProtocol = /^https?:\/\//i.test(trimmed);
    const normalized = hasProtocol ? trimmed : `https://${sanitized}`;
    try {
      const url = new URL(normalized);
      return !!url.hostname && url.hostname.includes('.');
    } catch {
      return false;
    }
  };
  
  const validateField = (field: string, value: string) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : '';
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        if (trimmedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          newErrors[field] = 'Please enter a valid email address';
        } else {
          delete newErrors[field];
        }
        break;
      case 'phone':
        if (trimmedValue && !/^[\+]?[1-9][\d]{0,15}$/.test(trimmedValue.replace(/[\s\-\(\)]/g, ''))) {
          newErrors[field] = 'Please enter a valid phone number';
        } else {
          delete newErrors[field];
        }
        break;
      case 'name':
        if (!trimmedValue) {
          newErrors[field] = 'Name is required';
        } else {
          delete newErrors[field];
        }
        break;
      case 'website':
      case 'linkedin':
        if (trimmedValue && !isValidUrl(trimmedValue)) {
          newErrors[field] = 'Please enter a valid URL';
        } else {
          delete newErrors[field];
        }
        break;
      default:
        delete newErrors[field];
    }
    
    setErrors(newErrors);
  };

  const handleChange = (field: string, value: string) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : '';

    if (field === 'location') {
      onChange('location', trimmedValue);
      onChange('address', trimmedValue);
    } else {
      onChange(field, trimmedValue);
    }

    validateField(field, trimmedValue);
  };

  const [uploading, setUploading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/uploads/photo', { method: 'POST', body: form });
      const json = await res.json();
      if (res.ok && json.url) {
        handleChange('photoUrl', json.url);
      }
    } finally {
      setUploading(false);
      // Reset file input value if it still exists
      if (e.currentTarget) {
        e.currentTarget.value = '';
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedInput
          label="Full Name"
          icon={User}
          value={data.name || ''}
          onChange={(value) => handleChange('name', value)}
          placeholder="John Doe"
          required
          error={errors.name}
        />
        
        <AnimatedInput
          label="Email Address"
          icon={Mail}
          type="email"
          value={data.email || ''}
          onChange={(value) => handleChange('email', value)}
          placeholder="john.doe@example.com"
          required
          error={errors.email}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedInput
          label="Phone Number"
          icon={Phone}
          type="tel"
          value={data.phone || ''}
          onChange={(value) => handleChange('phone', value)}
          placeholder="+1 (555) 123-4567"
          error={errors.phone}
        />
        
        <AnimatedInput
          label="Location"
          icon={MapPin}
          value={data.location || data.address || ''}
          onChange={(value) => handleChange('location', value)}
          placeholder="New York, NY"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedInput
          label="Personal Website"
          icon={Globe}
          value={data.website || ''}
          onChange={(value) => handleChange('website', value)}
          placeholder="https://yourname.com"
          error={errors.website}
        />
        <AnimatedInput
          label="LinkedIn Profile"
          icon={Building}
          value={data.linkedin || ''}
          onChange={(value) => handleChange('linkedin', value)}
          placeholder="linkedin.com/in/johndoe"
          error={errors.linkedin}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
          <User className="h-4 w-4" /> Upload Photo (optional)
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onFileChange}
          className="block w-full text-sm text-white border border-neutral-700/50 rounded-xl cursor-pointer bg-neutral-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 file:mr-4 file:py-3 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all duration-200"
        />
        <div className="mt-2 text-xs text-neutral-400">
          {uploading ? 'Uploading…' : (data.photoUrl ? '✓ Photo uploaded successfully' : 'PNG, JPG, or WEBP up to 5MB')}
        </div>
      </div>
      
    </motion.div>
  );
};

// Enhanced Summary Component
const SummaryComponent = ({ data, onChange }: { 
  data: PersonalInfo; 
  onChange: (field: string, value: string) => void 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const suggestions = [
    "Start with your years of experience",
    "Mention your key expertise areas", 
    "Include your biggest achievement",
    "Add industry-specific keywords",
    "Keep it concise but impactful"
  ];

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatedTextarea
        label="Professional Summary"
        icon={Sparkles}
        value={data.summary || ''}
        onChange={(value) => onChange('summary', value)}
        placeholder="Experienced software engineer with 5+ years in full-stack development, specializing in React and Node.js. Led teams of 8+ developers and delivered 20+ successful projects..."
        maxLength={500}
        rows={6}
      />
      
      {/* Writing Tips */}
      <motion.div 
        className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Writing Tips
          </h4>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-indigo-400" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 space-y-2"
            >
              {suggestions.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-indigo-300"
                >
                  <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                  {tip}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Work Experience Component
const WorkExperienceComponent = ({ data, onChange }: {
  data: WorkExperience[];
  onChange: (field: string, value: WorkExperience[]) => void;
}) => {
  const experiences = Array.isArray(data) ? data : [];
  const totalExperiences = experiences.length;
  const [aiLoadingIndex, setAiLoadingIndex] = useState<number | null>(null);

  const addExperience = () => {
    const next = [
      ...experiences,
      {
        id: Date.now().toString(),
        company: '',
        position: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        achievements: []
      }
    ];
    onChange('__replace__', next);
    toast.success('New experience added! ✨', {
      description: 'Add impact-driven achievements to stand out.',
      duration: 3000
    });
  };

  const removeExperience = (index: number) => {
    const next = [...experiences];
    const removed = next.splice(index, 1)[0];
    onChange('__replace__', next);

    toast.success('Experience removed', { duration: 2000 });
  };

  const updateExperience = (index: number, field: string, value: string | string[]) => {
    const next = [...experiences];
    next[index] = { ...next[index], [field]: value };
    onChange('__replace__', next);
  };

  const duplicateExperience = (index: number) => {
    const next = [...experiences];
    const source = next[index];
    const duplicate = {
      ...source,
      id: Date.now().toString(),
      company: source.company ? `${source.company} (Copy)` : ''
    };
    next.splice(index + 1, 0, duplicate);
    onChange('__replace__', next);
    toast.success('Experience duplicated! 📋', { duration: 2000 });
  };

  const summarizeDescription = (description?: string) => {
    if (!description) return '';
    const sanitized = description.replace(/\n+/g, ' ').trim();
    if (sanitized.length <= 140) return sanitized;
    return `${sanitized.slice(0, 140)}…`;
  };

  const handleGenerateExperience = async (experienceIndex: number) => {
    const target = experiences[experienceIndex];
    if (!target) return;

    const company = target.company?.trim();
    const position = (target.position || target.role)?.trim();

    if (!company || !position) {
      toast.error('Add company and job title first', {
        description: 'Gemini needs these details to personalize your achievements.',
        duration: 3500
      });
      return;
    }

    try {
      setAiLoadingIndex(experienceIndex);

      const response = await fetch('/api/ai/generate-experience-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          position,
          startDate: target.startDate,
          endDate: target.endDate,
          description: target.description,
          industry: '',
          experienceLevel: 'mid-level'
        })
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success || !payload?.data) {
        throw new Error(payload?.error ?? 'Gemini could not craft new content right now.');
      }

      const generatedDescription = typeof payload.data.description === 'string'
        ? payload.data.description.trim()
        : '';

      const generatedAchievements = Array.isArray(payload.data.achievements)
        ? payload.data.achievements
            .map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
            .filter((item: string) => item.length > 0)
        : [];

      const next = [...experiences];
      next[experienceIndex] = {
        ...next[experienceIndex],
        description: generatedDescription || next[experienceIndex].description || '',
        achievements: generatedAchievements.length ? generatedAchievements : next[experienceIndex].achievements
      };

      onChange('__replace__', next);

      toast.success('Gemini refreshed this experience ✨', {
        description: generatedAchievements.length
          ? 'We added a polished summary and new impact bullets.'
          : 'We wrote a polished summary for this role.',
        duration: 3500
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again in a moment.';
      toast.error('Unable to generate with Gemini', {
        description: message,
        duration: 3500
      });
    } finally {
      setAiLoadingIndex(null);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/40 bg-indigo-500/10">
            <Briefcase className="h-5 w-5 text-indigo-200" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Work Experience</h3>
            <p className="text-xs text-neutral-400">Document your career story with measurable wins and leadership moments.</p>
          </div>
          <Badge variant="outline" className="text-xs border-indigo-400/40 text-indigo-100">
            {totalExperiences} {totalExperiences === 1 ? 'position' : 'positions'}
          </Badge>
        </div>

        <motion.button
          onClick={addExperience}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {totalExperiences ? (
          <div className="space-y-4">
            {experiences.map((job, index) => {
              const key = job.id || index.toString();
              const achievementsText = Array.isArray(job.achievements)
                ? job.achievements.filter(Boolean).join('\n')
                : '';

              return (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -80, scale: 0.96 }}
                  className="group relative"
                >
                  <motion.div
                    className={cn(
                      'relative overflow-hidden rounded-2xl border transition-all duration-200 backdrop-blur-sm',
                      'hover:shadow-xl hover:border-indigo-400/50',
                      'border-indigo-400/60 bg-indigo-600/10 shadow-lg shadow-indigo-500/15'
                    )}
                    whileHover={{ y: -2 }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400/70 via-transparent to-blue-400/50" />

                    <div className="flex items-start justify-between gap-4 p-6">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h4 className="text-lg font-semibold text-white">{job.position?.trim() || 'New Role'}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-indigo-100">
                              <Building className="h-3.5 w-3.5" />
                              {job.company?.trim() || 'Company Name'}
                            </span>
                            {(job.startDate || job.endDate) && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 px-3 py-1 text-[11px] text-indigo-50/90">
                                <Calendar className="h-3.5 w-3.5" />
                                {job.startDate || 'Start'} — {job.endDate?.trim() || 'Present'}
                              </span>
                            )}
                            {job.role?.trim() && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 px-3 py-1 text-[11px] text-indigo-50/90">
                                {job.role}
                              </span>
                            )}
                          </div>
                        </div>
                        {job.description?.trim() && (
                          <p className="text-sm text-neutral-300/90 line-clamp-2">
                            {summarizeDescription(job.description)}
                          </p>
                        )}
                      </div>

                      <div className="hidden items-center gap-1 opacity-0 group-hover:flex group-hover:opacity-100 transition-opacity">
                        <motion.button
                          onClick={() => duplicateExperience(index)}
                          className="rounded-lg border border-transparent p-2 text-neutral-400 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Copy className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => removeExperience(index)}
                          className="rounded-lg border border-transparent p-2 text-neutral-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="space-y-5 border-t border-indigo-400/20 bg-neutral-950/40 p-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatedInput
                          label="Job Title"
                          icon={Briefcase}
                          value={job.position || ''}
                          onChange={(value) => updateExperience(index, 'position', value)}
                          placeholder="Senior Product Manager"
                        />
                        <AnimatedInput
                          label="Company"
                          icon={Building}
                          value={job.company || ''}
                          onChange={(value) => updateExperience(index, 'company', value)}
                          placeholder="Acme Corp"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatedInput
                          label="Start Date"
                          icon={Calendar}
                          value={job.startDate || ''}
                          onChange={(value) => updateExperience(index, 'startDate', value)}
                          placeholder="Jan 2021"
                        />
                        <AnimatedInput
                          label="End Date"
                          icon={Calendar}
                          value={job.endDate || ''}
                          onChange={(value) => updateExperience(index, 'endDate', value)}
                          placeholder="Present"
                        />
                      </div>

                      <AnimatedInput
                        label="Location / Team Context (Optional)"
                        icon={MapPin}
                        value={job.role || ''}
                        onChange={(value) => updateExperience(index, 'role', value)}
                        placeholder="New York • Hybrid"
                      />

                      <AnimatedTextarea
                        label="Impact Summary"
                        icon={Trophy}
                        value={job.description || ''}
                        onChange={(value) => updateExperience(index, 'description', value)}
                        placeholder="Led end-to-end launch of growth experiments that increased ARR by $3.2M in 12 months..."
                        maxLength={1000}
                        rows={5}
                        actionSlot={
                          <motion.button
                            type="button"
                            onClick={() => handleGenerateExperience(index)}
                            disabled={aiLoadingIndex === index}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                              aiLoadingIndex === index
                                ? 'cursor-not-allowed border-indigo-500/40 bg-indigo-500/30 text-indigo-100/70 opacity-90'
                                : 'border-indigo-500/40 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
                            )}
                            whileHover={aiLoadingIndex === index ? {} : { scale: 1.04, y: -1 }}
                            whileTap={aiLoadingIndex === index ? {} : { scale: 0.96 }}
                          >
                            {aiLoadingIndex === index ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Generating…
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5" />
                                Generate with Gemini
                              </>
                            )}
                          </motion.button>
                        }
                      />

                      <AnimatedTextarea
                        label="Key Achievements (One per line)"
                        icon={Sparkles}
                        value={achievementsText}
                        onChange={(value) =>
                          updateExperience(
                            index,
                            'achievements',
                            value
                              .split('\n')
                              .map((line) => line.trim())
                              .filter((line) => line.length > 0)
                          )
                        }
                        placeholder={'• Grew net retention from 91% to 108% within 2 quarters\n• Reduced onboarding time by 35% by automating data imports'}
                        maxLength={750}
                        rows={4}
                      />

                      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-100/80">
                        <p className="font-semibold mb-1 text-indigo-100">Tip</p>
                        <ul className="space-y-1">
                          <li>• Lead with action verbs (Owned, Accelerated, Architected).</li>
                          <li>• Quantify outcomes with revenue, efficiency, or satisfaction metrics.</li>
                          <li>• Keep 3-4 punchy bullet points tailored to the role you want next.</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-indigo-500/20 bg-neutral-900/40 py-12 text-center"
          >
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-indigo-300/80" />
            <h3 className="text-lg font-semibold text-white mb-2">No experience added yet</h3>
            <p className="text-sm text-neutral-400 mb-6">Tell your story: roles, scope, and the metrics that prove your impact.</p>
            <motion.button
              onClick={addExperience}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus className="h-4 w-4" />
              Add Your First Experience
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Education Component
const EducationComponent = ({ data, onChange }: {
  data: Education[];
  onChange: (field: string, value: Education[]) => void;
}) => {
  const addEducation = () => {
    const next = [
      ...(Array.isArray(data) ? data : []),
      {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        graduationDate: '',
        gpa: ''
      }
    ];
    onChange('__replace__', next);
    toast.success('New education added! 🎓', { duration: 2000 });
  };

  const removeEducation = (index: number) => {
    const cloned = [...(Array.isArray(data) ? data : [])];
    const removed = cloned.splice(index, 1)[0];
    onChange('__replace__', cloned);

    toast.success('Education removed', { duration: 2000 });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const cloned = [...(Array.isArray(data) ? data : [])];
    cloned[index] = { ...cloned[index], [field]: value };
    onChange('__replace__', cloned);
  };

  const totalEntries = Array.isArray(data) ? data.length : 0;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/10">
            <GraduationCap className="h-5 w-5 text-emerald-200" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Education</h3>
            <p className="text-xs text-neutral-400">Showcase degrees, bootcamps, and programs that define your journey.</p>
          </div>
          <Badge variant="outline" className="text-xs border-emerald-400/40 text-emerald-100">
            {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
          </Badge>
        </div>

        <motion.button
          onClick={addEducation}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Add Education
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {totalEntries ? (
          <div className="space-y-4">
            {data.map((edu, index) => {
              const key = edu.id || index.toString();

              return (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -80, scale: 0.96 }}
                  className="group relative"
                >
                  <motion.div
                    className={cn(
                      'relative overflow-hidden rounded-2xl border transition-all duration-200 backdrop-blur-sm',
                      'hover:shadow-xl hover:border-emerald-400/50',
                      'border-emerald-400/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/15'
                    )}
                    whileHover={{ y: -2 }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/60 via-transparent to-emerald-400/40 opacity-70" />

                    <div className="flex items-start justify-between gap-4 p-6">
                      <div className="flex-1 space-y-1">
                        <div>
                          <h4 className="text-lg font-semibold text-white">
                            {edu.degree?.trim() || 'New Degree'}
                            {edu.field?.trim() ? (
                              <span className="text-sm font-normal text-emerald-200/80">&nbsp;• {edu.field.trim()}</span>
                            ) : null}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-300/80">
                            <span className="inline-flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {edu.institution?.trim() || 'Institution Name'}
                            </span>
                            {edu.graduationDate?.trim() && (
                              <>
                                <span className="text-neutral-500">•</span>
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {edu.graduationDate}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => removeEducation(index)}
                        className="hidden rounded-lg border border-transparent p-2 text-neutral-400 transition-all group-hover:flex group-hover:border-red-500/40 group-hover:bg-red-500/10 group-hover:text-red-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <div className="space-y-4 border-t border-emerald-400/20 bg-neutral-950/40 p-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatedInput
                          label="Institution"
                          icon={Building}
                          value={edu.institution || ''}
                          onChange={(value) => updateEducation(index, 'institution', value)}
                          placeholder="University of Example"
                        />
                        <AnimatedInput
                          label="Degree"
                          icon={Award}
                          value={edu.degree || ''}
                          onChange={(value) => updateEducation(index, 'degree', value)}
                          placeholder="Bachelor of Science"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatedInput
                          label="Field of Study"
                          icon={Code}
                          value={edu.field || ''}
                          onChange={(value) => updateEducation(index, 'field', value)}
                          placeholder="Computer Science"
                        />
                        <AnimatedInput
                          label="Graduation Date"
                          icon={Calendar}
                          value={edu.graduationDate || ''}
                          onChange={(value) => updateEducation(index, 'graduationDate', value)}
                          placeholder="May 2024"
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-neutral-700/60 bg-neutral-900/40 py-12 text-center"
          >
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-emerald-300/70" />
            <h3 className="text-lg font-semibold text-white mb-2">No education added yet</h3>
            <p className="text-sm text-neutral-400 mb-6">Add your academic background so employers can see your credentials.</p>
            <motion.button
              onClick={addEducation}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/35"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus className="h-4 w-4" />
              Add Your First Education
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Skills Component
const SkillsComponent = ({ data, onChange }: {
  data: Skill[];
  onChange: (field: string, value: Skill[]) => void;
}) => {
  const [skillInput, setSkillInput] = useState('');

  const skillsList = useMemo(() => {
    const source = Array.isArray(data) ? data : [];
    const collected = source.flatMap((entry) => {
      const fromItems = Array.isArray(entry.items) ? entry.items : [];
      const fallback = entry.name ? [entry.name] : [];
      return [...fromItems, ...fallback];
    });
    return Array.from(
      new Set(
        collected
          .filter((skill): skill is string => typeof skill === 'string' && skill.trim().length > 0)
          .map((skill) => skill.trim())
      )
    );
  }, [data]);

  const totalSkills = skillsList.length;
  const curatedSuggestions = useMemo(
    () =>
      [
        'JavaScript',
        'TypeScript',
        'React',
        'Next.js',
        'Node.js',
        'Product Strategy',
        'Design Systems',
        'Leadership',
        'Communication',
        'SQL',
        'Data Analysis',
        'Project Management'
      ].filter((skill) => !skillsList.some((existing) => existing.toLowerCase() === skill.toLowerCase())),
    [skillsList]
  );

  const commitSkills = (skills: string[]) => {
    const normalized = Array.from(
      new Set(
        skills
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)
      )
    );

    if (!normalized.length) {
      onChange('__replace__', []);
      return;
    }

    const category = data?.[0]?.category?.trim() || 'Core';
    onChange('__replace__', [
      {
        category,
        items: normalized
      }
    ]);
  };

  const handleAddSkill = (value?: string) => {
    const candidate = (value ?? skillInput).trim();
    if (!candidate) return;

    const exists = skillsList.some((skill) => skill.toLowerCase() === candidate.toLowerCase());
    if (exists) {
      toast.info(`“${candidate}” is already in your skill list.`);
      setSkillInput('');
      return;
    }

    commitSkills([...skillsList, candidate]);
    setSkillInput('');
    toast.success(`Added “${candidate}” to your skills.`);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    commitSkills(skillsList.filter((skill) => skill !== skillToRemove));
    toast.success(`Removed “${skillToRemove}”`);
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Skills Inventory</h3>
            <p className="text-xs text-neutral-400">Add, remove, and reorder the skills that appear on your resume.</p>
          </div>
          <Badge variant="outline" className="text-xs border-indigo-500/50 text-indigo-200">
            {totalSkills} {totalSkills === 1 ? 'skill' : 'skills'}
          </Badge>
        </div>
        <span className="hidden md:inline text-xs text-neutral-500">Tip: Focus on the top 8–12 skills that match your target role.</span>
      </div>

      <motion.div
        className="rounded-2xl border border-neutral-800/70 bg-neutral-900/50 backdrop-blur-sm p-6 space-y-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {skillsList.length ? (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {skillsList.map((skill) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative"
              >
                <Badge
                  variant="secondary"
                  className="pl-3 pr-7 py-1.5 text-sm bg-indigo-500/15 border border-indigo-500/30 text-indigo-100 hover:bg-indigo-500/25 transition-colors"
                >
                  {skill}
                  <motion.button
                    onClick={() => handleRemoveSkill(skill)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-indigo-200 hover:text-white hover:bg-indigo-500/60 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-neutral-700/60 bg-neutral-900/40 py-10 text-center"
          >
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-neutral-500" />
            <p className="text-sm text-neutral-300">No skills yet. Add your first skill below or pick from the suggestions.</p>
          </motion.div>
        )}

        <div className="flex flex-col gap-3 md:flex-row">
          <motion.input
            type="text"
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddSkill();
              }
            }}
            placeholder="e.g. Growth Marketing, GraphQL, Inclusive Leadership"
            className="flex-1 rounded-xl border border-neutral-700/60 bg-neutral-900/70 p-3 text-white placeholder:text-neutral-500 focus:border-indigo-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            onClick={() => handleAddSkill()}
            disabled={!skillInput.trim()}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium transition-all duration-200',
              skillInput.trim()
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            )}
            whileHover={skillInput.trim() ? { scale: 1.03 } : {}}
            whileTap={skillInput.trim() ? { scale: 0.97 } : {}}
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </motion.button>
        </div>
      </motion.div>

      {curatedSuggestions.length > 0 && (
        <motion.div
          className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-200" />
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200">Smart suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {curatedSuggestions.slice(0, 12).map((suggestion) => (
              <motion.button
                key={suggestion}
                onClick={() => handleAddSkill(suggestion)}
                className="rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-100 hover:bg-indigo-500/20 transition-colors"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {suggestion} +
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Enhanced Projects Component
const ProjectsComponent = ({ data, onChange }: {
  data: Project[];
  onChange: (field: string, value: Project[]) => void;
}) => {
  const [techInputs, setTechInputs] = useState<Record<string, string>>({});

  const addProject = () => {
    const next = [
      ...(Array.isArray(data) ? data : []),
      {
        id: Date.now().toString(),
        name: '',
        technologies: [],
        description: '',
        link: '',
        github: ''
      }
    ];
    onChange('__replace__', next);
    toast.success('New project added! 🚀', { duration: 2000 });
  };

  const removeProject = (index: number) => {
    const cloned = [...(Array.isArray(data) ? data : [])];
    cloned.splice(index, 1);
    onChange('__replace__', cloned);
    toast.success('Project removed', { duration: 2000 });
  };

  const updateProject = (index: number, field: string, value: string | string[]) => {
    const cloned = [...(Array.isArray(data) ? data : [])];
    cloned[index] = { ...cloned[index], [field]: value };
    onChange('__replace__', cloned);
  };

  const updateTechInput = (key: string, value: string) => {
    setTechInputs((prev) => ({ ...prev, [key]: value }));
  };

  const addTechnology = (projectIndex: number, key: string, value?: string) => {
    const candidate = (value ?? techInputs[key] ?? '').trim();
    if (!candidate) return;

    const cloned = [...(Array.isArray(data) ? data : [])];
    const project = { ...cloned[projectIndex] };
    const currentTech = Array.isArray(project.technologies) ? [...project.technologies] : [];

    if (currentTech.some((tech) => tech.toLowerCase() === candidate.toLowerCase())) {
      toast.info(`“${candidate}” is already in the tech stack.`);
      updateTechInput(key, '');
      return;
    }

    currentTech.push(candidate);
    project.technologies = currentTech;
    cloned[projectIndex] = project;
    onChange('__replace__', cloned);
    updateTechInput(key, '');
    toast.success(`Added “${candidate}” to the tech stack.`);
  };

  const removeTechnology = (projectIndex: number, technology: string) => {
    const cloned = [...(Array.isArray(data) ? data : [])];
    const project = { ...cloned[projectIndex] };
    const currentTech = Array.isArray(project.technologies) ? project.technologies : [];
    project.technologies = currentTech.filter((tech) => tech !== technology);
    cloned[projectIndex] = project;
    onChange('__replace__', cloned);
    toast.success(`Removed “${technology}”.`);
  };

  const totalProjects = Array.isArray(data) ? data.length : 0;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10">
            <Rocket className="h-5 w-5 text-sky-200" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Projects</h3>
            <p className="text-xs text-neutral-400">Demonstrate impact with the products and experiences you delivered.</p>
          </div>
          <Badge variant="outline" className="text-xs border-sky-400/40 text-sky-100">
            {totalProjects} {totalProjects === 1 ? 'project' : 'projects'}
          </Badge>
        </div>

        <motion.button
          onClick={addProject}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:shadow-sky-500/40"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {totalProjects ? (
          <div className="space-y-4">
            {data.map((project, index) => {
              const key = project.id || index.toString();
              const technologies = Array.isArray(project.technologies)
                ? project.technologies.filter((tech) => tech && tech.trim().length > 0)
                : [];

              return (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -80, scale: 0.96 }}
                  className="group relative"
                >
                  <motion.div
                    className={cn(
                      'relative overflow-hidden rounded-2xl border border-sky-400/60 bg-sky-600/10 shadow-lg shadow-sky-500/15 transition-all duration-200 backdrop-blur-sm',
                      'hover:shadow-xl hover:border-sky-300/70'
                    )}
                    whileHover={{ y: -2 }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400/60 via-transparent to-purple-400/40 opacity-70" />

                    <div className="flex items-start justify-between gap-4 p-6">
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{project.name?.trim() || 'New Project'}</h4>
                          {technologies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {technologies.map((tech) => (
                                <Badge
                                  key={tech}
                                  variant="outline"
                                  className="border-sky-400/40 bg-sky-500/10 text-[11px] uppercase tracking-wide text-sky-100"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <motion.button
                        onClick={() => removeProject(index)}
                        className="hidden rounded-lg border border-transparent p-2 text-neutral-400 transition-all group-hover:flex group-hover:border-red-500/40 group-hover:bg-red-500/10 group-hover:text-red-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5 border-t border-sky-400/20 bg-neutral-950/40 p-6"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatedInput
                          label="Project Name"
                          icon={Rocket}
                          value={project.name || ''}
                          onChange={(value) => updateProject(index, 'name', value)}
                          placeholder="AI Resume Builder"
                        />
                        <AnimatedInput
                          label="Live Demo Link"
                          icon={Building}
                          value={project.link || ''}
                          onChange={(value) => updateProject(index, 'link', value)}
                          placeholder="https://example.com"
                        />
                      </div>

                      <AnimatedTextarea
                        label="Project Description"
                        icon={Trophy}
                        value={project.description || ''}
                        onChange={(value) => updateProject(index, 'description', value)}
                        placeholder="Summarize the problem, your approach, and the measurable impact. Use bullet points for highlights."
                        maxLength={800}
                        rows={5}
                      />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatedInput
                          label="GitHub Repository"
                          icon={Code}
                          value={project.github || ''}
                          onChange={(value) => updateProject(index, 'github', value)}
                          placeholder="https://github.com/username/project"
                        />

                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                            <Code className="h-4 w-4 text-sky-300" /> Tech Stack
                          </label>
                          {technologies.length ? (
                            <div className="flex flex-wrap gap-2">
                              {technologies.map((tech) => (
                                <motion.div key={tech} className="group relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                  <Badge
                                    variant="secondary"
                                    className="pr-7 bg-sky-500/15 border border-sky-400/40 text-sky-100"
                                  >
                                    {tech}
                                    <motion.button
                                      onClick={() => removeTechnology(index, tech)}
                                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-sky-100/80 hover:text-white hover:bg-sky-500/60"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <X className="h-3 w-3" />
                                    </motion.button>
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500">Add the tools and languages that powered this project.</p>
                          )}

                          <div className="flex gap-2">
                            <motion.input
                              type="text"
                              value={techInputs[key] ?? ''}
                              onChange={(event) => updateTechInput(key, event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  addTechnology(index, key);
                                }
                              }}
                              placeholder="Add a technology and press Enter"
                              className="flex-1 rounded-xl border border-neutral-700/60 bg-neutral-900/70 p-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-sky-500/70 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                              whileFocus={{ scale: 1.01 }}
                            />
                            <motion.button
                              onClick={() => addTechnology(index, key)}
                              className="inline-flex items-center gap-2 rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-semibold text-white shadow-sky-500/25 transition-all hover:bg-sky-500"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Plus className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-neutral-700/60 bg-neutral-900/40 py-12 text-center"
          >
            <Rocket className="mx-auto mb-4 h-12 w-12 text-sky-300/70" />
            <h3 className="text-lg font-semibold text-white mb-2">No projects added yet</h3>
            <p className="text-sm text-neutral-400 mb-6">Showcase your best case studies, apps, or launches to prove your impact.</p>
            <motion.button
              onClick={addProject}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:shadow-sky-500/35"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus className="h-4 w-4" />
              Add Your First Project
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Certifications Component
const CertificationsComponent = ({ data, onChange }: {
  data: Certification[];
  onChange: (field: string, value: Certification[]) => void;
}) => {
  const addCertification = () => {
    const next = [
      ...(Array.isArray(data) ? data : []),
      {
        id: Date.now().toString(),
        name: '',
        issuer: '',
        date: '',
        credential: ''
      }
    ];
    onChange('__replace__', next);
    toast.success('New certification added! 🏆', { duration: 2000 });
  };

  const removeCertification = (index: number) => {
    const cloned = [...(Array.isArray(data) ? data : [])];
    cloned.splice(index, 1);
    onChange('__replace__', cloned);
    toast.success('Certification removed', { duration: 2000 });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const cloned = [...(Array.isArray(data) ? data : [])];
    cloned[index] = { ...cloned[index], [field]: value };
    onChange('__replace__', cloned);
  };

  const handleCopyCredential = async (credential?: string) => {
    if (!credential?.trim()) {
      toast.info('Add a credential ID to copy it.');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator?.clipboard) {
      toast.error('Clipboard is unavailable in this environment.');
      return;
    }

    try {
      await navigator.clipboard.writeText(credential.trim());
      toast.success('Credential ID copied!');
    } catch (error) {
      toast.error('Unable to copy credential right now.');
    }
  };

  const totalCerts = Array.isArray(data) ? data.length : 0;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/10">
            <Trophy className="h-5 w-5 text-emerald-200" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Certifications</h3>
            <p className="text-xs text-neutral-400">Surface trusted credentials, licenses, and proof-points.</p>
          </div>
          <Badge variant="outline" className="text-xs border-emerald-400/40 text-emerald-100">
            {totalCerts} {totalCerts === 1 ? 'certification' : 'certifications'}
          </Badge>
        </div>

        <motion.button
          onClick={addCertification}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Add Certification
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {totalCerts ? (
          <div className="space-y-4">
            {data.map((certification, index) => {
              const key = certification.id || index.toString();

              return (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, y: 22, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -70, scale: 0.95 }}
                  className="group relative"
                >
                  <motion.div
                    className={cn(
                      'relative overflow-hidden rounded-2xl border border-emerald-400/60 bg-emerald-600/10 shadow-lg shadow-emerald-500/15 transition-all duration-200 backdrop-blur-sm',
                      'hover:shadow-xl hover:border-emerald-300/70'
                    )}
                    whileHover={{ y: -2 }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400/70 via-transparent to-teal-400/50" />

                    <div className="flex items-start justify-between gap-4 p-6">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{certification.name?.trim() || 'New Certification'}</h4>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-100">
                              <Building className="h-3.5 w-3.5" />
                              {certification.issuer?.trim() || 'Issuing Organization'}
                            </span>
                            {certification.date?.trim() && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 px-3 py-1 text-[11px] text-emerald-50/90">
                                <Calendar className="h-3.5 w-3.5" />
                                {certification.date}
                              </span>
                            )}
                            {certification.credential?.trim() && (
                              <motion.button
                                onClick={() => handleCopyCredential(certification.credential)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-100 transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/20"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <Copy className="h-3.5 w-3.5" /> Copy ID
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => removeCertification(index)}
                        className="hidden rounded-lg border border-transparent p-2 text-neutral-400 transition-all group-hover:flex group-hover:border-red-500/30 group-hover:bg-red-500/10 group-hover:text-red-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 border-t border-emerald-400/20 bg-neutral-950/40 p-6"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatedInput
                          label="Certification Name"
                          icon={Trophy}
                          value={certification.name || ''}
                          onChange={(value) => updateCertification(index, 'name', value)}
                          placeholder="AWS Certified Solutions Architect"
                        />
                        <AnimatedInput
                          label="Issuing Organization"
                          icon={Building}
                          value={certification.issuer || ''}
                          onChange={(value) => updateCertification(index, 'issuer', value)}
                          placeholder="Amazon Web Services"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <AnimatedInput
                          label="Issue Date"
                          icon={Calendar}
                          value={certification.date || ''}
                          onChange={(value) => updateCertification(index, 'date', value)}
                          placeholder="Jan 2024"
                        />
                        <AnimatedInput
                          label="Credential ID (Optional)"
                          icon={Award}
                          value={certification.credential || ''}
                          onChange={(value) => updateCertification(index, 'credential', value)}
                          placeholder="ABC-12345"
                        />
                      </div>

                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-100/80">
                        <p className="font-semibold mb-1 text-emerald-100">Make it shine:</p>
                        <ul className="space-y-1">
                          <li>• Mention specialization or score in the description.</li>
                          <li>• Include recertification dates if applicable.</li>
                          <li>• Add a credential URL inside the notes section of the resume template.</li>
                        </ul>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-emerald-500/20 bg-neutral-900/40 py-12 text-center"
          >
            <Trophy className="mx-auto mb-4 h-12 w-12 text-emerald-300/80" />
            <h3 className="text-lg font-semibold text-white mb-2">No certifications added yet</h3>
            <p className="text-sm text-neutral-400 mb-6">Highlight the credentials and licenses that separate you from the crowd.</p>
            <motion.button
              onClick={addCertification}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus className="h-4 w-4" />
              Add Your First Certification
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Interests Component Wrapper
const InterestsComponent = ({ data, onChange }: {
  data: string[];
  onChange: (field: string, value: unknown) => void;
}) => {
  const interests = Array.isArray(data) ? data : [];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 text-rose-400" />
        <h3 className="text-lg font-semibold text-white">Interests & Hobbies</h3>
        <Badge variant="outline" className="text-xs border-rose-500/40 text-rose-200">
          {interests.length} {interests.length === 1 ? 'interest' : 'interests'}
        </Badge>
      </div>

      <InterestsSection data={interests} onChange={onChange} />

      <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-100/80">
        <div className="font-semibold mb-2">Tips</div>
        <ul className="space-y-1 text-xs text-rose-100/70">
          <li>• Highlight interests that showcase collaboration or creativity.</li>
          <li>• Keep the list concise with 3-5 curated hobbies.</li>
          <li>• Avoid controversial or overly niche references.</li>
        </ul>
      </div>
    </motion.div>
  );
};

// Languages Component Wrapper
const LanguagesComponent = ({ data, onChange }: {
  data: Language[];
  onChange: (field: string, value: unknown) => void;
}) => {
  const languages = Array.isArray(data) ? data : [];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Languages</h3>
        <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-200">
          {languages.length} {languages.length === 1 ? 'language' : 'languages'}
        </Badge>
      </div>

      <LanguagesSection data={languages} onChange={onChange} />

      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-100/80">
        <div className="font-semibold mb-2">Tip</div>
        <p className="text-xs text-emerald-100/70">
          Stay honest about proficiency. Recruiters often validate language claims during interviews.
        </p>
      </div>
    </motion.div>
  );
};

interface SectionEditorProps {
  activeSection: SectionKey | 'summary';
  resumeData: ResumeData;
  onDataChange: (section: string, field: string, value: unknown) => void;
}



type SectionComponent = React.ComponentType<{
  data: unknown;
  onChange: (field: string, value: unknown) => void;
}>;

const sectionMap: Record<string, {
  title: string;
  description: string;
  component: SectionComponent;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  personalInfo: {
    title: 'Personal Information',
    description: 'Update your contact details and basic information.',
    component: PersonalInfoComponent as unknown as SectionComponent,
    icon: User,
  },
  summary: {
    title: 'Professional Summary',
    description: 'Write a compelling summary of your professional background.',
    component: SummaryComponent as unknown as SectionComponent,
    icon: Sparkles,
  },
  workExperience: {
    title: 'Work Experience',
    description: 'Detail your professional work history and achievements.',
    component: WorkExperienceComponent as unknown as SectionComponent,
    icon: Briefcase,
  },
  education: {
    title: 'Education',
    description: 'List your educational background and qualifications.',
    component: EducationComponent as unknown as SectionComponent,
    icon: GraduationCap,
  },
  skills: {
    title: 'Skills',
    description: 'Highlight your technical and professional skills.',
    component: SkillsComponent as unknown as SectionComponent,
    icon: Code,
  },
  projects: {
    title: 'Projects',
    description: 'Showcase your notable projects and accomplishments.',
    component: ProjectsComponent as unknown as SectionComponent,
    icon: Rocket,
  },
  certifications: {
    title: 'Certifications',
    description: 'List your professional certifications and licenses.',
    component: CertificationsComponent as unknown as SectionComponent,
    icon: Trophy,
  },
  languages: {
    title: 'Languages',
    description: 'Add the languages you speak and your proficiency level.',
    component: LanguagesComponent as unknown as SectionComponent,
    icon: Globe,
  },
  interests: {
    title: 'Interests & Hobbies',
    description: 'Share personal interests that complement your professional profile.',
    component: InterestsComponent as unknown as SectionComponent,
    icon: Heart,
  },
};

const sectionThemes: Record<string, {
  gradient: string;
  glow: string;
  pill: string;
  badge: string;
  icon: string;
}> = {
  default: {
    gradient: 'from-neutral-900/80 via-neutral-900/60 to-neutral-950/80',
    glow: 'from-purple-500/20 via-transparent to-blue-500/20',
    pill: 'border-white/10 bg-white/5 text-white/80',
    badge: 'bg-white/10 text-white/75',
    icon: 'text-white/80',
  },
  personalInfo: {
    gradient: 'from-blue-500/25 via-cyan-500/10 to-slate-900/70',
    glow: 'from-blue-500/35 via-transparent to-cyan-400/25',
    pill: 'border-blue-400/40 bg-blue-500/20 text-blue-100',
    badge: 'bg-blue-500/20 text-blue-100',
    icon: 'text-blue-100',
  },
  summary: {
    gradient: 'from-purple-500/30 via-pink-500/10 to-slate-900/70',
    glow: 'from-purple-500/35 via-transparent to-pink-400/25',
    pill: 'border-purple-400/40 bg-purple-500/20 text-purple-100',
    badge: 'bg-purple-500/20 text-purple-100',
    icon: 'text-purple-100',
  },
  workExperience: {
    gradient: 'from-amber-500/25 via-orange-500/10 to-slate-900/70',
    glow: 'from-amber-500/35 via-transparent to-orange-400/25',
    pill: 'border-amber-400/40 bg-amber-500/20 text-amber-50',
    badge: 'bg-amber-500/20 text-amber-50',
    icon: 'text-amber-50',
  },
  education: {
    gradient: 'from-emerald-500/25 via-teal-500/10 to-slate-900/70',
    glow: 'from-emerald-500/35 via-transparent to-teal-400/25',
    pill: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-50',
    badge: 'bg-emerald-500/20 text-emerald-50',
    icon: 'text-emerald-50',
  },
  skills: {
    gradient: 'from-indigo-500/30 via-sky-500/10 to-slate-900/70',
    glow: 'from-indigo-500/35 via-transparent to-sky-400/25',
    pill: 'border-indigo-400/40 bg-indigo-500/20 text-indigo-100',
    badge: 'bg-indigo-500/20 text-indigo-100',
    icon: 'text-indigo-100',
  },
  projects: {
    gradient: 'from-pink-500/30 via-orange-500/10 to-slate-900/70',
    glow: 'from-pink-500/35 via-transparent to-orange-400/25',
    pill: 'border-pink-400/40 bg-pink-500/20 text-pink-100',
    badge: 'bg-pink-500/20 text-pink-100',
    icon: 'text-pink-100',
  },
  certifications: {
    gradient: 'from-emerald-500/30 via-lime-500/10 to-slate-900/70',
    glow: 'from-emerald-500/35 via-transparent to-lime-400/25',
    pill: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
    badge: 'bg-emerald-500/20 text-emerald-100',
    icon: 'text-emerald-100',
  },
  languages: {
    gradient: 'from-emerald-500/25 via-teal-500/15 to-slate-900/70',
    glow: 'from-emerald-500/35 via-transparent to-teal-400/25',
    pill: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
    badge: 'bg-emerald-500/20 text-emerald-100',
    icon: 'text-emerald-100',
  },
  interests: {
    gradient: 'from-rose-500/30 via-pink-500/10 to-slate-900/70',
    glow: 'from-rose-500/35 via-transparent to-pink-400/25',
    pill: 'border-rose-400/40 bg-rose-500/20 text-rose-100',
    badge: 'bg-rose-500/20 text-rose-100',
    icon: 'text-rose-100',
  },
};

export default function SectionEditor({
  activeSection,
  resumeData,
  onDataChange
}: SectionEditorProps) {
  const currentSection = sectionMap[activeSection];
  const Component = currentSection?.component;
  const Icon = currentSection?.icon;
  const theme = sectionThemes[activeSection] ?? sectionThemes.default;

  const handleSectionChange = (field: string, value: unknown) => {
    // Special-case summary: it's nested under personalInfo.summary
    if (activeSection === 'summary') {
      onDataChange('personalInfo', 'summary', value);
      return;
    }
    onDataChange(activeSection, field, value);
  };

  // Get the section data safely
  const arraySections: SectionKey[] = [
    'workExperience',
    'education',
    'projects',
    'certifications',
    'languages',
    'interests',
  ];
  const sectionData = activeSection === 'summary'
    ? (resumeData?.content?.personalInfo ?? {})
    : (resumeData?.content?.[activeSection as SectionKey] ?? (arraySections.includes(activeSection as SectionKey) ? [] : {}));

  return (
    <div className="w-full mt-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentSection ? (
            <motion.div
              className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br shadow-xl transition-all duration-300",
                theme.gradient
              )}
              whileHover={{ scale: 1.003 }}
            >
              <div
                className={cn(
                  "absolute inset-0 pointer-events-none opacity-70 blur-3xl bg-gradient-to-br",
                  theme.glow
                )}
              />
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_30%,rgba(255,255,255,0)_70%)]" />

              <div className="relative p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur",
                        theme.pill
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            theme.icon
                          )}
                        />
                      )}
                      <span>{currentSection.title}</span>
                    </div>
                    <p className="max-w-xl text-sm text-white/85">
                      {currentSection.description}
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="hidden sm:block"
                  >
                    <Badge
                      className={cn(
                        "flex items-center gap-1 border-none text-xs font-semibold shadow-sm backdrop-blur",
                        theme.badge
                      )}
                    >
                      <Sparkles className="h-3 w-3" />
                      Auto-sync enabled
                    </Badge>
                  </motion.div>
                </div>

                {Component && (
                  <div className="relative z-10">
                    <Component data={sectionData} onChange={handleSectionChange} />
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900/70 via-neutral-900/55 to-neutral-950/80 p-10 text-center shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.22)_0%,_transparent_55%)]" />
              <div className="relative z-10">
                <Sparkles className="h-12 w-12 text-white/70 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a section to edit
                </h3>
                <p className="text-sm text-white/70 max-w-md mx-auto">
                  Choose a section from the navigation to start editing your resume.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* AI Assistant Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <Card className="relative overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-blue-500/20 text-white/85 shadow-lg backdrop-blur-sm">
          <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.28)_0%,_transparent_60%)]" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-4 mb-4">
              <motion.div 
                className="p-3 rounded-full bg-white/10 shadow-inner"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Sparkles className="w-6 h-6 text-purple-200" />
              </motion.div>
              <div>
                <h4 className="font-semibold text-white">AI Resume Assistant</h4>
                <p className="text-sm text-white/70">
                  Get personalized suggestions and polish your sections faster.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.button
                className="p-3 rounded-lg border border-white/15 bg-white/10 text-sm font-medium text-white hover:bg-white/15 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                ✨ Generate Summary
              </motion.button>
              <motion.button
                className="p-3 rounded-lg border border-white/15 bg-white/10 text-sm font-medium text-white hover:bg-white/15 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                🚀 Optimize Content
              </motion.button>
              <motion.button
                className="p-3 rounded-lg border border-white/15 bg-white/10 text-sm font-medium text-white hover:bg-white/15 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                💡 Get Tips
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}