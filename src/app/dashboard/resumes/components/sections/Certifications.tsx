"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface CertItem {
  id?: string;
  name?: string;
  issuer?: string;
  date?: string;
  credential?: string;
  description?: string;
}

interface Props {
  data: CertItem[];
  onChange: (field: string, value: unknown) => void;
}

export default function Certifications({ data = [], onChange }: Props) {
  const [busyIndex, setBusyIndex] = useState<number | null>(null);

  const updateItem = (index: number, patch: Partial<CertItem>) => {
    const next = [...(data || [])];
    next[index] = { ...next[index], ...patch };
    onChange("__replace__", next);
  };

  const addItem = () => {
    const next = [...(data || []), { name: "", issuer: "", date: "", description: "" }];
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
      
      if (!item.name) {
        return;
      }

      const res = await fetch("/api/ai/certification-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          issuer: item.issuer,
          field: "Professional certification"
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
              
              {/* Certification Name - Left Column */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Certification Name
                </label>
                <Input
                  placeholder="e.g., AWS Certified Solutions Architect"
                  value={item.name || ""}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Issuer - Right Column */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Issuing Organization
                </label>
                <Input
                  placeholder="e.g., Amazon Web Services"
                  value={item.issuer || ""}
                  onChange={(e) => updateItem(i, { issuer: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Date - Left Column */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Issue Date
                </label>
                <Input
                  placeholder="e.g., June 2023"
                  value={item.date || ""}
                  onChange={(e) => updateItem(i, { date: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Credential ID - Right Column */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Credential ID <span className="text-neutral-500 text-xs">(Optional)</span>
                </label>
                <Input
                  placeholder="e.g., AWS-12345678"
                  value={item.credential || ""}
                  onChange={(e) => updateItem(i, { credential: e.target.value })}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Description - Full Width with AI Button */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Description <span className="text-neutral-500 text-xs">(Optional)</span>
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateDescription(i)}
                    disabled={busyIndex === i || !item.name}
                    className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-600/30 text-indigo-400 hover:bg-indigo-600/30 disabled:opacity-50 h-7 px-2 text-xs"
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
                  placeholder="Skills validated, knowledge areas, or achievements..."
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
                variant="ghost" 
                size="sm" 
                onClick={() => removeItem(i)} 
                className="bg-gradient-to-r from-red-600/10 to-rose-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 hover:border-red-500/50 transition-all duration-200"
              >
                <span className="mr-1">×</span> Remove Certification
              </Button>
            </div>

          </CardContent>
        </Card>
      ))}
      <Button 
        onClick={addItem} 
        className="bg-indigo-600/20 border border-indigo-600/30 text-indigo-400 hover:bg-indigo-600/30 w-full md:w-auto"
      >
        + Add Certification
      </Button>
    </div>
  );
}
