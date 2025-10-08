"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { X, CheckCircle, Star, Sparkles } from "lucide-react";
import { Template } from "@/lib/types";

interface TemplateSelectorProps {
  isOpen: boolean;
  currentTemplateId?: string;
  onSelect: (template: Template) => void;
  onClose: () => void;
  allowedTemplates?: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: 0.2 }
  }
};

const templateVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  }
};

const templateCategories = [
  { id: 'azurill', name: 'Azurill', category: 'Modern', popularity: 5 },
  { id: 'pikachu', name: 'Pikachu', category: 'Creative', popularity: 4 },
  { id: 'gengar', name: 'Gengar', category: 'Professional', popularity: 5 },
  { id: 'chikorita', name: 'Chikorita', category: 'Clean', popularity: 4 },
  { id: 'onyx', name: 'Onyx', category: 'Bold', popularity: 3 },
];

export default function TemplateSelector({ isOpen, currentTemplateId, onSelect, onClose, allowedTemplates }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { getTemplates } = await import('@/lib/api-client');
        const data: Template[] = await getTemplates();
        const normalized = data.map(t => ({
          ...t,
          thumbnail: t.thumbnail.replace(/\\/g, "/").replace(/^\/*/, "/"),
        }));
        setTemplates(normalized);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleTemplates = React.useMemo(() => {
    if (!allowedTemplates || allowedTemplates.length === 0) return templates;
    const allow = new Set(allowedTemplates.map(id => id.toLowerCase()));
    return templates.filter(t => allow.has((t._id || '').toLowerCase()));
  }, [templates, allowedTemplates]);

  const getTemplateCategory = (templateId: string) => {
    return templateCategories.find(cat => cat.id === templateId) || 
           { category: 'Standard', popularity: 3 };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  Choose Your Perfect Template
                </h3>
                <p className="text-blue-100 mt-1">Select a professional template that matches your style</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-white hover:bg-white/20 h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <motion.div 
                className="py-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">Loading beautiful templates...</p>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {visibleTemplates.map((tpl) => {
                  const isSelected = tpl._id === currentTemplateId;
                  const isHovered = hoveredTemplate === tpl._id;
                  const categoryInfo = getTemplateCategory(tpl._id);
                  
                  return (
                    <motion.div
                      key={tpl._id}
                      variants={templateVariants}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onHoverStart={() => setHoveredTemplate(tpl._id)}
                      onHoverEnd={() => setHoveredTemplate(null)}
                    >
                      <Card className={`
                        relative overflow-hidden cursor-pointer transition-all duration-300
                        ${isSelected 
                          ? "ring-2 ring-blue-500 shadow-xl scale-105" 
                          : "hover:shadow-lg border-gray-200 dark:border-gray-700"
                        }
                        ${isHovered ? "shadow-xl" : ""}
                      `}>
                        <CardContent className="p-0">
                          {/* Template Preview */}
                          <div className="relative w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                            {tpl.previewUrl ? (
                              <object
                                data={tpl.previewUrl}
                                type={tpl.previewUrl.endsWith('.pdf') ? 'application/pdf' : 'image/png'}
                                className="w-full h-full object-cover"
                              >
                                <Image 
                                  src={tpl.thumbnail} 
                                  alt={tpl.name} 
                                  fill 
                                  className="object-cover transition-transform duration-300 hover:scale-105" 
                                />
                              </object>
                            ) : (
                              <Image 
                                src={tpl.thumbnail} 
                                alt={tpl.name} 
                                fill 
                                className="object-cover transition-transform duration-300 hover:scale-105" 
                              />
                            )}
                            
                            {/* Overlay on hover */}
                            <AnimatePresence>
                              {isHovered && (
                                <motion.div
                                  className="absolute inset-0 bg-black/20 flex items-center justify-center"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium shadow-lg"
                                  >
                                    Click to Select
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Selected Badge */}
                            {isSelected && (
                              <motion.div
                                className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-2 shadow-lg"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 400, 
                                  damping: 30 
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </motion.div>
                            )}

                            {/* Popularity Stars */}
                            <div className="absolute top-3 left-3 flex gap-1">
                              {Array.from({ length: categoryInfo.popularity }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className="h-3 w-3 fill-yellow-400 text-yellow-400" 
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Template Info */}
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                {tpl.name}
                              </h4>
                              <Badge 
                                variant="secondary"
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              >
                                {categoryInfo.category}
                              </Badge>
                            </div>
                            
                            {tpl.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {tpl.description}
                              </p>
                            )}
                            
                            <Button 
                              className={`
                                w-full transition-all duration-200
                                ${isSelected 
                                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                  : "bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-blue-600"
                                }
                              `}
                              onClick={() => onSelect(tpl)}
                            >
                              {isSelected ? (
                                <span className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Selected
                                </span>
                              ) : (
                                "Use This Template"
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
