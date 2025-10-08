"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface EducationItem {
  id?: string;
  institution?: string;
  degree?: string;
  field?: string;
  graduationDate?: string;
  gpa?: string;
  description?: string;
}

interface Props {
  data: EducationItem[];
  onChange: (field: string, value: unknown) => void;
}

export default function Education({ data = [], onChange }: Props) {
  const [busyIndex, setBusyIndex] = useState<number | null>(null);

  const updateItem = (index: number, patch: Partial<EducationItem>) => {
    const next = [...(data || [])];
    next[index] = { ...next[index], ...patch };
    onChange("__replace__", next);
  };

  const addItem = () => {
    const next = [
      ...((data as EducationItem[]) || []),
      { institution: "", degree: "", field: "", graduationDate: "", description: "" },
    ];
    onChange("__replace__", next);
  };

  const removeItem = (index: number) => {
    const next = [...(data || [])];
    next.splice(index, 1);
    onChange("__replace__", next);
  };

  const generateDescription = async (index: number) => {
    try {
      setBusyIndex(index);
      const item = (data || [])[index] || {};
      
      if (!item.institution || !item.degree) {
        return;
      }

      const res = await fetch("/api/ai/education-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution: item.institution,
          degree: item.degree,
          field: item.field
        })
      });
      
      const result = await res.json();
      if (result.description) {
        updateItem(index, { description: result.description });
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
    } finally {
      setBusyIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      {(data || []).map((item, i) => (
        <Card key={i} className="bg-neutral-800/50 border-neutral-700/50">
          <CardContent className="pt-6 pb-4">
            {/* Two-Column Modern Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Institution - Left Column */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Institution
                </label>
                <Input
                  placeholder="e.g., University of Technology"
                  value={item.institution || ""}
                  onChange={(e) => updateItem(i, { institution: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Degree - Right Column */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Degree
                </label>
                <Input
                  placeholder="e.g., Bachelor of Science"
                  value={item.degree || ""}
                  onChange={(e) => updateItem(i, { degree: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Field of Study - Left Column */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Field of Study
                </label>
                <Input
                  placeholder="e.g., Computer Science"
                  value={item.field || ""}
                  onChange={(e) => updateItem(i, { field: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Graduation Date - Right Column */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Graduation Date
                </label>
                <Input
                  placeholder="e.g., May 2024"
                  value={item.graduationDate || ""}
                  onChange={(e) => updateItem(i, { graduationDate: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* GPA - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  GPA <span className="text-neutral-500 text-xs">(Optional)</span>
                </label>
                <Input
                  placeholder="e.g., 3.8/4.0"
                  value={item.gpa || ""}
                  onChange={(e) => updateItem(i, { gpa: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Description - Full Width with AI Button */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Description / Key Courses <span className="text-neutral-500 text-xs">(Optional)</span>
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateDescription(i)}
                    disabled={busyIndex === i || !item.institution || !item.degree}
                    className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30 text-amber-400 hover:bg-amber-600/30 disabled:opacity-50 h-7 px-2 text-xs"
                  >
                    {busyIndex === i ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1 h-3 w-3" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  placeholder="Relevant coursework, achievements, honors, or research projects..."
                  value={item.description || ""}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  rows={3}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                />
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-end mt-6 pt-4 border-t border-neutral-700/50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => removeItem(i)} 
                className="border-red-600/30 text-red-400 hover:bg-red-600/20"
              >
                Remove Education
              </Button>
            </div>

          </CardContent>
        </Card>
      ))}
      <Button 
        onClick={addItem} 
        className="bg-amber-600/20 border border-amber-600/30 text-amber-400 hover:bg-amber-600/30 w-full md:w-auto"
      >
        + Add Education
      </Button>
    </div>
  );
}
