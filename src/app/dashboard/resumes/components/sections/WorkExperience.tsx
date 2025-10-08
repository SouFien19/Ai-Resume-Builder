"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface ExperienceItem {
  id?: string;
  company?: string;
  position?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
}

interface Props {
  data: ExperienceItem[];
  onChange: (field: string, value: unknown) => void;
}

export default function WorkExperience({ data = [], onChange }: Props) {
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string[]>([]);
  const updateItem = (index: number, patch: Partial<ExperienceItem>) => {
    const next = [...(data || [])];
    next[index] = { ...next[index], ...patch };
    onChange("__replace__", next);
  };

  const addItem = () => {
    const next = [
      ...((data as ExperienceItem[]) || []),
      { company: "", position: "", startDate: "", description: "" },
    ];
    onChange("__replace__", next);
  };

  const generateExperienceDescription = async (index: number) => {
    try {
      setBusyIndex(index);
      const item = (data || [])[index] || {};
      
      if (!item.company || !item.position) {
        alert('Please fill in company and position first');
        return;
      }

      const res = await fetch("/api/ai/generate-experience-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          company: item.company,
          position: item.position || item.role,
          startDate: item.startDate,
          endDate: item.endDate,
          description: item.description,
          industry: '',
          experienceLevel: 'mid-level'
        })
      });
      
      const json = await res.json();
      
      if (json.success && json.data) {
        updateItem(index, { 
          description: json.data.description,
          achievements: json.data.achievements || []
        });
      } else {
        alert('Failed to generate description: ' + (json.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating experience description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setBusyIndex(null);
    }
  };

  const modifyExperienceDescription = async (index: number) => {
    try {
      setBusyIndex(index);
      const item = (data || [])[index] || {};
      const prompt = customPrompt[index] || '';

      if (!item.description) {
        alert('Please generate a description first');
        setBusyIndex(null);
        return;
      }

      if (!prompt) {
        alert('Please enter a custom prompt to modify the description');
        setBusyIndex(null);
        return;
      }

      const res = await fetch("/api/ai/modify-experience-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: item.description,
          achievements: item.achievements,
          prompt: prompt
        })
      });

      const json = await res.json();

      if (json.success && json.data) {
        updateItem(index, {
          description: json.data.description,
          achievements: json.data.achievements || []
        });
      } else {
        alert('Failed to modify description: ' + (json.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error modifying experience description:', error);
      alert('Failed to modify description. Please try again.');
    } finally {
      setBusyIndex(null);
    }
  };

  const removeItem = (index: number) => {
    const next = [...(data || [])];
    next.splice(index, 1);
    onChange("__replace__", next);
  };

  const updateCustomPrompt = (index: number, prompt: string) => {
    const next = [...customPrompt];
    next[index] = prompt;
    setCustomPrompt(next);
  };

  return (
    <div className="space-y-4">
      {(data || []).map((item, i) => (
        <Card key={i} className="bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 border-neutral-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-transparent bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text">
                  Company
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g., Google, Microsoft, Meta"
                    value={item.company || ""}
                    onChange={(e) => updateItem(i, { company: e.target.value })}
                    className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-emerald-500/30 text-white placeholder:text-neutral-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-md pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
                  Position / Role
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g., Software Engineer, Product Manager"
                    value={item.position || item.role || ""}
                    onChange={(e) =>
                      updateItem(i, { position: e.target.value, role: e.target.value })
                    }
                    className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-indigo-500/30 text-white placeholder:text-neutral-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-md pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                  Start Date
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g., Jan 2022"
                    value={item.startDate || ""}
                    onChange={(e) => updateItem(i, { startDate: e.target.value })}
                    className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-cyan-500/30 text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-md pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  End Date
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g., Present or Dec 2024"
                    value={item.endDate || ""}
                    onChange={(e) => updateItem(i, { endDate: e.target.value })}
                    className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-purple-500/30 text-white placeholder:text-neutral-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-md pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-transparent bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text">
                Description
              </label>
              <div className="relative">
                <Textarea
                  rows={4}
                  placeholder="Describe your responsibilities and impact. Use action verbs and quantify achievements..."
                  value={item.description || ""}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-orange-500/30 text-white placeholder:text-neutral-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 resize-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-md pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">Fill company & position, then generate a description.</div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => generateExperienceDescription(i)} 
                  disabled={busyIndex === i || !item.company || !item.position}
                  className="bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30"
                >
                  {busyIndex === i ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )} 
                  Generate Description
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-transparent bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text">
                Modify with AI
              </label>
              <div className="relative">
                <Textarea
                  rows={2}
                  placeholder="e.g., 'Make it more concise', 'Add metrics', 'Focus on leadership'"
                  value={customPrompt[i] || ""}
                  onChange={(e) => updateCustomPrompt(i, e.target.value)}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-pink-500/30 text-white placeholder:text-neutral-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all duration-200 resize-none"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-md pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => modifyExperienceDescription(i)}
                disabled={busyIndex === i || !item.description}
                className="bg-cyan-600/20 border border-cyan-600/30 text-cyan-400 hover:bg-cyan-600/30"
              >
                {busyIndex === i ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Modify Description
              </Button>
              <Button variant="outline" size="sm" onClick={() => removeItem(i)} className="border-red-600/30 text-red-400 hover:bg-red-600/20">
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={addItem} className="bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30">+ Add Experience</Button>
    </div>
  );
}
