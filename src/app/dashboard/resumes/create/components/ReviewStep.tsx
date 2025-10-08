"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Edit, Target, TrendingUp, Star, Zap } from "lucide-react";
import type { WorkExperience, Education, Certification, Project, Language } from "@/types/resume";

interface ReviewStepProps {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
  };
  skills: string[];
  summary: string;
  experience: WorkExperience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  interests: string[];
  atsScore: number | null;
  atsRecs: string[];
  career: {
    skillGaps: string[];
    salaryInsights: string;
    progression: string[];
    interviewPrep: string[];
  } | null;
  isAiWorking: boolean;
  getCareerIntel: () => void;
  setCurrentStep: (step: number) => void;
}

const ReviewStep = memo(function ReviewStep({
  personal,
  skills,
  summary,
  experience,
  projects,
  education,
  certifications,
  languages,
  interests,
  atsScore,
  atsRecs,
  career,
  isAiWorking,
  getCareerIntel,
  setCurrentStep,
}: ReviewStepProps) {
  const sections = [
    { name: "Contact Info", filled: !!(personal.name && personal.email), step: 1 },
    { name: "Skills", filled: skills.length > 0, step: 3 },
    { name: "Summary", filled: !!summary, step: 3 },
    { name: "Experience", filled: experience.length > 0, step: 4 },
    { name: "Projects", filled: projects.length > 0, step: 5 },
    { name: "Education", filled: education.length > 0, step: 6 },
    { name: "Certifications", filled: certifications.length > 0, step: 7 },
    { name: "Languages", filled: languages.length > 0, step: 8 },
    { name: "Interests", filled: interests.length > 0, step: 9 },
  ];

  const completedSections = sections.filter((s) => s.filled).length;
  const completionPercent = Math.round((completedSections / sections.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Review & Finalize
        </h3>
        <p className="text-sm text-muted-foreground">
          Check your information on the right. You can refine everything in the editor after creation.
        </p>
      </div>

      {/* Completion Progress */}
      <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-emerald-400">Resume Completeness</h4>
            <span className="text-2xl font-bold text-emerald-400">{completionPercent}%</span>
          </div>
          <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {sections.map((section) => (
              <button
                key={section.name}
                onClick={() => setCurrentStep(section.step)}
                className="flex items-center gap-2 p-2 rounded-md border border-neutral-700/50 bg-neutral-800/40 hover:bg-neutral-700/50 transition-colors text-left"
              >
                {section.filled ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                )}
                <span className="text-xs font-medium">{section.name}</span>
                <Edit className="h-3 w-3 ml-auto text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ATS Score */}
      {atsScore !== null && (
        <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-cyan-400">ATS Compatibility Score</h4>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-neutral-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${(atsScore / 100) * 201} 201`}
                    className="text-cyan-400"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{atsScore}</span>
                </div>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                {atsScore >= 80 && "Excellent! Your resume is highly optimized for ATS systems."}
                {atsScore >= 60 && atsScore < 80 && "Good score. Consider the recommendations below."}
                {atsScore < 60 && "Needs improvement. Review the suggestions to boost your score."}
              </div>
            </div>
            {atsRecs.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="text-xs font-semibold text-cyan-400">Recommendations:</div>
                <ul className="space-y-1">
                  {atsRecs.map((rec, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Career Insights - Modern Gradient Design */}
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Sparkles className="h-5 w-5 text-pink-400" />
              </div>
              <h4 className="text-lg font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                AI Career Insights
              </h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={getCareerIntel}
              disabled={isAiWorking}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/20"
            >
              {isAiWorking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Get Insights
            </Button>
          </div>
          {career && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skill Gaps */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 backdrop-blur-sm">
                <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-pink-400" />
                  Skill Gaps
                </div>
                <ul className="space-y-2">
                  {career.skillGaps.map((gap, i) => (
                    <li key={i} className="text-sm text-neutral-300 flex items-center">
                      <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mr-3 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Salary Insights */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
                <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  Salary Insights
                </div>
                <p className="text-sm text-neutral-300">{career.salaryInsights}</p>
              </div>
              
              {/* Career Progression */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
                <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-400" />
                  Career Progression
                </div>
                <ul className="space-y-2">
                  {career.progression.map((step, i) => (
                    <li key={i} className="text-sm text-neutral-300 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Interview Prep */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm">
                <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Interview Prep
                </div>
                <ul className="space-y-2">
                  {career.interviewPrep.map((tip, i) => (
                    <li key={i} className="text-sm text-neutral-300 flex items-center">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-3 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Tips */}
      <div className="rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-emerald-400">Ready to Create?</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Click the sections above to edit any information</li>
              <li>After creation, use the rich editor for fine-tuning</li>
              <li>You can export to PDF, DOCX, or JSON format</li>
              <li>Save multiple versions tailored to different jobs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ReviewStep;
