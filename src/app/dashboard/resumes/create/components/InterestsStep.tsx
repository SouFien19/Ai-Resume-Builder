"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Loader2 } from "lucide-react";
import Interests from "../../components/sections/Interests";

interface InterestsStepProps {
  interests: string[];
  setInterests: (interests: string[]) => void;
  isAiWorking: boolean;
  aiSuggestInterests: () => void;
  themeColor?: string;
}

const InterestsStep = memo(function InterestsStep({
  interests,
  setInterests,
  isAiWorking,
  aiSuggestInterests,
  themeColor = "#F43F5E",
}: InterestsStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
            Interests & Hobbies
          </h3>
          <p className="text-sm text-muted-foreground">
            Share your personal interests (optional but adds personality!)
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={aiSuggestInterests}
          disabled={isAiWorking}
          style={{
            backgroundColor: themeColor,
            color: 'white',
            borderColor: themeColor
          }}
          onMouseEnter={(e) => {
            if (!isAiWorking) e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {isAiWorking ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          AI Suggest
        </Button>
      </div>

      {/* Helper Card */}
      <div className="rounded-lg border border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-transparent to-pink-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-rose-500/10">
            <Heart className="h-5 w-5 text-rose-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-rose-400">Why Include Interests?</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Shows you as a well-rounded person beyond work</div>
              <div>• Can be great conversation starters in interviews</div>
              <div>• Demonstrates soft skills (teamwork, leadership, creativity)</div>
              <div>• Keep it professional and relevant to workplace culture</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interests Component */}
      <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
        <Interests
          data={interests}
          onChange={(field, value) => {
            if (field === "__replace__") setInterests(value as string[]);
          }}
        />
      </div>

      {/* Pro Tips */}
      <div className="rounded-lg border border-pink-500/20 bg-gradient-to-br from-pink-500/5 via-transparent to-rose-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-pink-400">Pro Tips:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Choose 3-5 genuine interests that show personality</li>
              <li>Good examples: Open-source contributions, mentoring, public speaking</li>
              <li>Avoid controversial topics (politics, religion)</li>
              <li>Leadership roles in hobbies demonstrate soft skills</li>
              <li>Tech hobbies (game dev, robotics) strengthen tech profiles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InterestsStep;
