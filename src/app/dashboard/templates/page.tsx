"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/modern/page-header";
import { AnimatedCard } from "@/components/ui/modern/animated-card";

// Using shared modern components (PageHeader, AnimatedCard)

const LoadingSpinner = ({
  size = "md",
  variant = "spin",
}: {
  size?: "sm" | "md" | "lg";
  variant?: "spin" | "pulse";
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center"
    >
      {variant === "pulse" ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`rounded-full bg-gradient-to-r from-pink-400 to-purple-600 ${sizeClasses[size]}`}
        />
      ) : (
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-400 ${sizeClasses[size]}`}
        />
      )}
    </motion.div>
  );
};

const LivePreview = ({
  template,
  onClose,
  onUseTemplate,
}: {
  template: Template;
  onClose: () => void;
  onUseTemplate: (id: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 300 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="fixed right-0 top-0 bottom-0 w-1/2 bg-gradient-to-br from-neutral-900/95 to-neutral-800/95 backdrop-blur-xl border-l border-neutral-700/50 shadow-2xl z-50"
  >
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-neutral-700/50 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white capitalize">
              {template.name}
            </h2>
            <p className="text-neutral-300 mt-1">
              {template.description || "Professional resume template"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Template Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < (template.popularity ?? 4)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-neutral-500"
                }`}
              />
            ))}
            <span className="text-sm text-neutral-300 ml-2">
              {template.popularity ?? 4}/5
            </span>
          </div>
          <Badge
            variant="secondary"
            className="bg-neutral-700/50 text-neutral-200 border-neutral-600"
          >
            {template.category || "Professional"}
          </Badge>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Large Preview Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative aspect-[8.5/11] bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-xl overflow-hidden shadow-2xl"
          >
            <Image
              src={template.thumbnail}
              alt={`${template.name} preview`}
              fill
              quality={85}
              sizes="50vw"
              className="object-cover"
            />
          </motion.div>

          {/* Template Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="bg-neutral-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-2">
                Template Features
              </h3>
              <ul className="space-y-2 text-neutral-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Professional design with modern typography
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  ATS-friendly format for better visibility
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  Customizable sections and color schemes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Perfect for {template.category || "professional"} roles
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-neutral-700/50 bg-gradient-to-r from-neutral-900/80 to-neutral-800/80">
        <div className="flex gap-3">
          <Button
            onClick={() => onUseTemplate(template._id)}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-lg"
            size="lg"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Use This Template
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-neutral-800/50 border-neutral-600 text-neutral-200 hover:bg-neutral-700/50"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Search,
  Filter,
  Eye,
  ArrowRight,
  Grid,
  List,
  X,
  Sparkles,
  Download,
} from "lucide-react";
import { Template } from "@/lib/types";

// Stable, module-scoped allowlist of template IDs
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
  "rhyhorn",
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const TemplateCard = ({
  template,
  viewMode,
  onSelect,
  onPreview,
  index = 0,
}: {
  template: Template;
  viewMode: "grid" | "list";
  onSelect: (id: string) => void;
  onPreview: (template: Template) => void;
  index?: number;
}) => {
  if (viewMode === "list") {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ x: 4, scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900/95 via-neutral-800/95 to-neutral-900/95 border border-neutral-700/50 shadow-xl backdrop-blur-xl group hover:shadow-2xl hover:shadow-pink-500/10 hover:border-pink-500/30 transition-all duration-500">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex flex-row">
            {/* Image Container */}
            <div className="relative w-64 h-48 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden flex-shrink-0">
              <Image
                src={template.thumbnail}
                alt={`${template.name} template thumbnail`}
                fill
                quality={75}
                loading={index < 3 ? "eager" : "lazy"}
                priority={index < 3}
                sizes="256px"
                className="object-cover object-top transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-900/20 to-neutral-900 opacity-60" />

              {/* Hover Preview Button */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="shadow-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(template);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </motion.div>

              {/* Badges */}
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-gradient-to-r from-pink-500/90 to-orange-500/90 backdrop-blur-md text-white border-0 shadow-lg px-3 py-1 text-xs font-semibold"
              >
                {template.category || "Professional"}
              </Badge>

              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">
                  {template.popularity ?? 4.5}
                </span>
              </div>
            </div>

            {/* Content Container */}
            <div className="relative flex flex-col flex-1 p-6 justify-between min-w-0">
              <div className="space-y-3 flex-1">
                {/* Title */}
                <h3 className="text-2xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-orange-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {template.name}
                </h3>

                {/* Description */}
                <p className="text-neutral-400 leading-relaxed line-clamp-2 group-hover:text-neutral-300 transition-colors">
                  {template.description ||
                    "Professional resume template designed to showcase your skills and experience with modern styling."}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (template.popularity ?? 4)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-neutral-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-400 font-medium">
                      {template.popularity ?? 4}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                    <span className="text-sm">ATS Friendly</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                    <span className="text-sm">Modern Design</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="self-end mt-4"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 via-pink-500 to-orange-500 hover:from-pink-700 hover:via-pink-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 group/btn"
                  onClick={() => onSelect(template._id)}
                >
                  <span>Use This Template</span>
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <div className="relative h-full flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900/95 via-neutral-800/95 to-neutral-900/95 border border-neutral-700/50 shadow-2xl backdrop-blur-xl group hover:shadow-pink-500/20 hover:border-pink-500/30 transition-all duration-500">
        {/* Gradient Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Image Container */}
        <div className="relative">
          <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden">
            <Image
              src={template.thumbnail}
              alt={`${template.name} template thumbnail`}
              fill
              quality={75}
              loading={index < 4 ? "eager" : "lazy"}
              priority={index < 4}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-top transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent opacity-60" />

            {/* Hover Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100"
            >
              <Button
                size="lg"
                variant="secondary"
                className="shadow-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(template);
                }}
              >
                <Eye className="h-5 w-5 mr-2" />
                Quick Preview
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="shadow-lg text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </motion.div>

            {/* Category Badge */}
            <Badge
              variant="secondary"
              className="absolute top-4 right-4 bg-gradient-to-r from-pink-500/90 to-orange-500/90 backdrop-blur-md text-white border-0 shadow-lg px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            >
              {template.category || "Professional"}
            </Badge>

            {/* Popularity Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-white">
                {template.popularity ?? 4.5}
              </span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative p-6 flex-1 flex flex-col gap-4 bg-gradient-to-b from-transparent to-neutral-900/50">
          <div className="flex-1 space-y-3">
            {/* Title */}
            <h3 className="text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-orange-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              {template.name}
            </h3>

            {/* Description */}
            <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2 group-hover:text-neutral-300 transition-colors">
              {template.description ||
                "Professional resume template designed to showcase your skills and experience."}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 transition-all ${
                        i < (template.popularity ?? 4)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-neutral-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  ({template.popularity ?? 4.5})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-500">
                <div className="w-1 h-1 rounded-full bg-neutral-600" />
                <span className="text-xs">ATS Friendly</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              className="w-full bg-gradient-to-r from-pink-600 via-pink-500 to-orange-500 hover:from-pink-700 hover:via-pink-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 group/btn py-6"
              onClick={() => onSelect(template._id)}
            >
              <span className="text-sm">Use This Template</span>
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function TemplateGalleryPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { getTemplates } = await import("@/lib/api-client");
        const data: Template[] = await getTemplates();
        const updatedData = data.map((template) => ({
          ...template,
          thumbnail: template.thumbnail
            .replace(/\\/g, "/")
            .replace(/^\/*/, "/")
            .replace(/\/jpg\//, "/webp/")
            .replace(/\.jpg$/, ".webp"),
        }));
        const allow = new Set<string>(Array.from(allowedTemplateIds));
        const filteredToAllowed = updatedData
          .filter((t) => allow.has((t._id || "").toLowerCase()))
          .map((t) => ({ ...t, category: t.category || "professional" }));
        setTemplates(filteredToAllowed);
        setFilteredTemplates(filteredToAllowed);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (template.description &&
            template.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory
      );
    }

    switch (sortBy) {
      case "popular":
        filtered = [...filtered].sort(
          (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
        );
        break;
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      default:
        break;
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedCategory, sortBy, templates]);

  const categories = ((): string[] => {
    const set = new Set<string>();
    templates.forEach((t) => set.add(t.category || "professional"));
    return ["all", ...Array.from(set)];
  })();

  const handleUseTemplate = (templateId: string) => {
    router.push(`/dashboard/resumes/create?templateId=${templateId}`);
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("popular");
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] space-y-4"
      >
        <LoadingSpinner variant="pulse" size="lg" />
        <p className="text-neutral-300 font-medium">
          Loading premium templates...
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="text-red-500 text-lg font-medium mb-4">
          Error: {error}
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`flex-1 space-y-8 transition-all duration-500 ${
          showPreview ? "xl:pr-8" : ""
        }`}
      >
        {/* Modern Header */}
        <PageHeader
          title="Template Gallery"
          description="Choose from our collection of expertly designed resume templates that help you stand out and get noticed by hiring managers."
          badge="Professional Templates"
          gradient
        >
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Browse All
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-neutral-900/60 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 backdrop-blur-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Free Templates
            </Button>
          </div>
        </PageHeader>

        {/* Enhanced Filters */}
        <motion.div variants={itemVariants}>
          <AnimatedCard variant="glass" className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search templates by name or style..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-neutral-900/60 border border-neutral-700 text-white placeholder-neutral-400"
                />
              </div>

              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-neutral-400" />
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[140px] bg-neutral-900/60 border border-neutral-700 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="capitalize"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] bg-neutral-900/60 border border-neutral-700 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="name">Alphabetical</SelectItem>
                    <SelectItem value="newest">Recently Added</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg p-1 bg-neutral-900/60 border-neutral-700">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {(searchTerm || selectedCategory !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-neutral-300 hover:text-white"
                  >
                    Clear
                    <X className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  className="cursor-pointer capitalize px-3 py-1 hover:bg-neutral-800 border-neutral-700 text-neutral-300 transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Results Count */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center">
            <p className="text-neutral-400 font-medium">
              {filteredTemplates.length}{" "}
              {filteredTemplates.length === 1 ? "template" : "templates"}{" "}
              available
            </p>
            {filteredTemplates.length > 0 && (
              <p className="text-sm text-neutral-500">
                Click any template to get started
              </p>
            )}
          </div>
        </motion.div>

        {/* Templates Grid/List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchTerm}-${selectedCategory}-${viewMode}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
            }
          >
            {filteredTemplates.map((template, idx) => (
              <TemplateCard
                key={template._id}
                template={template}
                viewMode={viewMode}
                onSelect={handleUseTemplate}
                onPreview={handlePreview}
                index={idx}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredTemplates.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <AnimatedCard variant="glass" className="p-8 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  No templates found
                </h3>
                <p className="text-neutral-300">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Button onClick={clearFilters} className="mt-4">
                  Clear All Filters
                </Button>
              </div>
            </AnimatedCard>
          </motion.div>
        )}
      </motion.div>

      {/* Live Preview Panel */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <LivePreview
            template={selectedTemplate}
            onClose={() => setShowPreview(false)}
            onUseTemplate={handleUseTemplate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
