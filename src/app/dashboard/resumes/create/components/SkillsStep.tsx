"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Loader2, User, Wand2, Gauge } from "lucide-react";

interface SkillsStepProps {
  target: { role: string; seniority: string; industry: string };
  skills: string[];
  setSkills: (skills: string[]) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  summary: string;
  setSummary: (summary: string) => void;
  tone: "Professional" | "Impactful" | "Concise";
  setTone: (tone: "Professional" | "Impactful" | "Concise") => void;
  jobDesc: string;
  setJobDesc: (desc: string) => void;
  jdSuggestions: string[];
  setJdSuggestions: (suggestions: string[]) => void;
  atsScore: number | null;
  isAiWorking: boolean;
  roleSkillPresets: Record<string, string[]>;
  generateJobDescription: () => void;
  analyzeJD: () => void;
  runATSCheck: () => void;
  generateSkillsFromAI: () => void;
  aiImproveSummary: () => void;
  improveSummary: (base: string, opts: { role: string; seniority: string; industry: string; skills: string[]; tone: "Professional" | "Impactful" | "Concise" }) => string;
  generateSummary: (opts: { role: string; seniority: string; industry: string; skills: string[] }) => string;
}

const SkillsStep = memo(function SkillsStep({
  target,
  skills,
  addSkill,
  removeSkill,
  summary,
  setSummary,
  tone,
  setTone,
  jobDesc,
  setJobDesc,
  jdSuggestions,
  setJdSuggestions,
  atsScore,
  isAiWorking,
  roleSkillPresets,
  generateJobDescription,
  analyzeJD,
  runATSCheck,
  generateSkillsFromAI,
  aiImproveSummary,
  improveSummary,
  generateSummary,
}: SkillsStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-6"
    >
      {/* Job Description Section */}
      <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-800/40 backdrop-blur-sm rounded-xl p-5 border border-neutral-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <label className="text-sm font-bold text-white">Job Description</label>
              <p className="text-xs text-neutral-400">Optional - Tailor your resume to a specific role</p>
            </div>
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={generateJobDescription} 
            disabled={isAiWorking}
            className="bg-blue-600/20 border-blue-600/30 text-blue-400 hover:bg-blue-600/30"
          >
            {isAiWorking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Generate
          </Button>
        </div>
        <Textarea 
          rows={4} 
          value={jobDesc} 
          onChange={e => setJobDesc(e.target.value)} 
          placeholder="Paste a job description here to get tailored skill suggestions and ATS optimization..." 
          className="bg-neutral-900/60 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={analyzeJD} 
            disabled={isAiWorking || !jobDesc}
            className="bg-purple-600/20 border-purple-600/30 text-purple-400 hover:bg-purple-600/30"
          >
            {isAiWorking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Extract Skills from JD
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={runATSCheck} 
            disabled={isAiWorking || !jobDesc} 
            title={!jobDesc ? "Paste a JD first" : undefined} 
            className="bg-blue-600/20 border-blue-600/30 text-blue-400 hover:bg-blue-600/30"
          >
            {isAiWorking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gauge className="h-4 w-4 mr-2" />} 
            ATS Score Check
          </Button>
          {jdSuggestions.length > 0 && (
            <Button 
              type="button" 
              size="sm" 
              onClick={() => { 
                jdSuggestions.forEach(s => addSkill(s)); 
                setJdSuggestions([]); 
              }} 
              className="bg-green-600/20 border border-green-600/30 text-green-400 hover:bg-green-600/30"
            >
              + Add All {jdSuggestions.length} Suggestions
            </Button>
          )}
        </div>
        
        {/* ATS Score Display */}
        {atsScore !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-300">ATS Compatibility Score</span>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-black text-white">{atsScore}</div>
                <div className="text-sm text-green-400 font-medium">/100</div>
              </div>
            </div>
            <div className="mt-2 h-2 bg-neutral-900/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${atsScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Keyword Suggestions */}
        {jdSuggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">Keywords Found in Job Description</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {jdSuggestions.map(s => (
                <Badge 
                  key={s} 
                  variant="secondary" 
                  className="cursor-pointer bg-blue-600/20 border-blue-600/30 text-blue-300 hover:bg-blue-600/40 transition-colors" 
                  onClick={() => { 
                    addSkill(s); 
                    setJdSuggestions(jdSuggestions.filter(x => x !== s)); 
                  }}
                >
                  {s} +
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Skills Selection Section */}
      <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-800/40 backdrop-blur-sm rounded-xl p-5 border border-neutral-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <label className="text-sm font-bold text-white">Suggested Skills for {target.role}</label>
              <p className="text-xs text-neutral-400">Click to add to your resume</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(roleSkillPresets[target.role] || []).map(s => (
            <Badge 
              key={s} 
              variant={skills.includes(s) ? "default" : "secondary"} 
              className={`cursor-pointer transition-all duration-200 ${
                skills.includes(s) 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg hover:shadow-purple-500/30" 
                  : "bg-neutral-700/50 border-neutral-600/50 text-neutral-300 hover:bg-neutral-600/50 hover:border-neutral-500/50 hover:scale-105"
              }`} 
              onClick={() => (skills.includes(s) ? removeSkill(s) : addSkill(s))}
            >
              {skills.includes(s) && "✓ "}{s}
            </Badge>
          ))}
        </div>
      </div>

      {/* Your Skills Section */}
      <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-800/40 backdrop-blur-sm rounded-xl p-5 border border-neutral-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <User className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <label className="text-sm font-bold text-white">Your Selected Skills</label>
              <p className="text-xs text-neutral-400">{skills.length} skills added - Click to remove</p>
            </div>
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={generateSkillsFromAI} 
            disabled={isAiWorking}
            className="bg-green-600/20 border-green-600/30 text-green-400 hover:bg-green-600/30"
          >
            {isAiWorking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Suggest More
          </Button>
        </div>
        
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map(s => (
              <Badge 
                key={s} 
                variant="outline" 
                className="cursor-pointer bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-300 hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-200" 
                onClick={() => removeSkill(s)}
              >
                {s} ✕
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-400">
            <p className="text-sm mb-2">No skills added yet</p>
            <p className="text-xs">Select from suggestions above or add custom skills below</p>
          </div>
        )}

        <Input 
          placeholder="Type a custom skill and press Enter..." 
          className="bg-neutral-900/60 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
          onKeyDown={e => {
            if (e.key === "Enter") { 
              e.preventDefault(); 
              const val = (e.target as HTMLInputElement).value.trim(); 
              if (val) { 
                addSkill(val); 
                (e.target as HTMLInputElement).value = ""; 
              } 
            }
          }} 
        />
      </div>

      {/* Professional Summary Section */}
      <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-800/40 backdrop-blur-sm rounded-xl p-5 border border-neutral-700/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <FileText className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-bold text-white">Professional Summary</label>
            <p className="text-xs text-neutral-400">Compelling overview of your experience and strengths</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Tone:</span>
            <select 
              className="h-9 border border-neutral-600/50 rounded-md px-3 bg-neutral-900/60 text-white text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all" 
              value={tone} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTone(e.target.value as typeof tone)}
            >
              <option className="bg-neutral-800">Professional</option>
              <option className="bg-neutral-800">Impactful</option>
              <option className="bg-neutral-800">Concise</option>
            </select>
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={aiImproveSummary} 
            disabled={isAiWorking}
            className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-600/30 text-blue-400 hover:from-blue-600/30 hover:to-cyan-600/30"
          >
            {isAiWorking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {summary ? 'AI Enhance' : 'AI Generate'}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => setSummary(improveSummary(summary || generateSummary({ role: target.role, seniority: target.seniority, industry: target.industry, skills }), { role: target.role, seniority: target.seniority, industry: target.industry, skills, tone }))}
            className="bg-orange-600/20 border-orange-600/30 text-orange-400 hover:bg-orange-600/30"
          >
            <Wand2 className="h-4 w-4 mr-2" /> Use Template
          </Button>
        </div>
        
        <Textarea 
          rows={6} 
          value={summary} 
          onChange={e => setSummary(e.target.value)} 
          placeholder={generateSummary({ role: target.role, seniority: target.seniority, industry: target.industry, skills })} 
          className="bg-neutral-900/60 border-neutral-600/50 text-white placeholder:text-neutral-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
        />
        
        <div className="mt-4 p-4 bg-cyan-900/10 rounded-lg border border-cyan-800/20">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-cyan-400 text-sm">💡</span>
            </div>
            <div>
              <p className="text-xs text-cyan-400 font-bold mb-1">PRO TIPS FOR A STRONG SUMMARY:</p>
              <ul className="text-xs text-cyan-300/80 space-y-1">
                <li>• Start with your years of experience and key expertise</li>
                <li>• Include 2-3 quantifiable achievements (%, $, time saved)</li>
                <li>• Highlight your top 3-5 most relevant skills</li>
                <li>• Keep it concise: 3-5 sentences or 50-100 words</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default SkillsStep;
