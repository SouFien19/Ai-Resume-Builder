"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Globe, Sparkles } from "lucide-react";
import type { Language } from "@/types/resume";

interface LanguagesStepProps {
  languages: Language[];
  setLanguages: (languages: Language[]) => void;
  themeColor?: string;
}

const languageLevels = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"] as const;

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

const LanguagesStep = memo(function LanguagesStep({
  languages,
  setLanguages,
  themeColor = "#10B981",
}: LanguagesStepProps) {
  const [newLanguage, setNewLanguage] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<typeof languageLevels[number]>("Fluent");

  const handleAddLanguage = (langName: string, level: typeof languageLevels[number]) => {
    if (!langName.trim()) return;
    if (languages.some((l) => l.name.toLowerCase() === langName.toLowerCase())) return;

    setLanguages([...languages, { name: langName, level }]);
    setNewLanguage("");
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleLevelChange = (index: number, level: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], level };
    setLanguages(updated);
  };

  const handleQuickAdd = (langName: string) => {
    if (languages.some((l) => l.name.toLowerCase() === langName.toLowerCase())) return;
    setLanguages([...languages, { name: langName, level: "Fluent" }]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
          Languages
        </h3>
        <p className="text-sm text-muted-foreground">
          Add languages you speak and your proficiency level
        </p>
      </div>

      {/* Quick Add Common Languages */}
      <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-400" />
            <h4 className="text-sm font-semibold text-green-400">Quick Add</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonLanguages.map((lang) => (
              <Button
                key={lang}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(lang)}
                disabled={languages.some((l) => l.name.toLowerCase() === lang.toLowerCase())}
                className="text-xs"
                style={{
                  borderColor: `${themeColor}40`,
                  color: themeColor,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${themeColor}15`;
                  e.currentTarget.style.borderColor = `${themeColor}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = `${themeColor}40`;
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                {lang}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Custom Language */}
      <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-teal-400">Add Custom Language</h4>
          <div className="flex gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Language name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLanguage(newLanguage, selectedLevel);
                }
              }}
              className="flex-1"
              style={{
                borderColor: `${themeColor}30`
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = themeColor;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${themeColor}40`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${themeColor}30`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as typeof languageLevels[number])}
              className="px-3 py-2 rounded-md border bg-background text-sm"
              style={{
                borderColor: `${themeColor}30`,
                color: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = themeColor;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${themeColor}30`;
              }}
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
              style={{
                backgroundColor: themeColor,
                color: 'white',
                borderColor: themeColor
              }}
              onMouseEnter={(e) => {
                if (!newLanguage.trim()) return;
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Your Languages */}
      {languages.length > 0 && (
        <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-cyan-400">Your Languages ({languages.length})</h4>
            <div className="space-y-3">
              {languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-neutral-700/50 bg-neutral-800/40"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{lang.name}</div>
                  </div>
                  <select
                    value={lang.level || "Fluent"}
                    onChange={(e) => handleLevelChange(index, e.target.value)}
                    className="px-2 py-1 rounded-md border border-input bg-background text-xs"
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
                    className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <div className="rounded-lg border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-transparent to-green-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-teal-400">Pro Tips:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>List languages you can actually use in a professional setting</li>
              <li>Be honest about your proficiency level</li>
              <li>Native: Mother tongue or equivalent fluency</li>
              <li>Fluent: Can work professionally without difficulty</li>
              <li>Advanced: Strong command, minor limitations</li>
              <li>Intermediate: Conversational, some limitations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LanguagesStep;
