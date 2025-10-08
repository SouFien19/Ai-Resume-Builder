"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Palette, Layout, Settings, Sparkles } from "lucide-react";
import Image from "next/image";
import TemplateGallery from "./TemplateGallery";

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

interface TemplateCustomization {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontSize: "small" | "medium" | "large";
  spacing: "compact" | "standard" | "relaxed";
  fontFamily: string;
}

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (
    template: Template,
    customization?: TemplateCustomization
  ) => void;
  currentTemplate?: Template;
}

const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif", preview: "Modern & Clean" },
  {
    name: "Roboto",
    value: "Roboto, sans-serif",
    preview: "Professional & Readable",
  },
  {
    name: "Open Sans",
    value: "Open Sans, sans-serif",
    preview: "Friendly & Clear",
  },
  { name: "Lato", value: "Lato, sans-serif", preview: "Corporate & Elegant" },
  {
    name: "Source Sans Pro",
    value: "Source Sans Pro, sans-serif",
    preview: "Tech & Minimal",
  },
];

const colorPresets = [
  {
    name: "Professional Blue",
    primary: "#1e40af",
    secondary: "#3b82f6",
    accent: "#60a5fa",
  },
  {
    name: "Executive Purple",
    primary: "#7c3aed",
    secondary: "#8b5cf6",
    accent: "#a78bfa",
  },
  {
    name: "Modern Green",
    primary: "#059669",
    secondary: "#10b981",
    accent: "#34d399",
  },
  {
    name: "Creative Orange",
    primary: "#ea580c",
    secondary: "#f97316",
    accent: "#fb923c",
  },
  {
    name: "Elegant Gray",
    primary: "#374151",
    secondary: "#6b7280",
    accent: "#9ca3af",
  },
  {
    name: "Bold Red",
    primary: "#dc2626",
    secondary: "#ef4444",
    accent: "#f87171",
  },
];

export default function TemplateSelectionModal({
  isOpen,
  onClose,
  onTemplateSelect,
  currentTemplate,
}: TemplateSelectionModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    currentTemplate || null
  );
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState<TemplateCustomization>({
    primaryColor: currentTemplate?.styling.primaryColor || "#1e40af",
    secondaryColor: currentTemplate?.styling.secondaryColor || "#3b82f6",
    accentColor: currentTemplate?.styling.accentColor || "#60a5fa",
    fontSize: "medium",
    spacing: "standard",
    fontFamily: "Inter, sans-serif",
  });

  if (!isOpen) return null;

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCustomization((prev) => ({
      ...prev,
      primaryColor: template.styling.primaryColor,
      secondaryColor: template.styling.secondaryColor,
      accentColor: template.styling.accentColor,
    }));
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate, customization);
      onClose();
    }
  };

  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    setCustomization((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="absolute right-0 top-0 h-full w-full max-w-7xl bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Choose Your Template
            </h2>
            <p className="text-gray-600 mt-1">
              Select and customize a professional resume template
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Template Gallery */}
          <div
            className={`transition-all duration-300 ${
              showCustomization ? "w-2/3" : "w-full"
            } overflow-y-auto`}
          >
            <TemplateGallery
              onTemplateSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?._id}
            />
          </div>

          {/* Customization Panel */}
          {showCustomization && selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-1/3 border-l border-gray-200 bg-gray-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Customize Template</h3>
                </div>

                {/* Template Preview */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Selected Template
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                        <Image
                          src={selectedTemplate.thumbnail}
                          alt={selectedTemplate.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {selectedTemplate.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedTemplate.category}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: customization.primaryColor,
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: customization.secondaryColor,
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: customization.accentColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {selectedTemplate.isPremium && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        <Sparkles className="h-3 w-3" />
                        Premium Template
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Presets */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Color Schemes
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyColorPreset(preset)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          customization.primaryColor === preset.primary
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {preset.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Custom Colors
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customization.primaryColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded border border-gray-200"
                        />
                        <input
                          type="text"
                          value={customization.primaryColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customization.secondaryColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              secondaryColor: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded border border-gray-200"
                        />
                        <input
                          type="text"
                          value={customization.secondaryColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              secondaryColor: e.target.value,
                            }))
                          }
                          className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customization.accentColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              accentColor: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded border border-gray-200"
                        />
                        <input
                          type="text"
                          value={customization.accentColor}
                          onChange={(e) =>
                            setCustomization((prev) => ({
                              ...prev,
                              accentColor: e.target.value,
                            }))
                          }
                          className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Layout className="h-4 w-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Typography</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Font Family
                      </label>
                      <select
                        value={customization.fontFamily}
                        onChange={(e) =>
                          setCustomization((prev) => ({
                            ...prev,
                            fontFamily: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.name} - {font.preview}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Font Size
                      </label>
                      <div className="flex gap-1">
                        {(["small", "medium", "large"] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() =>
                              setCustomization((prev) => ({
                                ...prev,
                                fontSize: size,
                              }))
                            }
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              customization.fontSize === size
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Spacing
                      </label>
                      <div className="flex gap-1">
                        {(["compact", "standard", "relaxed"] as const).map(
                          (spacing) => (
                            <button
                              key={spacing}
                              onClick={() =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  spacing,
                                }))
                              }
                              className={`px-3 py-1 text-sm rounded transition-colors ${
                                customization.spacing === spacing
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {spacing.charAt(0).toUpperCase() +
                                spacing.slice(1)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedTemplate && (
                <button
                  onClick={() => setShowCustomization(!showCustomization)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showCustomization
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  {showCustomization ? "Hide Customization" : "Customize"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplate}
                disabled={!selectedTemplate}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  selectedTemplate
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Check className="h-4 w-4" />
                Apply Template
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
