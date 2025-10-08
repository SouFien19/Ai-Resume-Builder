"use client";

import { memo, useState } from "react";
import { X, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface STARMethodHelperProps {
  onClose: () => void;
  onApply: (text: string) => void;
  role?: string;
}

const STARMethodHelper = memo(function STARMethodHelper({
  onClose,
  onApply,
  role = "Software Engineer",
}: STARMethodHelperProps) {
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");

  const roleExamples: Record<string, {
    situation: string;
    task: string;
    action: string;
    result: string;
  }> = {
    "Software Engineer": {
      situation: "Legacy monolithic system causing slow deployments and frequent outages",
      task: "Modernize architecture to improve reliability and development velocity",
      action: "Led migration to microservices architecture using Docker/Kubernetes, implemented CI/CD pipeline",
      result: "Reduced deployment time by 75%, improved system uptime to 99.9%, enabled team to ship features 3x faster"
    },
    "Product Manager": {
      situation: "User churn rate increasing 15% quarter-over-quarter for mobile app",
      task: "Identify pain points and improve user retention",
      action: "Conducted 50+ user interviews, analyzed behavior data, prioritized top 5 friction points, launched iterative improvements",
      result: "Reduced churn by 40%, increased DAU by 25%, improved app store rating from 3.2 to 4.6 stars"
    },
    "Data Analyst": {
      situation: "Marketing team spending $500K/month without clear ROI visibility",
      task: "Build attribution model to optimize spend across channels",
      action: "Designed multi-touch attribution dashboard in Tableau, integrated data from 8 sources, created automated reporting",
      result: "Identified $150K/month in wasted spend, reallocated budget to increase conversions by 35%, saved $1.8M annually"
    },
    "Designer": {
      situation: "Design system fragmented across 12 product teams causing inconsistent UX",
      task: "Create unified design system to improve consistency and development speed",
      action: "Audited existing patterns, built component library in Figma, documented guidelines, trained 50+ designers/engineers",
      result: "Reduced design-to-dev handoff time by 60%, improved consistency score from 45% to 95%, adopted by all teams"
    }
  };

  const example = roleExamples[role] || roleExamples["Software Engineer"];

  const generateSTARText = () => {
    const parts = [];
    if (situation) parts.push(situation);
    if (task && action) parts.push(`${task}: ${action}`);
    else if (action) parts.push(action);
    if (result) parts.push(result);
    return parts.join(". ");
  };

  const handleApply = () => {
    const text = generateSTARText();
    if (text) {
      onApply(text);
      onClose();
    }
  };

  const handleLoadExample = () => {
    setSituation(example.situation);
    setTask(example.task);
    setAction(example.action);
    setResult(example.result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-neutral-900 rounded-2xl border border-neutral-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Lightbulb className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">STAR Method Achievement Builder</h3>
              <p className="text-sm text-muted-foreground">Create compelling, results-driven bullet points</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* STAR Framework Explanation */}
          <div className="rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-purple-400">S</span>
                  <span className="font-semibold text-purple-300">Situation</span>
                </div>
                <p className="text-xs text-muted-foreground">Set the context - what was the problem or challenge?</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-blue-400">T</span>
                  <span className="font-semibold text-blue-300">Task</span>
                </div>
                <p className="text-xs text-muted-foreground">What was your responsibility or goal?</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-cyan-400">A</span>
                  <span className="font-semibold text-cyan-300">Action</span>
                </div>
                <p className="text-xs text-muted-foreground">What specific steps did you take?</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-green-400">R</span>
                  <span className="font-semibold text-green-300">Result</span>
                </div>
                <p className="text-xs text-muted-foreground">What measurable impact did you achieve? (Use numbers!)</p>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-purple-400 mb-2 block">
                Situation (Context)
              </label>
              <Textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="E.g., Legacy system causing frequent outages and slow deployments..."
                className="min-h-[80px] bg-neutral-800 border-neutral-700 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-blue-400 mb-2 block">
                Task (Your Goal)
              </label>
              <Textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="E.g., Modernize architecture to improve reliability and speed..."
                className="min-h-[80px] bg-neutral-800 border-neutral-700 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-cyan-400 mb-2 block">
                Action (What You Did)
              </label>
              <Textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="E.g., Led migration to microservices, implemented CI/CD pipeline..."
                className="min-h-[80px] bg-neutral-800 border-neutral-700 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-green-400 mb-2 block">
                Result (Measurable Impact) ⭐
              </label>
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="E.g., Reduced deployment time by 75%, improved uptime to 99.9%..."
                className="min-h-[80px] bg-neutral-800 border-neutral-700 focus:border-green-500"
              />
            </div>
          </div>

          {/* Preview */}
          {generateSTARText() && (
            <div className="rounded-lg border border-green-500/20 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Preview</span>
              </div>
              <p className="text-sm text-white leading-relaxed">{generateSTARText()}</p>
            </div>
          )}

          {/* Example */}
          <div className="rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-amber-400">Example for {role}</span>
              <Button variant="ghost" size="sm" onClick={handleLoadExample} className="text-xs">
                Load Example
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {example.situation}. {example.task}: {example.action}. {example.result}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-900 border-t border-neutral-700 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleApply}
            disabled={!generateSTARText()}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
          >
            Apply to Resume
          </Button>
        </div>
      </div>
    </div>
  );
});

export default STARMethodHelper;
