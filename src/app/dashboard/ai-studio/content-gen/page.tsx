"use client";

// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Sparkles, FileText, Briefcase, Users, Target, 
  Copy, Download, RefreshCw, Wand2, BookOpen,
  CheckCircle, ArrowRight, MessageSquare,
  Lightbulb, Star, Globe, Rocket, Search,
  Brain, Clock, Award, BarChart3, Zap,
  Cpu, Shield, Database, Cloud, Server,
  ChevronDown, ChevronUp, History, Trash2,
  Bookmark, ThumbsUp, ThumbsDown, Share,
  CheckCircle2, TrendingUp
} from "lucide-react";
import { useState, useRef, ComponentType, useEffect } from "react";

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

// Content Types Configuration
const contentTypes = [
  {
    id: "summary",
    title: "Professional Summary",
    description: "Create compelling professional summaries for resumes and LinkedIn",
    icon: FileText,
    color: "from-pink-500 to-orange-500",
    bgColor: "bg-neutral-800",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    placeholder: "Paste your experience, skills, and career goals here...",
    endpoint: "/api/ai/summary"
  },
  {
    id: "bullets",
    title: "Achievement Bullets",
    description: "Transform job descriptions into quantified achievement statements",
    icon: Target,
    color: "from-pink-500 to-orange-500",
    bgColor: "bg-neutral-800",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    placeholder: "Paste your job responsibilities and achievements here...",
    endpoint: "/api/ai/bullets"
  },
  {
    id: "cover-letter",
    title: "Cover Letter",
    description: "Generate personalized cover letters tailored to specific roles",
    icon: MessageSquare,
    color: "from-pink-500 to-orange-500",
    bgColor: "bg-neutral-800",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    placeholder: "Paste the job description and your background here...",
    endpoint: "/api/ai/content-gen/cover-letter"
  },
  {
    id: "linkedin-post",
    title: "LinkedIn Posts",
    description: "Create engaging LinkedIn content to boost your professional presence",
    icon: Users,
    color: "from-pink-500 to-orange-500",
    bgColor: "bg-neutral-800",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    placeholder: "Describe what you want to share or promote on LinkedIn...",
    endpoint: "/api/ai/content-gen/linkedin-post"
  },
  {
    id: "job-description",
    title: "Job Description",
    description: "Create comprehensive job descriptions for any role",
    icon: Briefcase,
    color: "from-pink-500 to-orange-500",
    bgColor: "bg-neutral-800",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    placeholder: "Describe the role, requirements, and company details...",
    endpoint: "/api/ai/content-gen/job-description"
  },
  {
    id: "skills-keywords",
    title: "Skills & Keywords",
    description: "Extract and optimize relevant skills and keywords",
    icon: Search,
    color: "from-pink-500 to-orange-500",
    bgColor: "bg-neutral-800",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    placeholder: "Paste job descriptions or content to extract skills from...",
    endpoint: "/api/ai/content-gen/skills-keywords"
  }
];

// Statistics Component with Dark Theme
const StatCard = ({ icon: Icon, title, value, description, delay }: {
  icon: ComponentType<{className: string}>, title: string, value: string, description: string, delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 shadow-lg">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-400">{title}</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
          {value}
        </p>
      </div>
    </div>
    <p className="text-neutral-500 text-sm">{description}</p>
  </motion.div>
);

// Content Type Card Component with Dark Theme
const ContentTypeCard = ({ type, isActive, onClick }: {
  type: typeof contentTypes[0], isActive: boolean, onClick: () => void
}) => {
  const Icon = type.icon;
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
        isActive 
          ? `${type.borderColor} ${type.bgColor} shadow-lg scale-105` 
          : 'border-neutral-700 bg-neutral-800/80 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${type.color} shadow-lg flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg mb-1 ${isActive ? type.textColor : 'text-white'}`}>
            {type.title}
          </h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            {type.description}
          </p>
        </div>
      </div>
      
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center`}>
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// 3D Hover Card Component
const HoverCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={`relative rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md p-6 overflow-hidden ${className}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Modern Skills Display Component
const ModernSkillsDisplay = ({ data }: { data: Record<string, unknown> }) => {
  if (!data || typeof data !== 'object') {
    return (
      <div className="text-neutral-400 p-8 text-center">
        Unable to parse skills analysis.
      </div>
    );
  }

  // Safe string conversion helper
  const toSafeString = (value: unknown): string => {
    if (value === null || value === undefined) return 'N/A';
    return String(value);
  };

  const getProficiencyColor = (level: string) => {
    const normalized = level?.toLowerCase() || '';
    if (normalized.includes('expert') || normalized.includes('advanced')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (normalized.includes('intermediate')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (normalized.includes('beginner') || normalized.includes('basic')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  };

  const getImportanceColor = (importance: string) => {
    const normalized = importance?.toLowerCase() || '';
    if (normalized.includes('high') || normalized.includes('critical')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (normalized.includes('medium') || normalized.includes('moderate')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (normalized.includes('low')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  };

  const getPriorityIcon = (priority: string) => {
    const normalized = priority?.toLowerCase() || '';
    if (normalized.includes('high')) return '🔥';
    if (normalized.includes('medium')) return '⚡';
    return '💡';
  };

  const getRelevanceColor = (relevance: string) => {
    const normalized = relevance?.toLowerCase() || '';
    if (normalized.includes('high')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (normalized.includes('medium')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (normalized.includes('low')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  };

  const getImpactColor = (impact: string) => {
    const normalized = impact?.toLowerCase() || '';
    if (normalized.includes('high')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (normalized.includes('medium')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (normalized.includes('low')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Technical Skills */}
      {Array.isArray(data.technicalSkills) && data.technicalSkills.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Technical Skills</h3>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {data.technicalSkills.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.technicalSkills.map((skill: Record<string, unknown>, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{toSafeString(skill.skill)}</div>
                    {skill.description ? (
                      <p className="text-sm text-neutral-400 leading-relaxed">{toSafeString(skill.description)}</p>
                    ) : null}
                  </div>
                  {skill.proficiencyLevel ? (
                    <Badge className={`${getProficiencyColor(toSafeString(skill.proficiencyLevel))} border shrink-0`}>
                      {toSafeString(skill.proficiencyLevel)}
                    </Badge>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Soft Skills */}
      {Array.isArray(data.softSkills) && data.softSkills.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Soft Skills</h3>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {data.softSkills.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.softSkills.map((skill: Record<string, unknown>, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{toSafeString(skill.skill)}</div>
                    {skill.description ? (
                      <p className="text-sm text-neutral-400 leading-relaxed">{toSafeString(skill.description)}</p>
                    ) : null}
                  </div>
                  {skill.importance ? (
                    <Badge className={`${getImportanceColor(toSafeString(skill.importance))} border shrink-0`}>
                      {toSafeString(skill.importance)}
                    </Badge>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* ATS Keywords */}
      {Array.isArray(data.atsKeywords) && data.atsKeywords.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">ATS Keywords</h3>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {data.atsKeywords.length}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.atsKeywords.map((keyword: Record<string, unknown>, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative"
              >
                <Badge className="bg-green-500/10 text-green-400 border-green-500/30 border px-4 py-2 text-sm hover:bg-green-500/20 transition-colors cursor-default">
                  {toSafeString(keyword.keyword)}
                  {keyword.frequency ? (
                    <span className="ml-2 text-xs opacity-70">({toSafeString(keyword.frequency)})</span>
                  ) : null}
                </Badge>
                {keyword.context ? (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {toSafeString(keyword.context)}
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Recommendations */}
      {Array.isArray(data.recommendations) && data.recommendations.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Recommendations</h3>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {data.recommendations.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {data.recommendations.map((rec: Record<string, unknown>, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{getPriorityIcon(toSafeString(rec.priority))}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{toSafeString(rec.suggestion)}</span>
                      {rec.priority ? (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 border text-xs">
                          {toSafeString(rec.priority)}
                        </Badge>
                      ) : null}
                    </div>
                    {rec.reasoning ? (
                      <p className="text-sm text-neutral-400 leading-relaxed">{toSafeString(rec.reasoning)}</p>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Industry Skills */}
      {Array.isArray(data.industrySkills) && data.industrySkills.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Industry Skills</h3>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {data.industrySkills.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.industrySkills.map((skill: Record<string, unknown>, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{toSafeString(skill.skill)}</div>
                    {skill.description ? (
                      <p className="text-sm text-neutral-400 leading-relaxed">{toSafeString(skill.description)}</p>
                    ) : null}
                  </div>
                  {skill.relevance ? (
                    <Badge className={`${getRelevanceColor(toSafeString(skill.relevance))} border shrink-0`}>
                      {toSafeString(skill.relevance)}
                    </Badge>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Certifications */}
      {Array.isArray(data.certifications) && data.certifications.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500">
              <Award className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Recommended Certifications</h3>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              {data.certifications.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.certifications.map((cert: Record<string, unknown>, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 hover:border-yellow-500/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{toSafeString(cert.certification)}</div>
                    {cert.description ? (
                      <p className="text-sm text-neutral-400 leading-relaxed mb-2">{toSafeString(cert.description)}</p>
                    ) : null}
                    {cert.priority ? (
                      <Badge className={`${getPriorityIcon(toSafeString(cert.priority)) === '🔥' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'} border text-xs`}>
                        {toSafeString(cert.priority)} Priority
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Action Verbs */}
      {Array.isArray(data.actionVerbs) && data.actionVerbs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Power Action Verbs</h3>
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
              {data.actionVerbs.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.actionVerbs.map((verb: Record<string, unknown>, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-violet-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-bold text-violet-400 text-lg">{toSafeString(verb.verb)}</div>
                  {verb.impact ? (
                    <Badge className={`${getImpactColor(toSafeString(verb.impact))} border shrink-0 text-xs`}>
                      {toSafeString(verb.impact)} Impact
                    </Badge>
                  ) : null}
                </div>
                {verb.context ? (
                  <div className="text-xs text-neutral-500 mb-2">Context: {toSafeString(verb.context)}</div>
                ) : null}
                {Array.isArray(verb.examples) && verb.examples.length > 0 ? (
                  <div className="mt-2 pl-3 border-l-2 border-violet-500/30">
                    {verb.examples.map((example: unknown, exIdx: number) => (
                      <p key={exIdx} className="text-sm text-neutral-400 italic leading-relaxed">
                        "{toSafeString(example)}"
                      </p>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Summary */}
      {data.summary && typeof data.summary === 'object' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-orange-500">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data.summary as Record<string, unknown>).totalSkillsFound ? (
              <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <div className="text-2xl font-bold text-white mb-1">
                  {toSafeString((data.summary as Record<string, unknown>).totalSkillsFound)}
                </div>
                <div className="text-sm text-neutral-400">Total Skills Found</div>
              </div>
            ) : null}
            {(data.summary as Record<string, unknown>).atsCompatibility ? (
              <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {toSafeString((data.summary as Record<string, unknown>).atsCompatibility)}
                </div>
                <div className="text-sm text-neutral-400">ATS Compatibility</div>
              </div>
            ) : null}
            {(data.summary as Record<string, unknown>).overallAssessment ? (
              <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700 md:col-span-3">
                <div className="text-sm text-neutral-400 mb-1">Overall Assessment</div>
                <div className="text-base text-white">
                  {toSafeString((data.summary as Record<string, unknown>).overallAssessment)}
                </div>
              </div>
            ) : null}
          </div>

          {/* Strength and Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {Array.isArray((data.summary as Record<string, unknown>).strengthAreas) && Array.isArray((data.summary as Record<string, unknown>).strengthAreas) && ((data.summary as Record<string, unknown>).strengthAreas as unknown[]).length > 0 ? (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-green-400" />
                  <h4 className="font-semibold text-green-400">Strength Areas</h4>
                </div>
                <ul className="space-y-2">
                  {((data.summary as Record<string, unknown>).strengthAreas as unknown[]).map((area: unknown, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{toSafeString(area)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {Array.isArray((data.summary as Record<string, unknown>).improvementAreas) && ((data.summary as Record<string, unknown>).improvementAreas as unknown[]).length > 0 ? (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-orange-400" />
                  <h4 className="font-semibold text-orange-400">Improvement Areas</h4>
                </div>
                <ul className="space-y-2">
                  {((data.summary as Record<string, unknown>).improvementAreas as unknown[]).map((area: unknown, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
                      <ArrowRight className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>{toSafeString(area)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

// Modern Summary Display Component
const ModernSummaryDisplay = ({ content }: { content: string }) => {
  const lines = content.split('\n').filter(line => line.trim());
  const headline = lines[0] || '';
  const summary = lines.slice(1, 4).join(' ') || content.substring(0, 300);
  const highlights = lines.slice(4).filter(line => line.includes('•') || line.includes('-'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Headline */}
      <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-2xl p-6 border border-pink-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <h3 className="text-lg font-semibold text-pink-400">Professional Headline</h3>
        </div>
        <p className="text-2xl font-bold text-neutral-100 leading-relaxed">{headline}</p>
      </div>

      {/* Summary */}
      <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-orange-400">Summary</h3>
        </div>
        <p className="text-neutral-200 leading-relaxed text-lg">{summary}</p>
      </div>

      {/* Highlights */}
      {highlights.length > 0 ? (
        <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-400">Key Highlights</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {highlights.map((highlight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20 px-3 py-1 text-sm">
                  {highlight.replace(/^[•\-\s]+/, '')}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

// Modern Bullets Display Component
const ModernBulletsDisplay = ({ content }: { content: string }) => {
  const bullets = content.split('\n').filter(line => line.trim() && (line.includes('•') || line.includes('-') || line.match(/^\d+\./)));
  
  const extractMetric = (text: string) => {
    const metrics = text.match(/\d+%|\$\d+[KMB]?|\d+\+/g);
    return metrics ? metrics[0] : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-6 h-6 text-pink-400" />
        <h3 className="text-xl font-semibold text-pink-400">Achievement Bullets</h3>
        <Badge className="ml-auto bg-pink-500/10 text-pink-300 border-pink-500/20">{bullets.length} bullets</Badge>
      </div>

      {bullets.map((bullet, idx) => {
        const cleanBullet = bullet.replace(/^[•\-\d\.\s]+/, '');
        const metric = extractMetric(cleanBullet);
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-r from-pink-500/5 to-orange-500/5 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-neutral-200 leading-relaxed">{cleanBullet}</p>
                {metric ? (
                  <Badge className="mt-2 bg-orange-500/10 text-orange-300 border-orange-500/20">
                    <Zap className="w-3 h-3 mr-1" />
                    {metric}
                  </Badge>
                ) : null}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Modern Cover Letter Display Component
const ModernCoverLetterDisplay = ({ content }: { content: string }) => {
  const sections = content.split('\n\n');
  const header = sections[0] || '';
  const greeting = sections[1] || '';
  const body = sections.slice(2, -1);
  const closing = sections[sections.length - 1] || '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Letter Container */}
      <div className="bg-white/5 rounded-2xl p-8 md:p-12 border border-neutral-700 shadow-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pb-6 border-b border-neutral-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-semibold text-pink-400 uppercase tracking-wider">Cover Letter</span>
          </div>
          <pre className="text-neutral-300 text-sm whitespace-pre-wrap font-sans">{header}</pre>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-neutral-200 text-lg font-medium">{greeting}</p>
        </motion.div>

        {/* Body Paragraphs */}
        <div className="space-y-4 mb-6">
          {body.map((paragraph, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="text-neutral-300 leading-relaxed text-base"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-neutral-700"
        >
          <pre className="text-neutral-300 whitespace-pre-wrap font-sans">{closing}</pre>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Badge className="bg-green-500/10 text-green-300 border-green-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          ATS-Friendly Format
        </Badge>
        <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20">
          <FileText className="w-3 h-3 mr-1" />
          Professional Tone
        </Badge>
      </div>
    </motion.div>
  );
};

// Modern LinkedIn Display Component
const ModernLinkedInDisplay = ({ content }: { content: string }) => {
  const charCount = content.length;
  const maxChars = 3000;
  const hashtags = content.match(/#\w+/g) || [];
  const engagement = Math.floor(Math.random() * 100) + 50; // Mock engagement score

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Post Preview */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-100">Your LinkedIn Post</h3>
            <p className="text-sm text-neutral-400">Preview how it will look</p>
          </div>
        </div>
        
        <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-700">
          <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Character Count */}
        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-neutral-400">Character Count</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-100">{charCount}</span>
            <span className="text-sm text-neutral-500">/ {maxChars}</span>
          </div>
          <div className="mt-2 h-2 bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${charCount > maxChars ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min((charCount / maxChars) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Hashtags */}
        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-neutral-400">Hashtags</span>
          </div>
          <div className="text-2xl font-bold text-neutral-100">{hashtags.length}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {hashtags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Engagement Potential */}
        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-neutral-400">Engagement Score</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-100">{engagement}</span>
            <span className="text-sm text-green-400">/ 100</span>
          </div>
          <Badge className="mt-2 bg-green-500/10 text-green-300 border-green-500/20">
            {engagement > 70 ? 'Excellent' : engagement > 50 ? 'Good' : 'Needs Work'}
          </Badge>
        </div>
      </div>

      {/* Best Time to Post */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-sm font-medium text-neutral-300">Optimal posting times</p>
            <p className="text-xs text-neutral-500">Tuesday-Thursday, 8-10 AM or 12-2 PM (your timezone)</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Modern Job Description Display Component
const ModernJobDescriptionDisplay = ({ content }: { content: string }) => {
  const sections = content.split('\n\n');
  const title = sections[0] || '';
  const overview = sections[1] || '';
  const responsibilities = sections.find(s => s.toLowerCase().includes('responsibilit')) || '';
  const requirements = sections.find(s => s.toLowerCase().includes('requirement') || s.toLowerCase().includes('qualification')) || '';
  const benefits = sections.find(s => s.toLowerCase().includes('benefit')) || '';
  
  const parseList = (text: string) => {
    return text.split('\n').filter(line => line.trim() && (line.includes('•') || line.includes('-') || line.match(/^\d+\./)));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <Briefcase className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-neutral-100">{title}</h3>
        </div>
        {overview ? <p className="text-neutral-300 leading-relaxed">{overview}</p> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Responsibilities */}
        {responsibilities ? (
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold text-blue-400">Key Responsibilities</h4>
            </div>
            <div className="space-y-2">
              {parseList(responsibilities).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-neutral-300 text-sm">{item.replace(/^[•\-\d\.\s]+/, '')}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Requirements */}
        {requirements ? (
          <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold text-green-400">Requirements</h4>
            </div>
            <div className="space-y-2">
              {parseList(requirements).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-2"
                >
                  <Star className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-neutral-300 text-sm">{item.replace(/^[•\-\d\.\s]+/, '')}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Benefits */}
      {benefits ? (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-semibold text-green-400">Benefits & Perks</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {parseList(benefits).map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Badge className="bg-green-500/10 text-green-300 border-green-500/20 px-3 py-2">
                  {benefit.replace(/^[•\-\d\.\s]+/, '')}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

// Helper function to format skills analysis
const formatSkillsAnalysis = (parsed: Record<string, unknown>): string => {
  if (!parsed || typeof parsed !== 'object') return 'Unable to parse skills analysis.';
  
  let formatted = '';
  
  if (Array.isArray(parsed.technicalSkills) && parsed.technicalSkills.length > 0) {
    formatted += '🔧 **Technical Skills:**\n';
    parsed.technicalSkills.forEach((skill: Record<string, unknown>) => {
      formatted += `• ${skill.skill} (${skill.proficiencyLevel || 'N/A'})\n`;
      if (skill.description) formatted += `  - ${skill.description}\n`;
    });
    formatted += '\n';
  }
  
  if (Array.isArray(parsed.softSkills) && parsed.softSkills.length > 0) {
    formatted += '💡 **Soft Skills:**\n';
    parsed.softSkills.forEach((skill: Record<string, unknown>) => {
      formatted += `• ${skill.skill} (${skill.importance || 'N/A'})\n`;
      if (skill.description) formatted += `  - ${skill.description}\n`;
    });
    formatted += '\n';
  }
  
  if (Array.isArray(parsed.atsKeywords) && parsed.atsKeywords.length > 0) {
    formatted += '🎯 **ATS Keywords:**\n';
    parsed.atsKeywords.forEach((keyword: Record<string, unknown>) => {
      formatted += `• ${keyword.keyword} (${keyword.frequency || 'N/A'})\n`;
      if (keyword.context) formatted += `  - ${keyword.context}\n`;
    });
    formatted += '\n';
  }
  
  if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
    formatted += '💯 **Recommendations:**\n';
    parsed.recommendations.forEach((rec: Record<string, unknown>) => {
      formatted += `• ${rec.suggestion} (${rec.priority || 'N/A'})\n`;
      if (rec.reasoning) formatted += `  - ${rec.reasoning}\n`;
    });
    formatted += '\n';
  }
  
  if (parsed.summary && typeof parsed.summary === 'object') {
    const summary = parsed.summary as Record<string, unknown>;
    formatted += '📊 **Summary:**\n';
    formatted += `• Total Skills Found: ${summary.totalSkillsFound || 'N/A'}\n`;
    formatted += `• ATS Compatibility: ${summary.atsCompatibility || 'N/A'}\n`;
    if (summary.overallAssessment) {
      formatted += `• Assessment: ${summary.overallAssessment}\n`;
    }
  }
  
  return formatted || 'Skills analysis completed successfully.';
};

export default function ContentGenPage() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");
  const [activeType, setActiveType] = useState(contentTypes[0]);
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [history, setHistory] = useState<Array<{type: string, input: string, result: string, timestamp: Date}>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    if (!input.trim()) return;
    
    setBusy(true);
    setResult("");
    setFeedback(null);
    
    try {
      // Determine API endpoint based on content type
      let endpoint = '';
      const requestBody = { prompt: input };

      switch (activeType.id) {
        case 'cover-letter':
          endpoint = '/api/ai/content-gen/cover-letter';
          break;
        case 'linkedin':
          endpoint = '/api/ai/content-gen/linkedin-post';
          break;
        case 'job-description':
          endpoint = '/api/ai/content-gen/job-description';
          break;
        case 'skills-keywords':
          endpoint = '/api/ai/content-gen/skills-keywords';
          break;
        default:
          // Fallback to existing endpoints for other types
          endpoint = activeType.endpoint;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      let generatedResult = '';
      
      if (data.success && data.data) {
        if (activeType.id === 'skills-keywords' && data.data.parsedContent) {
          // Special handling for skills analysis
          const parsed = data.data.parsedContent;
          if (parsed.error) {
            generatedResult = data.data.content;
          } else {
            // Store as JSON string for ModernSkillsDisplay component
            generatedResult = JSON.stringify(parsed);
          }
        } else {
          generatedResult = data.data.content;
        }
      } else {
        throw new Error('Invalid response format');
      }
      
      setResult(generatedResult);
      
      // Add to history
      setHistory(prev => [{
        type: activeType.title,
        input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
        result: generatedResult,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]); // Keep last 5 items
      
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Generation failed:', error);
      setResult("Sorry, there was an error generating content. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const exportContent = () => {
    try {
      // Create a blob with the content
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeType.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const saveContent = () => {
    try {
      // Save to localStorage for now (can be enhanced to save to database)
      const savedItems = JSON.parse(localStorage.getItem('savedContent') || '[]');
      savedItems.push({
        id: Date.now(),
        type: activeType.title,
        content: result,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('savedContent', JSON.stringify(savedItems));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const shareContent = async () => {
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: activeType.title,
          text: result
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(result);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const regenerate = () => {
    if (input.trim()) {
      generate();
    }
  };

  const clearAll = () => {
    setInput("");
    setResult("");
    setFeedback(null);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <ParticleBackground />
      <FloatingOrbs />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl p-8 sm:p-12 shadow-2xl mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-orange-500/5 to-transparent" />
          
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-900 px-6 py-3 text-sm font-semibold text-neutral-300 shadow-lg mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5 text-pink-400" />
              </motion.div>
              AI Content Studio
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                Create Stunning Content
              </span>
              <br />
              <span className="text-white">
                with AI Magic ✨
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-3xl text-xl text-neutral-400 leading-relaxed mb-8"
            >
              Transform your ideas into professional content instantly. Generate summaries, cover letters, 
              LinkedIn posts, job descriptions, and more with our advanced AI technology.
            </motion.p>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <StatCard
                icon={Rocket}
                title="Generation Speed"
                value="3s"
                description="Average content creation time"
                delay={0.6}
              />
              <StatCard
                icon={Award}
                title="Content Quality"
                value="98%"
                description="User satisfaction rate"
                delay={0.7}
              />
              <StatCard
                icon={BarChart3}
                title="Success Rate"
                value="95%"
                description="Content approval rate"
                delay={0.8}
              />
              <StatCard
                icon={Globe}
                title="Languages"
                value="12+"
                description="Supported languages"
                delay={0.9}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Content Types Selection */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Content Type
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Select the type of content you want to create. Each template is optimized for specific use cases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + (index * 0.1) }}
              >
                <ContentTypeCard
                  type={type}
                  isActive={activeType.id === type.id}
                  onClick={() => {
                    setActiveType(type);
                    setResult("");
                    setFeedback(null);
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Main Generator Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          {/* Input Section */}
          <div className="xl:col-span-2">
            <HoverCard className="shadow-2xl border-neutral-800 hover:shadow-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${activeType.color} shadow-lg`}>
                    <activeType.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{activeType.title}</h3>
                    <p className="text-sm text-neutral-400 font-normal">{activeType.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-300">
                    Content Input
                  </label>
                  <textarea
                    rows={12}
                    placeholder={activeType.placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full p-4 rounded-xl border border-neutral-700 bg-neutral-800 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-neutral-300 placeholder-neutral-500 resize-none"
                  />
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>{input.length} characters</span>
                    <span>{input.split(/\s+/).filter(w => w.length > 0).length} words</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={generate}
                    disabled={busy || !input.trim()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r ${activeType.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5" />
                        Generate Content
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>

                  {result && (
                    <Button
                      onClick={regenerate}
                      disabled={busy}
                      variant="outline"
                      size="lg"
                      className="border-2 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </Button>
                  )}

                  <Button
                    onClick={clearAll}
                    variant="ghost"
                    size="lg"
                    className="text-neutral-400 hover:text-white"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </HoverCard>
          </div>

          {/* History & Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Recent History */}
            <HoverCard className="border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-neutral-400" />
                    Recent Generations
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-neutral-400 hover:text-white"
                    >
                      {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-3">
                      {history.length > 0 ? (
                        history.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-neutral-800 rounded-xl border border-neutral-700 cursor-pointer hover:bg-neutral-700/50 transition-colors"
                            onClick={() => {
                              setInput(item.input);
                              setResult(item.result);
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-pink-400">{item.type}</span>
                              <span className="text-xs text-neutral-500">
                                {item.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-300 truncate">{item.input}</p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent generations</p>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </HoverCard>

            {/* Tech Features */}
            <HoverCard className="border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Cpu className="h-5 w-5 text-pink-400" />
                  Powered by Advanced AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-400">
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Secure & Private Processing</span>
                </div>
                <div className="flex gap-2">
                  <Database className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Industry-Specific Knowledge</span>
                </div>
                <div className="flex gap-2">
                  <Cloud className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Cloud-Powered Analysis</span>
                </div>
                <div className="flex gap-2">
                  <Server className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>Real-Time Optimization</span>
                </div>
              </CardContent>
            </HoverCard>

            {/* Tips & Best Practices */}
            <HoverCard className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-yellow-400">
                  <Lightbulb className="h-5 w-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-yellow-300/80">
                <div className="flex gap-2">
                  <Star className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Be specific with your input for better results</span>
                </div>
                <div className="flex gap-2">
                  <Star className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Include quantifiable achievements when possible</span>
                </div>
                <div className="flex gap-2">
                  <Star className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Use action verbs and industry keywords</span>
                </div>
                <div className="flex gap-2">
                  <Star className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Review and customize the output</span>
                </div>
              </CardContent>
            </HoverCard>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mt-12"
            >
              <HoverCard className="border-green-500/30 bg-gradient-to-br from-neutral-900 to-green-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Generated Content</h3>
                        <p className="text-sm text-neutral-400 font-normal">Your AI-generated {activeType.title.toLowerCase()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex gap-1">
                        <Button
                          onClick={() => setFeedback("like")}
                          variant="ghost"
                          size="sm"
                          className={`${feedback === "like" ? "text-green-400" : "text-neutral-400"} hover:text-green-400`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setFeedback("dislike")}
                          variant="ghost"
                          size="sm"
                          className={`${feedback === "dislike" ? "text-red-400" : "text-neutral-400"} hover:text-red-400`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        size="sm"
                        className={copied 
                          ? "bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30" 
                          : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-300 hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-500/50"
                        }
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={exportContent}
                        variant="outline" 
                        size="sm" 
                        className={exported
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30"
                          : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-300 hover:from-blue-500/20 hover:to-cyan-500/20 hover:border-blue-500/50"
                        }
                      >
                        {exported ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Exported!
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={saveContent}
                        variant="outline" 
                        size="sm" 
                        className={saved
                          ? "bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30"
                          : "bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-purple-500/30 text-purple-300 hover:from-purple-500/20 hover:to-violet-500/20 hover:border-purple-500/50"
                        }
                      >
                        {saved ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={shareContent}
                        variant="outline" 
                        size="sm" 
                        className={shared
                          ? "bg-pink-500/20 border-pink-500/50 text-pink-300 hover:bg-pink-500/30"
                          : "bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/30 text-pink-300 hover:from-pink-500/20 hover:to-rose-500/20 hover:border-pink-500/50"
                        }
                      >
                        {shared ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Shared!
                          </>
                        ) : (
                          <>
                            <Share className="h-4 w-4 mr-1" />
                            Share
                          </>
                        )}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div className="bg-neutral-800/50 rounded-2xl border border-neutral-700 p-6 shadow-lg">
                      {(() => {
                        // Skills & Keywords - JSON parsed display
                        if (activeType.id === 'skills-keywords') {
                          try {
                            const parsedData = JSON.parse(result);
                            return <ModernSkillsDisplay data={parsedData} />;
                          } catch (e) {
                            return (
                              <div className="prose prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-neutral-200 leading-relaxed">
                                  {result}
                                </pre>
                              </div>
                            );
                          }
                        }
                        
                        // Professional Summary
                        if (activeType.id === 'summary') {
                          return <ModernSummaryDisplay content={result} />;
                        }
                        
                        // Achievement Bullets
                        if (activeType.id === 'bullets') {
                          return <ModernBulletsDisplay content={result} />;
                        }
                        
                        // Cover Letter
                        if (activeType.id === 'cover-letter') {
                          return <ModernCoverLetterDisplay content={result} />;
                        }
                        
                        // LinkedIn Post
                        if (activeType.id === 'linkedin-post') {
                          return <ModernLinkedInDisplay content={result} />;
                        }
                        
                        // Job Description
                        if (activeType.id === 'job-description') {
                          return <ModernJobDescriptionDisplay content={result} />;
                        }
                        
                        // Fallback for any other content types
                        return (
                          <div className="prose prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-neutral-200 leading-relaxed">
                              {result}
                            </pre>
                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Character and word count */}
                    <div className="flex justify-between text-sm text-neutral-500 mt-3">
                      <span>{result.length} characters</span>
                      <span>{result.split(/\s+/).filter(w => w.length > 0).length} words</span>
                    </div>

                    {/* Feedback confirmation */}
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                          feedback === "like" 
                            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {feedback === "like" ? "✓ Thanks for your positive feedback!" : "✓ We'll use your feedback to improve."}
                      </motion.div>
                    )}
                  </motion.div>
                </CardContent>
              </HoverCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-neutral-900/90 backdrop-blur-xl rounded-3xl p-8 border border-neutral-800 shadow-2xl"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r ${activeType.color} flex items-center justify-center mb-4`}
                  >
                    <Brain className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    AI is Creating Magic ✨
                  </h3>
                  <p className="text-neutral-400 mb-4">
                    Generating your {activeType.title.toLowerCase()}...
                  </p>
                  <div className="w-64 bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`bg-gradient-to-r ${activeType.color} h-full rounded-full`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
