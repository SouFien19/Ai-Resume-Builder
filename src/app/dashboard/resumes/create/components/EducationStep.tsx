"use client";

import { memo } from "react";
import { Sparkles, GraduationCap } from "lucide-react";
import Education from "../../components/sections/Education";
import type { Education as EduItem } from "@/types/resume";

interface EducationStepProps {
  education: EduItem[];
  setEducation: (edu: EduItem[]) => void;
}

const EducationStep = memo(function EducationStep({
  education,
  setEducation,
}: EducationStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Education
        </h3>
        <p className="text-sm text-muted-foreground">
          Add your academic background and qualifications
        </p>
      </div>

      {/* Helper Card */}
      <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-amber-500/10">
            <GraduationCap className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-amber-400">Education Guidelines</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• List your highest degree first (reverse chronological)</div>
              <div>• Include GPA if it strengthens your profile (3.5+)</div>
              <div>• Add relevant coursework, honors, or academic achievements</div>
              <div>• Keep high school education only if you lack higher education</div>
            </div>
          </div>
        </div>
      </div>

      {/* Education Component */}
      <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
        <Education
          data={education}
          onChange={(field, value) => {
            if (field === "__replace__") setEducation(value as EduItem[]);
          }}
        />
      </div>

      {/* Pro Tips */}
      <div className="rounded-lg border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-orange-400">Pro Tips:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Mention relevant academic projects or research</li>
              <li>Include study abroad or exchange programs</li>
              <li>Add scholarships or academic awards</li>
              <li>For recent grads: coursework can supplement limited work experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EducationStep;
