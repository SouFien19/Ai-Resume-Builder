"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Star, 
  Code,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: Section[] = [
  {
    id: 'personalInfo',
    title: 'Personal Info',
    description: 'Contact & basic information',
    icon: User,
  },
  {
    id: 'summary',
    title: 'Summary',
    description: 'Professional overview',
    icon: FileText,
  },
  {
    id: 'workExperience',
    title: 'Experience',
    description: 'Work history & achievements',
    icon: Briefcase,
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Academic background',
    icon: GraduationCap,
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'Technical & soft skills',
    icon: Star,
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Notable projects & portfolio',
    icon: Code,
  },
  {
    id: 'certifications',
    title: 'Certifications',
    description: 'Professional certifications',
    icon: Award,
  },
];

interface SectionNavigationProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  completedSections?: string[];
  completionStats?: Record<string, number>;
}

export default function SectionNavigation({ 
  activeSection, 
  onSectionChange, 
  completionStats = {}
}: SectionNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-2 mb-6"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Resume Sections</h2>
        <p className="text-sm text-gray-600">Complete each section to build your resume</p>
      </div>
      
      {sections.map((section, index) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        const completion = completionStats[section.id] || 0;
        
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full p-4 rounded-xl text-left transition-all duration-200 border-2",
                isActive 
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md" 
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
                    : "bg-gray-100 text-gray-600"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-medium text-sm",
                      isActive ? "text-blue-700" : "text-gray-900"
                    )}>
                      {section.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs px-2 py-0.5",
                          completion >= 80 ? "border-green-200 text-green-700 bg-green-50" :
                          completion >= 50 ? "border-yellow-200 text-yellow-700 bg-yellow-50" :
                          "border-gray-200 text-gray-600"
                        )}
                      >
                        {completion}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{section.description}</p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <motion.div
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        completion >= 80 ? "bg-green-500" :
                        completion >= 50 ? "bg-yellow-500" :
                        "bg-gray-400"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}