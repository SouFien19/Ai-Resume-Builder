"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, TrendingUp, Plus, Trash2 } from "lucide-react";
import WorkExperience from "../../components/sections/WorkExperience";
import type { WorkExperience as WorkItem } from "@/types/resume";

interface ExperienceStepProps {
  experience: WorkItem[];
  setExperience: (exp: WorkItem[]) => void;
  isAiWorking: boolean;
  aiGenerateAchievement?: (company: string, role: string, desc: string) => Promise<string>;
}

const ExperienceStep = memo(function ExperienceStep({
  experience,
  setExperience,
  isAiWorking,
  aiGenerateAchievement,
}: ExperienceStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Work Experience
        </h3>
        <p className="text-sm text-muted-foreground">
          Add your professional roles and key achievements. Quality over quantity!
        </p>
      </div>

      {/* STAR Method Helper Card */}
      <div className="rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-purple-500/10">
            <Lightbulb className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-purple-400">Use the STAR Method</h4>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <div>
                <span className="font-semibold text-purple-300">Situation:</span> Set the context
              </div>
              <div>
                <span className="font-semibold text-blue-300">Task:</span> Describe the challenge
              </div>
              <div>
                <span className="font-semibold text-cyan-300">Action:</span> Explain what you did
              </div>
              <div>
                <span className="font-semibold text-green-300">Result:</span> Quantify the impact (numbers!)
              </div>
            </div>
            <div className="pt-2 space-y-1">
              <div className="text-xs text-purple-300 font-medium">✓ Example:</div>
              <div className="text-xs text-muted-foreground italic">
                "Led migration to microservices architecture, reducing API response time by 40% and improving system reliability to 99.9% uptime"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Verbs Quick Reference */}
      <div className="rounded-lg border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-cyan-500/10">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-cyan-400">Power Words to Use</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
              <div>
                <div className="font-semibold text-cyan-300 mb-1">Leadership</div>
                <div>Led • Managed • Directed • Coordinated</div>
              </div>
              <div>
                <div className="font-semibold text-green-300 mb-1">Achievement</div>
                <div>Achieved • Exceeded • Delivered • Accomplished</div>
              </div>
              <div>
                <div className="font-semibold text-blue-300 mb-1">Technical</div>
                <div>Developed • Built • Designed • Engineered</div>
              </div>
              <div>
                <div className="font-semibold text-purple-300 mb-1">Impact</div>
                <div>Increased • Reduced • Improved • Optimized</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Experience Component */}
      <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
        <WorkExperience
          data={experience}
          onChange={(field, value) => {
            if (field === "__replace__") setExperience(value as WorkItem[]);
          }}
        />
      </div>

      {/* Pro Tips */}
      <div className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-blue-400">Pro Tips:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Start bullets with strong action verbs (Led, Achieved, Designed)</li>
              <li>Include metrics and numbers: percentages, dollar amounts, time saved</li>
              <li>Focus on outcomes and impact, not just responsibilities</li>
              <li>Tailor experiences to match the job you're applying for</li>
              <li>Keep descriptions concise - 2-4 bullet points per role</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ExperienceStep;
