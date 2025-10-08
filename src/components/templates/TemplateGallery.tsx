"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Crown,
  Zap,
  Eye,
  Download,
  Palette,
  Settings,
} from "lucide-react";
import Image from "next/image";

interface Template {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  thumbnail: string;
  previewImage?: string;
  styling: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  tags: string[];
  industries: string[];
  jobLevels: string[];
  atsScore: number;
  usageCount: number;
  rating: number;
  ratingCount: number;
  isPremium: boolean;
  isFeatured: boolean;
}

interface TemplateGalleryProps {
  onTemplateSelect: (template: Template) => void;
  selectedTemplateId?: string;
}

const categories = [
  { name: "All", slug: "all", color: "#3b82f6", icon: Grid },
  { name: "Professional", slug: "professional", color: "#1e40af", icon: Crown },
  { name: "Creative", slug: "creative", color: "#ec4899", icon: Palette },
  { name: "Technical", slug: "technical", color: "#059669", icon: Zap },
  { name: "Executive", slug: "executive", color: "#7c3aed", icon: Star },
  { name: "Academic", slug: "academic", color: "#dc2626", icon: Settings },
];

const industries = [
  "Software",
  "Marketing",
  "Finance",
  "Healthcare",
  "Education",
  "Design",
];
const jobLevels = ["entry", "mid", "senior", "executive"];

export default function TemplateGallery({
  onTemplateSelect,
  selectedTemplateId,
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedJobLevel, setSelectedJobLevel] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, selectedIndustry, selectedJobLevel, sortBy]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        ...(selectedIndustry && { industry: selectedIndustry }),
        ...(selectedJobLevel && { jobLevel: selectedJobLevel }),
        sortBy,
      });

      const response = await fetch(`/api/templates/enhanced?${params}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data.templates);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
    setLoading(false);
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Professional Resume Templates
          </h1>
          <p className="text-gray-600 text-lg">
            Choose from our collection of ATS-optimized, industry-specific
            resume templates
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="usage">Most Used</option>
            </select>

            <div className="flex border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "text-gray-500"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "text-gray-500"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.slug}
                onClick={() => setSelectedCategory(category.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.slug
                    ? "text-white shadow-lg transform scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === category.slug
                      ? category.color
                      : undefined,
                }}
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Industries</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Level
                </label>
                <select
                  value={selectedJobLevel}
                  onChange={(e) => setSelectedJobLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  {jobLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Premium Only</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {!loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              viewMode={viewMode}
              isSelected={selectedTemplateId === template._id}
              onSelect={() => onTemplateSelect(template)}
            />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  viewMode: "grid" | "list";
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({
  template,
  viewMode,
  isSelected,
  onSelect,
}: TemplateCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-blue-500 shadow-lg"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      } ${viewMode === "list" ? "flex" : ""}`}
      onClick={onSelect}
    >
      {/* Template Preview */}
      <div
        className={`relative ${
          viewMode === "list" ? "w-48" : "w-full h-64"
        } bg-gray-100 rounded-t-xl overflow-hidden`}
      >
        {!imageError ? (
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="text-center">
              <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-500">Preview</span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {template.isFeatured && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3" />
              Featured
            </span>
          )}
          {template.isPremium && (
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Pro
            </span>
          )}
        </div>

        {/* ATS Score */}
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          {template.atsScore}% ATS
        </div>
      </div>

      {/* Template Info */}
      <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {template.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
            <Star className="h-3 w-3 fill-current text-yellow-400" />
            {template.rating.toFixed(1)}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {template.usageCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {(template.usageCount * 3).toLocaleString()}
            </span>
          </div>

          {/* Color Palette Preview */}
          <div className="flex gap-1">
            <div
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: template.styling.primaryColor }}
            />
            <div
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: template.styling.secondaryColor }}
            />
            <div
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: template.styling.accentColor }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
