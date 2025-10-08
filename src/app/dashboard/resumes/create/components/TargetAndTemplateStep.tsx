"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Briefcase, User, Globe, Palette, FileText } from "lucide-react";
import Image from "next/image";
import type { Template } from "@/lib/types";

interface TargetInfo {
  role: string;
  industry: string;
  seniority: string;
}

interface TargetAndTemplateStepProps {
  target: TargetInfo;
  setTarget: (target: TargetInfo) => void;
  templates: Template[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  roleSkillPresets: Record<string, string[]>;
  setSkills: (skills: string[]) => void;
  industries: readonly string[];
  seniorities: readonly string[];
}

const TargetAndTemplateStep = memo(function TargetAndTemplateStep({
  target,
  setTarget,
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  roleSkillPresets,
  setSkills,
  industries,
  seniorities
}: TargetAndTemplateStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-6"
    >
      {/* Enhanced Role Presets */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Briefcase className="h-4 w-4 text-purple-400" />
          </div>
          <span className="text-sm font-semibold text-white">Popular Roles</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.keys(roleSkillPresets).slice(0, 6).map(r => (
            <motion.button
              key={r}
              onClick={() => { 
                setTarget({ ...target, role: r }); 
                setSkills(roleSkillPresets[r]); 
              }}
              className={`px-4 py-2 rounded-lg border transition-all duration-300 font-medium text-sm ${
                target.role === r 
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 border-transparent text-white shadow-lg shadow-pink-500/25" 
                  : "border-neutral-600 bg-neutral-800/50 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-700/50"
              }`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Enhanced Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-cyan-400" />
            Target Role
          </label>
          <motion.div whileFocus={{ scale: 1.02 }}>
            <Input 
              value={target.role} 
              onChange={e => setTarget({ ...target, role: e.target.value })} 
              placeholder="e.g., Software Engineer"
              className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all duration-300"
            />
          </motion.div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-green-400" />
            Seniority
          </label>
          <motion.select 
            value={target.seniority} 
            onChange={e => setTarget({ ...target, seniority: e.target.value })}
            className="w-full border border-neutral-600 rounded-md h-10 px-3 bg-neutral-800/50 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all duration-300"
          >
            {seniorities.map(s => (<option key={s} value={s} className="bg-neutral-800">{s}</option>))}
          </motion.select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            Industry
          </label>
          <motion.select 
            value={target.industry} 
            onChange={e => setTarget({ ...target, industry: e.target.value })}
            className="w-full border border-neutral-600 rounded-md h-10 px-3 bg-neutral-800/50 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all duration-300"
          >
            {industries.map(i => (<option key={i} value={i} className="bg-neutral-800">{i}</option>))}
          </motion.select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
              <Palette className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Choose Your Template</h3>
              <p className="text-xs text-neutral-400">Select a professional design that matches your style</p>
            </div>
          </div>
          <span className="text-xs text-neutral-400 font-medium">12 Premium Templates</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {templates.map(tpl => {
            const isSelected = selectedTemplateId === tpl._id.toLowerCase();
            return (
              <motion.button 
                key={tpl._id} 
                type="button" 
                onClick={() => setSelectedTemplateId(tpl._id.toLowerCase())} 
                className={`group relative rounded-xl border-2 overflow-hidden text-left transition-all duration-300 ${
                  isSelected
                    ? "border-pink-500 ring-4 ring-pink-500/20 shadow-xl shadow-pink-500/20" 
                    : "border-neutral-700/50 bg-neutral-800/40 hover:border-neutral-600/80 hover:shadow-lg hover:shadow-neutral-900/50"
                }`}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Template Preview */}
                <div className="relative h-48 bg-gradient-to-br from-neutral-800 to-neutral-700 overflow-hidden">
                  {tpl.thumbnail ? (
                    <Image 
                      src={tpl.thumbnail} 
                      alt={tpl.name} 
                      fill 
                      className={`object-cover transition-transform duration-300 ${
                        !isSelected && "group-hover:scale-110"
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                      <FileText className="h-10 w-10" />
                    </div>
                  )}
                  
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent">
                      <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          className="text-white font-bold"
                        >
                          ✓
                        </motion.div>
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-neutral-900/90 text-neutral-300 backdrop-blur-sm border border-neutral-700/50">
                      {tpl.category || 'Professional'}
                    </span>
                  </div>
                  
                  {/* Color Indicator */}
                  {tpl.primary && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: tpl.primary }}
                      />
                      <span className="text-[10px] font-medium text-white bg-neutral-900/90 px-2 py-0.5 rounded backdrop-blur-sm">
                        Color Theme
                      </span>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className={`p-4 transition-colors duration-300 ${
                  isSelected 
                    ? "bg-gradient-to-br from-pink-500/10 to-purple-500/10" 
                    : "bg-neutral-800/60 group-hover:bg-neutral-800/80"
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white leading-tight">{tpl.name}</h4>
                    {isSelected && (
                      <span className="text-xs font-semibold text-pink-400 whitespace-nowrap">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                    {tpl.description || 'Professional resume template with modern design'}
                  </p>
                  
                  {/* Template Features */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-700/50">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span className="text-[10px] text-neutral-400 font-medium">ATS-Friendly</span>
                    </div>
                    <div className="w-px h-3 bg-neutral-700"></div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <span className="text-[10px] text-neutral-400 font-medium capitalize">{tpl.layout || '2-Column'}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});

export default TargetAndTemplateStep;