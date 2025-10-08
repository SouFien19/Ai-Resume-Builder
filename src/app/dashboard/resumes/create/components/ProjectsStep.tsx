"use client";

import { memo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Lightbulb } from "lucide-react";
import Projects from "../../components/sections/Projects";
import type { Project } from "@/types/resume";

interface ProjectsStepProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  isAiWorking: boolean;
}

const ProjectsStep = memo(function ProjectsStep({
  projects,
  setProjects,
  isAiWorking,
}: ProjectsStepProps) {
  const hasSeededInitialProject = useRef(false);

  useEffect(() => {
    if (hasSeededInitialProject.current) return;

    if (!Array.isArray(projects) || projects.length === 0) {
      const nextId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString();

      setProjects([
        {
          id: nextId,
          name: "",
          description: "",
          technologies: [""],
          link: "",
          github: "",
        },
      ]);
    }

    hasSeededInitialProject.current = true;
  }, [projects, setProjects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Projects
        </h3>
        <p className="text-sm text-muted-foreground">
          Showcase your best work, side projects, or open-source contributions
        </p>
      </div>

      {/* Helper Card */}
      <div className="rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-purple-500/10">
            <Lightbulb className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-purple-400">Make Your Projects Stand Out</h4>
            <div className="text-xs text-muted-foreground space-y-2">
              <div>
                <span className="font-semibold text-purple-300">Name:</span> Clear, descriptive project title
              </div>
              <div>
                <span className="font-semibold text-pink-300">Description:</span> What problem does it solve? What makes it unique?
              </div>
              <div>
                <span className="font-semibold text-cyan-300">Technologies:</span> Tech stack used (React, Node.js, PostgreSQL, etc.)
              </div>
              <div>
                <span className="font-semibold text-green-300">Links:</span> Add live demo or GitHub repository URLs
              </div>
            </div>
            <div className="pt-2 space-y-1">
              <div className="text-xs text-purple-300 font-medium">✓ Example:</div>
              <div className="text-xs text-muted-foreground italic">
                &quot;Real-time Chat Platform - Built scalable WebSocket server handling 10K+ concurrent users with Redis pub/sub&quot;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Component */}
      <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
        <Projects
          data={projects}
          onChange={(field, value) => {
            if (field === "__replace__") setProjects(value as Project[]);
          }}
        />
      </div>

      {/* Pro Tips */}
      <div className="rounded-lg border border-pink-500/20 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-pink-400">Pro Tips:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Include 2-4 of your most impressive projects</li>
              <li>Highlight technical challenges you solved</li>
              <li>Mention impact: users, performance improvements, scale</li>
              <li>Add live links when possible - recruiters love clicking!</li>
              <li>Keep descriptions concise but impactful</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProjectsStep;
