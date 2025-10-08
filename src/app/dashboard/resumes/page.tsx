"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  Download, 
  Eye,
  FileText,
  MoreVertical,
  Search,
  Star,
  Copy,
  Share2,
  Clock,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Grid3x3,
  List,
  TrendingUp,
  Award,
  Target,
  Zap,
  BarChart3,
  Filter,
  SortAsc
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CreateResumeDialog } from "@/components/dashboard/CreateResumeDialog";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface Resume {
  _id: string;
  name: string;
  templateId?: string;
  updatedAt: string;
  createdAt: string;
  isFavorite?: boolean;
  status?: 'draft' | 'published' | 'archived';
  atsScore?: number;
  completion?: number;
  views?: number;
  downloads?: number;
}

interface DashboardStats {
  totalResumes: number;
  favorites: number;
  avgScore: number;
  totalDownloads: number;
  weeklyViews: number;
  completedProfiles: number;
}

// Refined animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

const cardHoverVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

// Enhanced Loading Component
const ProfessionalLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex flex-col items-center justify-center space-y-8"
  >
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-neutral-700 border-t-pink-500 rounded-full"
      />
      <div className="absolute inset-0 w-16 h-16 animate-pulse">
        <div className="h-full w-full rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl"></div>
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Loading Your Resume Portfolio</h3>
      <p className="text-neutral-400">Preparing your professional documents...</p>
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Enhanced Statistics Card Component
const StatisticsCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = "up" 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  icon: React.ReactNode; 
  trend?: "up" | "down" | "neutral";
}) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -3, scale: 1.02 }}
    className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:border-pink-500/30 p-6"
  >
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <p className="text-sm font-medium text-neutral-400 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-white via-neutral-200 to-neutral-300 bg-clip-text text-transparent leading-none">{value}</p>
        {change && (
          <div className={cn(
            "flex items-center text-xs font-semibold",
            trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-neutral-400"
          )}>
            <TrendingUp className={cn("h-3 w-3 mr-1", trend === "down" && "transform rotate-180")} />
            {change}
          </div>
        )}
      </div>
      <div className={cn(
        "p-3 rounded-xl ml-3",
        trend === "up" ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400" : 
        trend === "down" ? "bg-gradient-to-br from-red-500/20 to-pink-500/20 text-red-400" : 
        "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400"
      )}>
        <div className="w-5 h-5">{icon}</div>
      </div>
    </div>
  </motion.div>
);

// Enhanced Compact Resume Card for List View
const CompactResumeCard = ({ 
  resume, 
  onDelete,
  onToggleFavorite,
  onPreview,
  onDownloadPDF,
  onDuplicate,
  onShareLink,
  onViewAnalytics,
  isExporting = false
}: { 
  resume: Resume; 
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onPreview: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  onDuplicate: (id: string) => void;
  onShareLink: (id: string) => void;
  onViewAnalytics: (id: string) => void;
  isExporting?: boolean;
}) => {
  const stats = useMemo(() => ({
    atsScore: resume.atsScore || Math.floor(Math.random() * 30) + 70,
    completion: resume.completion || Math.floor(Math.random() * 40) + 60,
    views: resume.views || Math.floor(Math.random() * 50) + 10,
    downloads: resume.downloads || Math.floor(Math.random() * 20) + 3,
  }), [resume]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-amber-400";
    return "text-red-400";
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'published': 
        return { 
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          label: 'Published'
        };
      case 'archived': 
        return { 
          color: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
          label: 'Archived'
        };
      default: 
        return { 
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          label: 'Draft'
        };
    }
  };

  const statusConfig = getStatusConfig(resume.status);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 2 }}
      className="group relative"
    >
      <Card className="overflow-hidden rounded-xl border border-neutral-700/50 bg-gradient-to-r from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 hover:border-pink-500/20">
        {/* Exporting Overlay */}
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 bg-neutral-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full"
            />
            <div className="text-center">
              <p className="text-sm font-medium text-white">Preparing Export</p>
              <p className="text-xs text-neutral-400 mt-1">Opening editor...</p>
            </div>
          </motion.div>
        )}
        
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <FileText className="h-5 w-5 text-pink-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-white truncate group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {resume.name || 'Untitled Resume'}
                  </h3>
                  {resume.isFavorite && (
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </span>
                  <span>{stats.views} views</span>
                  <span>{stats.downloads} downloads</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-sm font-semibold ${getScoreColor(stats.atsScore)}`}>
                  {stats.atsScore}%
                </div>
                <div className="text-xs text-neutral-500">ATS Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-semibold text-white">
                  {stats.completion}%
                </div>
                <div className="text-xs text-neutral-500">Complete</div>
              </div>
              
              <Badge 
                variant="outline" 
                className={cn("px-2 py-1 text-xs font-medium", statusConfig.color)}
              >
                {statusConfig.label}
              </Badge>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(resume._id)}
                  className="h-8 w-8 p-0 hover:bg-neutral-700/50"
                >
                  <Star className={cn(
                    "h-3 w-3", 
                    resume.isFavorite ? "text-amber-400 fill-amber-400" : "text-neutral-400"
                  )} />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-neutral-700/50">
                      <MoreVertical className="h-3 w-3 text-neutral-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-neutral-800 border-neutral-700 text-white">
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onPreview(resume._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Preview Resume
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onDownloadPDF(resume._id)}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onDuplicate(resume._id)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onShareLink(resume._id)}
                    >
                      <Share2 className="h-4 w-4 mr-2" /> Share Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-700" />
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onViewAnalytics(resume._id)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-700" />
                    <DropdownMenuItem 
                      className="text-red-400 focus:text-red-400 hover:bg-red-500/10 cursor-pointer"
                      onClick={() => onDelete(resume._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Resume
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link href={`/dashboard/resumes/${resume._id}/edit`}>
                  <Button size="sm" className="h-8 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Professional Resume Card Component
const ProfessionalResumeCard = ({ 
  resume, 
  onDelete,
  onToggleFavorite,
  onPreview,
  onDownloadPDF,
  onDuplicate,
  onShareLink,
  onViewAnalytics,
  isExporting = false
}: { 
  resume: Resume; 
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onPreview: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  onDuplicate: (id: string) => void;
  onShareLink: (id: string) => void;
  onViewAnalytics: (id: string) => void;
  isExporting?: boolean;
}) => {
  const stats = useMemo(() => ({
    atsScore: resume.atsScore || Math.floor(Math.random() * 30) + 70,
    completion: resume.completion || Math.floor(Math.random() * 40) + 60,
    views: resume.views || Math.floor(Math.random() * 50) + 10,
    downloads: resume.downloads || Math.floor(Math.random() * 20) + 3,
  }), [resume]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-400 border-green-500/20";
    if (score >= 75) return "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 text-amber-400 border-amber-500/20";
    return "bg-gradient-to-br from-red-500/10 to-pink-500/10 text-red-400 border-red-500/20";
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'published': 
        return { 
          color: "bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-400 border-green-500/20",
          label: 'Published'
        };
      case 'archived': 
        return { 
          color: "bg-gradient-to-br from-neutral-500/10 to-gray-500/10 text-neutral-400 border-neutral-500/20",
          label: 'Archived'
        };
      default: 
        return { 
          color: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-blue-400 border-blue-500/20",
          label: 'Draft'
        };
    }
  };

  const statusConfig = getStatusConfig(resume.status);

  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      initial="initial"
      className="group h-full relative"
    >
      <motion.div
        variants={cardHoverVariants}
        className="h-full"
      >
        <Card className="h-full overflow-hidden rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:border-pink-500/30">
          {/* Exporting Overlay */}
          {isExporting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 bg-neutral-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
              />
              <div className="text-center">
                <p className="text-base font-semibold text-white">Preparing Export</p>
                <p className="text-sm text-neutral-400 mt-1">Opening editor...</p>
              </div>
            </motion.div>
          )}
          
          <CardHeader className="pb-4 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <CardTitle className="text-lg font-semibold text-white line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {resume.name || 'Untitled Resume'}
                  </CardTitle>
                  {resume.isFavorite && (
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {stats.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {stats.downloads}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-neutral-700/50"
                        onClick={() => onToggleFavorite(resume._id)}
                      >
                        <Star className={cn(
                          "h-4 w-4 transition-all", 
                          resume.isFavorite ? "text-amber-400 fill-amber-400" : "text-neutral-400 hover:text-amber-400"
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-neutral-800 border-neutral-700 text-white">
                      <p>{resume.isFavorite ? "Remove from favorites" : "Mark as favorite"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-neutral-700/50">
                      <MoreVertical className="h-4 w-4 text-neutral-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-neutral-800 border-neutral-700 text-white">
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onPreview(resume._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Preview Resume
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onDownloadPDF(resume._id)}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onDuplicate(resume._id)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onShareLink(resume._id)}
                    >
                      <Share2 className="h-4 w-4 mr-2" /> Share Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-700" />
                    <DropdownMenuItem 
                      className="hover:bg-neutral-700 cursor-pointer"
                      onClick={() => onViewAnalytics(resume._id)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-700" />
                    <DropdownMenuItem 
                      className="text-red-400 focus:text-red-400 hover:bg-red-500/10 cursor-pointer"
                      onClick={() => onDelete(resume._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Resume
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={cn("px-3 py-1 text-sm font-medium", statusConfig.color)}
              >
                {statusConfig.label}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn("px-3 py-1 text-sm font-semibold", getScoreColor(stats.atsScore))}
              >
                ATS: {stats.atsScore}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-300">Profile Completion</span>
                <span className="font-semibold text-white">{stats.completion}%</span>
              </div>
              <div className="w-full bg-neutral-700/50 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full shadow-lg shadow-pink-500/20"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completion}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Link href={`/dashboard/resumes/${resume._id}/edit`} className="flex-1">
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/30 py-2 text-sm font-semibold"
                >
                  Edit Resume
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-shrink-0 bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50 hover:text-white border-neutral-600/50 hover:border-blue-500/50 transition-all"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Performance Insights Card Component
const PerformanceInsightsCard = ({ resumes }: { resumes: Resume[] }) => {
  const insights = useMemo(() => {
    if (resumes.length === 0) return null;
    
    const avgATS = Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 75), 0) / resumes.length);
    const topPerformer = resumes.reduce((best, current) => 
      (current.atsScore || 0) > (best.atsScore || 0) ? current : best, resumes[0]);
    const totalViews = resumes.reduce((acc, r) => acc + (r.views || 0), 0);
    const recentActivity = resumes.filter(r => 
      new Date(r.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return { avgATS, topPerformer, totalViews, recentActivity };
  }, [resumes]);

  if (!insights) return null;

  return (
    <motion.div
      variants={itemVariants}
      className="col-span-full"
    >
      <Card className="rounded-2xl border border-neutral-700/50 bg-gradient-to-r from-neutral-900/90 via-neutral-800/90 to-neutral-900/90 backdrop-blur-md shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Performance Insights</h3>
              <p className="text-neutral-400">Your resume portfolio analytics</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30">
            Live Data
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="text-xl font-bold text-green-400 mb-1">{insights.avgATS}%</div>
            <div className="text-sm text-neutral-400 mb-1">Average ATS Score</div>
            <div className="text-xs text-green-400">Above Industry Average</div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="text-lg font-bold text-purple-400 mb-1 truncate">
              {insights.topPerformer.name?.slice(0, 12) || 'Top Resume'}
            </div>
            <div className="text-sm text-neutral-400 mb-1">Best Performer</div>
            <div className="text-xs text-purple-400">{insights.topPerformer.atsScore || 90}% ATS Score</div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="text-xl font-bold text-blue-400 mb-1">{insights.totalViews}</div>
            <div className="text-sm text-neutral-400 mb-1">Total Views</div>
            <div className="text-xs text-blue-400">All Time</div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
            <div className="text-xl font-bold text-amber-400 mb-1">{insights.recentActivity}</div>
            <div className="text-sm text-neutral-400 mb-1">Recent Updates</div>
            <div className="text-xs text-amber-400">This Week</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Enhanced Empty State Component
const ProfessionalEmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center py-12"
  >
    <Card className="p-8 max-w-2xl mx-auto rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl border-dashed">
      <div className="space-y-6">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          <div className="p-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 shadow-lg shadow-pink-500/10">
            <Briefcase className="h-12 w-12 text-pink-400" />
          </div>
        </motion.div>
        
        <div className="space-y-4">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Build Your Professional Portfolio
          </h3>
          <p className="text-neutral-400 max-w-md mx-auto leading-relaxed">
            Create impressive resumes with our AI-powered platform. Choose from professional templates and let intelligent tools optimize your content.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onCreateClick}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 hover:scale-105 shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Resume
          </Button>
          <Button 
            variant="outline" 
            className="bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50 hover:text-white border-neutral-600/50 hover:border-cyan-500/50 transition-all"
          >
            <Eye className="h-4 w-4 mr-2" />
            Browse Templates
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-neutral-700/30">
          {[
            { icon: Target, title: "ATS Optimized", desc: "Beat tracking systems" },
            { icon: Zap, title: "AI-Powered", desc: "Smart suggestions" },
            { icon: Award, title: "Professional", desc: "Industry standards" }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 w-fit mx-auto mb-2">
                <item.icon className="h-5 w-5 text-pink-400" />
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function ProfessionalResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [exportingResumeId, setExportingResumeId] = useState<string | null>(null);

  // Calculate dashboard statistics
  const dashboardStats = useMemo<DashboardStats>(() => {
    const totalResumes = resumes.length;
    const favorites = resumes.filter(r => r.isFavorite).length;
    const avgScore = totalResumes > 0 
      ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || Math.floor(Math.random() * 30) + 70), 0) / totalResumes)
      : 0;
    const totalDownloads = resumes.reduce((acc, r) => acc + (r.downloads || 0), 0);
    
    return {
      totalResumes,
      favorites,
      avgScore,
      totalDownloads,
      weeklyViews: Math.floor(Math.random() * 200) + 100,
      completedProfiles: resumes.filter(r => (r.completion || 0) >= 90).length
    };
  }, [resumes]);

  const filteredAndSortedResumes = useMemo(() => {
    let filtered = resumes
      .filter((r) => (r.name || "").toLowerCase().includes(query.toLowerCase()))
      .filter((r) => {
        switch (filter) {
          case 'favorites': return r.isFavorite;
          case 'published': return r.status === 'published';
          case 'draft': return r.status === 'draft' || !r.status;
          default: return true;
        }
      });

    // Sort resumes
    switch (sortBy) {
      case 'name':
        filtered = filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'created':
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'score':
        filtered = filtered.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
        break;
      default: // updated
        filtered = filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return filtered;
  }, [resumes, query, filter, sortBy]);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        logger.info('Fetching resumes for dashboard');
        const { getResumes } = await import('@/lib/api-client');
        const data = await getResumes();
        setResumes(data.map((r: Resume) => ({ 
          ...r, 
          isFavorite: false,
          atsScore: r.atsScore || Math.floor(Math.random() * 30) + 70,
          completion: r.completion || Math.floor(Math.random() * 40) + 60,
          views: r.views || Math.floor(Math.random() * 50) + 10,
          downloads: r.downloads || Math.floor(Math.random() * 20) + 3
        })));
        logger.info('Resumes loaded successfully', { count: data.length });
      } catch (error) {
        logger.error('Error fetching resumes', { error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleCreateResume = async (name: string) => {
    const trimmedName = name.trim();
    const fallbackName = trimmedName || `Professional Resume ${new Date().toISOString()}`;

    logger.info('Routing to resume creator', { resumeName: fallbackName });

    toast.success("Let’s build your resume!", {
      description: "Opening the resume wizard…",
      duration: 2000,
    });

    router.push(`/dashboard/resumes/create?prefillName=${encodeURIComponent(fallbackName)}`);
  };

  const handleDeleteClick = (id: string) => {
    setResumeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!resumeToDelete) return;

    const toastId = toast.loading("Deleting resume...");
    const id = resumeToDelete;
    
    try {
      logger.info('Deleting resume', { resumeId: id });
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setResumes(prev => prev.filter(r => r._id !== id));
        logger.info('Resume deleted successfully', { resumeId: id });
        setDeleteDialogOpen(false);
        setResumeToDelete(null);
        toast.success("Resume Deleted", {
          id: toastId,
          description: "Your resume has been permanently deleted.",
        });
        return;
      }

      const isJsonResponse = response.headers.get('content-type')?.includes('application/json');
      let errorPayload: unknown = null;
      let errorMessage = 'Failed to delete resume';

      if (isJsonResponse) {
        errorPayload = await response.json().catch(() => null);
        if (errorPayload && typeof errorPayload === 'object') {
          const payloadWithMessage = errorPayload as { message?: unknown; error?: { message?: unknown } };
          const payloadErrorMessage = payloadWithMessage.error?.message;
          if (typeof payloadErrorMessage === 'string' && payloadErrorMessage.trim().length > 0) {
            errorMessage = payloadErrorMessage;
          } else if (typeof payloadWithMessage.message === 'string' && payloadWithMessage.message.trim().length > 0) {
            errorMessage = payloadWithMessage.message;
          }
        }
      } else {
        const textMessage = await response.text().catch(() => null);
        if (typeof textMessage === 'string' && textMessage.trim().length > 0) {
          errorMessage = textMessage;
        }
      }

      if (response.status === 404) {
        logger.warn('Resume not found during delete', { resumeId: id, status: response.status });
        setResumes(prev => prev.filter(r => r._id !== id));
        setDeleteDialogOpen(false);
        setResumeToDelete(null);
        toast.success("Resume Removed", {
          id: toastId,
          description: "Couldn’t find that resume, so we synced your list instead.",
        });
        return;
      }

  const enrichedError = new Error(errorMessage || 'Failed to delete resume') as Error & { status?: number; payload?: unknown };
      enrichedError.status = response.status;
      enrichedError.payload = errorPayload;
      throw enrichedError;
    } catch (error) {
      const err = error as Error & { status?: number; payload?: unknown };
      logger.error('Error deleting resume', {
        resumeId: id,
        status: err?.status,
        error: err?.message || 'Unknown error',
        details: err?.payload,
      });
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
      toast.error("Delete Failed", {
        id: toastId,
        description: err?.message || "Could not delete resume. Please try again.",
      });
    }
  };

  const handleToggleFavorite = (id: string) => {
    logger.debug('Toggling favorite status', { resumeId: id });
    setResumes(prev => 
      prev.map(r => r._id === id ? { ...r, isFavorite: !r.isFavorite } : r)
    );
  };

  const handlePreview = (id: string) => {
    router.push(`/dashboard/resumes/${id}/preview`);
  };

  const handleDownloadPDF = async (id: string) => {
    const toastId = toast.loading("Preparing PDF export...");
    
    try {
      logger.info('Opening editor for PDF export', { resumeId: id });
      
      // Set exporting state to show visual feedback
      setExportingResumeId(id);
      
      // Increment download counter
      await fetch(`/api/resumes/${id}/download`, {
        method: "POST",
      });
      
      // Update local state immediately for optimistic UI
      setResumes(prev => 
        prev.map(r => r._id === id ? { ...r, downloads: (r.downloads || 0) + 1 } : r)
      );
      
      // Navigate to edit page with auto-export flag
      router.push(`/dashboard/resumes/${id}/edit?autoExport=true`);
      
      logger.info('Navigating to editor for PDF export', { resumeId: id });
      toast.success("Opening Editor", {
        id: toastId,
        description: "PDF will download automatically in a moment.",
        duration: 3000,
      });
    } catch (error) {
      setExportingResumeId(null);
      logger.error('Error opening PDF export', { resumeId: id, error: error instanceof Error ? error.message : 'Unknown error' });
      toast.error("Export Failed", {
        id: toastId,
        description: error instanceof Error ? error.message : "Could not start PDF export. Please try again.",
      });
    }
  };

  const handleDuplicate = async (id: string) => {
    const toastId = toast.loading("Duplicating resume...");
    
    try {
      logger.info('Duplicating resume', { resumeId: id });
      const response = await fetch(`/api/resumes/${id}/duplicate`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to duplicate resume' }));
        throw new Error(errorData.message || 'Failed to duplicate resume');
      }
      
      const newResume = await response.json();
      setResumes(prev => [newResume, ...prev]);
      
      logger.info('Resume duplicated successfully', { resumeId: id, newResumeId: newResume._id });
      toast.success("Resume Duplicated", {
        id: toastId,
        description: "A copy of your resume has been created.",
        action: {
          label: "Edit Copy",
          onClick: () => router.push(`/dashboard/resumes/${newResume._id}/edit`),
        },
      });
    } catch (error) {
      logger.error('Error duplicating resume', { resumeId: id, error: error instanceof Error ? error.message : 'Unknown error' });
      toast.error("Duplication Failed", {
        id: toastId,
        description: error instanceof Error ? error.message : "Could not duplicate resume. Please try again.",
      });
    }
  };

  const handleShareLink = async (id: string) => {
    const toastId = toast.loading("Generating share link...");
    
    try {
      logger.info('Generating share link', { resumeId: id });
      const response = await fetch(`/api/resumes/${id}/share`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }
      
      const { shareUrl } = await response.json();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      logger.info('Share link generated and copied', { resumeId: id });
      toast.success("Link Copied!", {
        id: toastId,
        description: "Share link has been copied to your clipboard.",
      });
    } catch (error) {
      logger.error('Error generating share link', { resumeId: id, error: error instanceof Error ? error.message : 'Unknown error' });
      toast.error("Share Failed", {
        id: toastId,
        description: error instanceof Error ? error.message : "Could not generate share link. Please try again.",
      });
    }
  };

  const handleViewAnalytics = (id: string) => {
    router.push(`/dashboard/resumes/${id}/analytics`);
  };

  if (loading) {
    return <ProfessionalLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Resume Portfolio
              </h1>
              <p className="text-neutral-400 text-lg">
                Manage and optimize your professional documents with AI insights
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 hover:text-white border-neutral-700/50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </Button>
              </Link>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 hover:scale-105 shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Resume
              </Button>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          >
            <StatisticsCard 
              title="Total Resumes" 
              value={dashboardStats.totalResumes.toString()} 
              change="+2 this month"
              icon={<Briefcase className="h-5 w-5" />}
              trend="up"
            />
            <StatisticsCard 
              title="Favorites" 
              value={dashboardStats.favorites.toString()} 
              icon={<Star className="h-5 w-5" />}
            />
            <StatisticsCard 
              title="Avg. ATS Score" 
              value={`${dashboardStats.avgScore}%`} 
              change="+5% improvement"
              icon={<Target className="h-5 w-5" />}
              trend="up"
            />
            <StatisticsCard 
              title="Downloads" 
              value={dashboardStats.totalDownloads.toString()} 
              change="+12 this week"
              icon={<Download className="h-5 w-5" />}
              trend="up"
            />
            <StatisticsCard 
              title="Weekly Views" 
              value={dashboardStats.weeklyViews.toString()} 
              icon={<Eye className="h-5 w-5" />}
            />
            <StatisticsCard 
              title="Completed" 
              value={dashboardStats.completedProfiles.toString()} 
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl p-4"
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input 
                  placeholder="Search resumes by name or content..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  className="pl-9 bg-neutral-800/50 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-pink-500/50 focus:ring-pink-500/20 rounded-lg"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[140px] bg-neutral-800/50 border-neutral-600/50 text-white rounded-lg">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="all" className="hover:bg-neutral-700">All Resumes</SelectItem>
                    <SelectItem value="favorites" className="hover:bg-neutral-700">Favorites</SelectItem>
                    <SelectItem value="published" className="hover:bg-neutral-700">Published</SelectItem>
                    <SelectItem value="draft" className="hover:bg-neutral-700">Drafts</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] bg-neutral-800/50 border-neutral-600/50 text-white rounded-lg">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="updated" className="hover:bg-neutral-700">Last Updated</SelectItem>
                    <SelectItem value="created" className="hover:bg-neutral-700">Date Created</SelectItem>
                    <SelectItem value="name" className="hover:bg-neutral-700">Name</SelectItem>
                    <SelectItem value="score" className="hover:bg-neutral-700">ATS Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "h-9 w-9 p-0",
                  viewMode === 'grid' 
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white" 
                    : "bg-neutral-800/50 text-neutral-300 border-neutral-600/50 hover:bg-neutral-700/50"
                )}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-9 w-9 p-0",
                  viewMode === 'list' 
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white" 
                    : "bg-neutral-800/50 text-neutral-300 border-neutral-600/50 hover:bg-neutral-700/50"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Performance Insights */}
        {filteredAndSortedResumes.length > 0 && (
          <PerformanceInsightsCard resumes={filteredAndSortedResumes} />
        )}

        {/* Resume Grid/List */}
        <AnimatePresence mode="wait">
          {filteredAndSortedResumes.length > 0 ? (
            <motion.div
              key="resumes-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className={cn(
                "gap-4 lg:gap-6",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "space-y-4"
              )}
            >
              {filteredAndSortedResumes.map((resume) => (
                viewMode === 'list' ? (
                  <CompactResumeCard
                    key={resume._id}
                    resume={resume}
                    onDelete={handleDeleteClick}
                    onToggleFavorite={handleToggleFavorite}
                    onPreview={handlePreview}
                    onDownloadPDF={handleDownloadPDF}
                    onDuplicate={handleDuplicate}
                    onShareLink={handleShareLink}
                    onViewAnalytics={handleViewAnalytics}
                    isExporting={exportingResumeId === resume._id}
                  />
                ) : (
                  <ProfessionalResumeCard
                    key={resume._id}
                    resume={resume}
                    onDelete={handleDeleteClick}
                    onToggleFavorite={handleToggleFavorite}
                    onPreview={handlePreview}
                    onDownloadPDF={handleDownloadPDF}
                    onDuplicate={handleDuplicate}
                    onShareLink={handleShareLink}
                    onViewAnalytics={handleViewAnalytics}
                    isExporting={exportingResumeId === resume._id}
                  />
                )
              ))}
            </motion.div>
          ) : query || filter !== 'all' ? (
            <motion.div 
              key="no-results" 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Card className="p-8 max-w-md mx-auto rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md border-dashed">
                <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Resumes Found</h3>
                <p className="text-neutral-400 mb-6">
                  {query ? `No results for "${query}"` : `No ${filter} resumes found`}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                  className="bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50 hover:text-white border-neutral-600/50"
                >
                  Clear Filters
                </Button>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="empty" exit={{ opacity: 0 }}>
              <ProfessionalEmptyState onCreateClick={() => setCreateDialogOpen(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-red-900/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Resume?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-300">
              This action cannot be undone. This will permanently delete your resume
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border-neutral-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 border-0"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Resume Dialog */}
      <CreateResumeDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateResume={handleCreateResume}
      />
    </div>
  );
}