"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface ProjectItem {
  id?: string;
  name?: string;
  description?: string;
  technologies?: string[];
  link?: string;
  github?: string;
}

interface Props {
  data: ProjectItem[];
  onChange: (field: string, value: unknown) => void;
}

export default function Projects({ data = [], onChange }: Props) {
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const updateItem = (index: number, patch: Partial<ProjectItem>) => {
    const next = [...(data || [])];
    next[index] = { ...next[index], ...patch };
    onChange("__replace__", next);
  };

  const generateDescription = async (index: number) => {
    const item = data[index];
    if (!item.name?.trim()) {
      setError("Please enter a project name first");
      return;
    }

    setError("");
    setBusyIndex(index);

    try {
      const response = await fetch("/api/ai/generate-project-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          technologies: item.technologies || [],
          currentDescription: item.description || "",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate description");
      }

      updateItem(index, { description: result.data.description });
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate description");
    } finally {
      setBusyIndex(null);
    }
  };

  const updateTech = (index: number, techIndex: number, value: string) => {
    const next = [...(data || [])];
    const item = { ...(next[index] || {}) } as ProjectItem;
    const techs = [...(item.technologies || [])];
    techs[techIndex] = value;
    item.technologies = techs;
    next[index] = item;
    onChange("__replace__", next);
  };

  const addItem = () => {
    const next = [...(data || []), { name: "", description: "", technologies: [""] }];
    onChange("__replace__", next);
  };

  const addTech = (index: number) => {
    const next = [...(data || [])];
    const item = { ...(next[index] || {}) } as ProjectItem;
    item.technologies = [...(item.technologies || []), ""];
    next[index] = item;
    onChange("__replace__", next);
  };

  const removeItem = (index: number) => {
    const next = [...(data || [])];
    next.splice(index, 1);
    onChange("__replace__", next);
  };

  const removeTech = (index: number, techIndex: number) => {
    const next = [...(data || [])];
    const item = { ...(next[index] || {}) } as ProjectItem;
    const techs = [...(item.technologies || [])];
    techs.splice(techIndex, 1);
    item.technologies = techs;
    next[index] = item;
    onChange("__replace__", next);
  };

  return (
    <div className="space-y-4">
      {(data || []).map((item, i) => (
        <Card key={i} className="bg-neutral-800/50 border-neutral-700/50">
          <CardContent className="pt-6 pb-4">
            {/* Two-Column Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Project Name - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Project Name
                </label>
                <Input
                  placeholder="e.g., E-commerce Platform, Portfolio Website"
                  value={item.name || ""}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Description - Full Width with AI Button */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Description
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateDescription(i)}
                    disabled={busyIndex === i || !item.name?.trim()}
                    className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-600/30 text-purple-400 hover:bg-purple-600/30 disabled:opacity-50 h-7 px-2 text-xs"
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
                  placeholder="Describe what the project does, its impact, and key features..."
                  value={item.description || ""}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  rows={3}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                />
                {error && busyIndex === i && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-600/30 rounded-md p-2 mt-2">
                    {error}
                  </div>
                )}
              </div>

              {/* Technologies - Left Column */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-300">
                  Technologies Used
                </label>
                <div className="space-y-2">
                  {(item.technologies || []).map((tech, ti) => (
                    <div key={ti} className="flex gap-2">
                      <Input
                        placeholder="e.g., React, Node.js"
                        value={tech}
                        onChange={(e) => updateTech(i, ti, e.target.value)}
                        className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeTech(i, ti)} 
                        className="border-red-600/30 text-red-400 hover:bg-red-600/20 shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => addTech(i)} 
                    className="bg-green-600/20 border-green-600/30 text-green-400 hover:bg-green-600/30 w-full"
                  >
                    + Add Technology
                  </Button>
                </div>
              </div>

              {/* GitHub Repository - Right Column */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-300">
                  GitHub Repository
                </label>
                <Input
                  placeholder="https://github.com/username/repo"
                  value={item.github || ""}
                  onChange={(e) => updateItem(i, { github: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
                <div className="text-xs text-neutral-500 mt-1">
                  Optional: Link to your source code
                </div>
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
                Remove Project
              </Button>
            </div>

          </CardContent>
        </Card>
      ))}
      <Button 
        onClick={addItem} 
        className="bg-purple-600/20 border border-purple-600/30 text-purple-400 hover:bg-purple-600/30 w-full md:w-auto"
      >
        + Add Project
      </Button>
    </div>
  );
}
