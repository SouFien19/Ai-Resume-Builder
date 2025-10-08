"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Sparkles, X } from "lucide-react";
import type { Language } from "@/types/resume";

interface Props {
  data: Language[];
  onChange: (field: string, value: unknown) => void;
}

type LanguageLevel =
  | "Native"
  | "Fluent"
  | "Advanced"
  | "Intermediate"
  | "Basic";

const languageLevels: LanguageLevel[] = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
];

const commonLanguages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin Chinese",
  "Japanese",
  "Korean",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Russian",
  "Italian",
];

export default function Languages({ data = [], onChange }: Props) {
  const languages = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [newLanguage, setNewLanguage] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>("Fluent");

  const updateLanguages = (next: Language[]) => {
    onChange("__replace__", next);
  };

  const handleAddLanguage = (name: string, level: LanguageLevel) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (languages.some((lang) => lang.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewLanguage("");
      return;
    }

    updateLanguages([...languages, { name: trimmed, level }]);
    setNewLanguage("");
  };

  const handleRemoveLanguage = (index: number) => {
    const next = languages.filter((_, i) => i !== index);
    updateLanguages(next);
  };

  const handleLevelChange = (index: number, level: LanguageLevel) => {
    const next = [...languages];
    next[index] = { ...next[index], level };
    updateLanguages(next);
  };

  const handleQuickAdd = (name: string) => {
    if (languages.some((lang) => lang.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    updateLanguages([...languages, { name, level: "Fluent" }]);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-neutral-800/50 border-neutral-700/50">
        <CardContent className="pt-6 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-500/10">
                <Globe className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Languages</h3>
                <p className="text-sm text-neutral-400">
                  Add languages you speak and select your proficiency level.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="self-start border-emerald-500/30 text-emerald-300">
              {languages.length} {languages.length === 1 ? "language" : "languages"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Quick add common languages
            </div>
            <div className="flex flex-wrap gap-2">
              {commonLanguages.map((lang) => {
                const isSelected = languages.some(
                  (existing) => existing.name.toLowerCase() === lang.toLowerCase()
                );

                return (
                  <Button
                    key={lang}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(lang)}
                    disabled={isSelected}
                    className="text-xs border-emerald-500/30 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {lang}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Add custom language
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={newLanguage}
                onChange={(event) => setNewLanguage(event.target.value)}
                placeholder="Language name"
                className="flex-1 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddLanguage(newLanguage, selectedLevel);
                  }
                }}
              />
              <select
                value={selectedLevel}
                onChange={(event) => setSelectedLevel(event.target.value as LanguageLevel)}
                className="rounded-lg bg-gradient-to-br from-neutral-900/95 to-neutral-800/95 border-2 border-emerald-500/60 px-4 py-2.5 text-sm text-white font-semibold shadow-lg shadow-emerald-500/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200 cursor-pointer hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 [&>option]:bg-neutral-900 [&>option]:text-white [&>option]:py-3 [&>option]:font-medium"
                style={{ colorScheme: 'dark' }}
              >
                {languageLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={() => handleAddLanguage(newLanguage, selectedLevel)}
                disabled={!newLanguage.trim()}
                className="bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white hover:from-emerald-500 hover:to-teal-500 disabled:from-emerald-600/30 disabled:to-teal-600/30 transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {languages.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-neutral-300">
                Your languages
              </div>
              <div className="space-y-3">
                {languages.map((language, index) => (
                  <div
                    key={`${language.name}-${index}`}
                    className="flex flex-col gap-3 rounded-lg border border-neutral-700/50 bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 p-4 sm:flex-row sm:items-center sm:justify-between hover:border-emerald-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Globe className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="text-base font-semibold text-white">
                        {language.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={language.level || "Fluent"}
                        onChange={(event) =>
                          handleLevelChange(index, event.target.value as LanguageLevel)
                        }
                        className="rounded-lg bg-gradient-to-br from-neutral-900/95 to-neutral-800/95 border-2 border-emerald-500/60 px-4 py-2.5 text-sm text-white font-semibold shadow-lg shadow-emerald-500/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 focus:outline-none transition-all duration-200 cursor-pointer hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 [&>option]:bg-neutral-900 [&>option]:text-white [&>option]:py-3 [&>option]:font-medium"
                        style={{ colorScheme: 'dark' }}
                      >
                        {languageLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLanguage(index)}
                        className="h-9 w-9 p-0 rounded-lg bg-gradient-to-br from-red-600/10 to-rose-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 hover:border-red-500/50 transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
