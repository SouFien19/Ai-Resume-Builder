"use client";

import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Info } from 'lucide-react';
import Toolbar from './Toolbar';
import LivePreview from './LivePreview';
import SectionEditor from './SectionEditor';
import TemplateSelector from './TemplateSelector';
import { ResumeData, SectionKey, PersonalInfo } from '@/types/resume';

import { toast } from 'sonner';
import { exportElementToPDF } from '@/lib/export/pdf-export';

interface EditorLayoutProps {
  resumeData: ResumeData;
  onDataChange: (data: ResumeData) => void;
  className?: string;
  resumeId: string;
  initialZoom?: number;
  initialShowPreview?: boolean;
  initialActiveSection?: string;
}

export interface EditorLayoutRef {
  handleExport: () => Promise<void>;
  setActiveSection: (section: string) => void;
  setZoom: (zoom: number) => void;
  setShowPreview: (show: boolean) => void;
}

const EditorLayout = forwardRef<EditorLayoutRef, EditorLayoutProps>(function EditorLayout({ 
  resumeData, 
  onDataChange, 
  className,
  resumeId,
  initialZoom = 1,
  initialShowPreview = true,
  initialActiveSection = 'personalInfo',
}, ref) {
  const [activeSection, setActiveSection] = useState<SectionKey | 'summary'>(initialActiveSection as SectionKey | 'summary');
  const [saving, setSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [zoom, setZoom] = useState(initialZoom);
  const [showPreview, setShowPreview] = useState(initialShowPreview);
  const [mobilePreview, setMobilePreview] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const sectionEditorRef = useRef<HTMLDivElement | null>(null);

  // Sync with parent state changes
  useEffect(() => {
    setZoom(initialZoom);
  }, [initialZoom]);

  useEffect(() => {
    setShowPreview(initialShowPreview);
  }, [initialShowPreview]);

  useEffect(() => {
    setActiveSection(initialActiveSection as SectionKey | 'summary');
  }, [initialActiveSection]);

  // handleExport needs to be defined before useImperativeHandle
  const handleExport = useCallback(async () => {
    try {
      // Increment download count
      const res = await fetch(`/api/resumes/${resumeId}/download`, { method: 'POST' });
      if (!res.ok) {
        // non-blocking; continue export even if count fails
        console.warn('Download counter failed');
      }

      toast.loading('Generating professional PDF...', { id: 'export-pdf' });
      
      // Find the export container with proper A4 formatting
      const exportContainer = document.querySelector('[data-export-container="true"]');
      if (!exportContainer) {
        throw new Error('Preview not ready');
      }

      // Use html2canvas to capture the actual rendered template
      const { exportElementToPDF } = await import('@/lib/export/pdf-export');
      const filename = `${resumeData.content?.personalInfo?.fullName || resumeData.title || 'resume'}.pdf`
        .replace(/\s+/g, '_');
      
      console.log('📸 Capturing A4 preview for PDF export');
      await exportElementToPDF(exportContainer as HTMLElement, filename);
      
      toast.success('PDF downloaded successfully!', { 
        id: 'export-pdf',
        duration: 3000 
      });
    } catch (e) {
      console.error('Export failed:', e);
      toast.error('Failed to export resume. Please try again.', { id: 'export-pdf' });
    }
  }, [resumeId, resumeData.title, resumeData]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleExport,
    setActiveSection: (section: string) => {
      setActiveSection(section as SectionKey | 'summary');
      // Smooth scroll to section editor
      setTimeout(() => {
        sectionEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    },
    setZoom: (newZoom: number) => {
      setZoom(newZoom);
    },
    setShowPreview: (show: boolean) => {
      setShowPreview(show);
    },
  }), [handleExport]);

  // Calculate completion stats with defensive checks
  const calculateCompletion = (section: string): number => {
    // Guard against undefined content
    if (!resumeData || !resumeData.content) return 0;
    
    const data = resumeData.content[section as keyof typeof resumeData.content];
    if (!data) return 0;
    
    if (section === 'personalInfo') {
      const fields: (keyof PersonalInfo)[] = ['name', 'email', 'phone', 'location'];
      const filled = fields.filter(field => {
        const value = (data as PersonalInfo)[field];
        return typeof value === 'string' && value.trim();
      }).length;
      return Math.round((filled / fields.length) * 100);
    }
    
    if (Array.isArray(data)) {
      return data.length > 0 ? 80 : 0;
    }
    
    return 50;
  };

  const completionStats = {
    personalInfo: calculateCompletion('personalInfo'),
    summary: resumeData?.content?.personalInfo?.summary ? 100 : 0,
    workExperience: calculateCompletion('workExperience'),
    education: calculateCompletion('education'),
    skills: calculateCompletion('skills'),
    projects: calculateCompletion('projects') || 0,
    certifications: calculateCompletion('certifications') || 0,
    languages: calculateCompletion('languages') || 0,
    interests: calculateCompletion('interests') || 0,
  };

  // Calculate overall completion percentage
  const overallCompletion = Math.round(
    Object.values(completionStats).reduce((acc, val) => acc + val, 0) / Object.values(completionStats).length
  );

  // Calculate required fields
  const requiredFields = [
    {
      id: 'name',
      label: 'Full Name',
      isFilled: !!(resumeData?.content?.personalInfo?.name?.trim()),
      section: 'Personal Info'
    },
    {
      id: 'email',
      label: 'Email Address',
      isFilled: !!(resumeData?.content?.personalInfo?.email?.trim()),
      section: 'Personal Info'
    }
  ];

  // Auto-save with debouncing
  const saveResume = useCallback(async (data: ResumeData) => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.title,
            data: data.content,
            templateId: data.templateId,
          }),
        });

        if (response.ok) {
          toast.success('Resume saved automatically', {
            duration: 2000,
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Save failed:', { status: response.status, error: errorData });
          throw new Error(errorData.error || 'Save failed');
        }
      } catch (error) {
        console.error('Save failed:', error);
        toast.error('Failed to save resume');
      } finally {
        setSaving(false);
      }
    }, 1000);
  }, [resumeId]);

  const handleDataChange = (newData: ResumeData) => {
    onDataChange(newData);
    saveResume(newData);
  };

  const handleSectionChange = (section: string, field: string, value: unknown) => {
    // Guard: Ensure resumeData and content exist
    if (!resumeData || !resumeData.content) {
      console.warn('handleSectionChange: resumeData.content is undefined');
      return;
    }

    const sectionKey = section as SectionKey;
    const updatedContentSection =
      field === '__replace__'
        ? (value as unknown)
        : {
            ...(resumeData.content[sectionKey] as Record<string, unknown> | undefined),
            [field]: value,
          };

    const updatedData = {
      ...resumeData,
      content: {
        ...resumeData.content,
        [sectionKey]: updatedContentSection as Record<string, unknown>,
      },
    };
    handleDataChange(updatedData);
  };

  const handleManualSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resumeData.title,
          data: resumeData.content,
          templateId: resumeData.templateId,
        }),
      });

      if (response.ok) {
        toast.success('Resume saved successfully!');
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className={cn("h-screen w-full relative z-10 text-white", className)}>
      {/* Floating Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40"
      >
        <Toolbar
          onTemplateChange={() => setShowTemplateSelector(true)}
          onSave={handleManualSave}
          onExport={handleExport}
          onPreview={() => setMobilePreview(v => !v)}
          onZoomIn={() => setZoom(z => Math.min(2, parseFloat((z + 0.1).toFixed(2))))}
          onZoomOut={() => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))))}
          onZoomReset={() => setZoom(1)}
          zoom={zoom}
          isSaving={saving}
        />
      </motion.div>

      {/* Modern Main Layout */}
      <div className="flex flex-col h-full pt-20">
        {/* Horizontal Section Tabs - Modern Design */}
        <div className="w-full bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-800/50 sticky top-20 z-30">
          <div className="w-full px-6">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent py-4 pb-2">
              {[
                { id: 'personalInfo', label: 'Personal Info', icon: '👤', completion: completionStats.personalInfo },
                { id: 'summary', label: 'Summary', icon: '📝', completion: completionStats.summary },
                { id: 'workExperience', label: 'Experience', icon: '💼', completion: completionStats.workExperience },
                { id: 'education', label: 'Education', icon: '🎓', completion: completionStats.education },
                { id: 'skills', label: 'Skills', icon: '⚡', completion: completionStats.skills },
                { id: 'projects', label: 'Projects', icon: '🚀', completion: completionStats.projects },
                { id: 'certifications', label: 'Certifications', icon: '🏆', completion: completionStats.certifications },
                { id: 'languages', label: 'Languages', icon: '🌍', completion: completionStats.languages },
                { id: 'interests', label: 'Interests', icon: '❤️', completion: completionStats.interests },
              ].map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as SectionKey | 'summary')}
                  className={cn(
                    "relative px-5 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 flex-shrink-0",
                    activeSection === section.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/70 hover:text-white"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-base">{section.icon}</span>
                  <span className="text-sm">{section.label}</span>
                  {section.completion > 50 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 bg-green-400 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Left: Form Editor */}
            <div className="flex-1 h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto p-8">
                {/* Progress Indicators */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 space-y-4"
                >
                  {/* Overall Progress */}
                  <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-neutral-300">Overall Progress</h3>
                      <span className="text-2xl font-bold text-indigo-400">{overallCompletion}%</span>
                    </div>
                    <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallCompletion}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Required Fields */}
                  {requiredFields.some(f => !f.isFilled) && (
                    <div className="bg-orange-900/20 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/30">
                      <div className="flex items-center gap-2 text-orange-300">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {requiredFields.filter(f => !f.isFilled).length} required fields remaining
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Section Editor */}
                <motion.div
                  ref={sectionEditorRef}
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-neutral-900/30 backdrop-blur-sm rounded-2xl p-8 border border-neutral-800/50"
                >
                  <SectionEditor
                    activeSection={activeSection}
                    resumeData={resumeData}
                    onDataChange={handleSectionChange}
                  />
                </motion.div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <AnimatePresence>
              {showPreview && (
                <motion.div 
                  initial={{ opacity: 0, x: 20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hidden md:flex flex-1 h-full overflow-y-auto bg-neutral-900/50"
                >
              <div className="w-full flex justify-center p-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="w-full max-w-[800px]"
                >
                  <LivePreview 
                    ref={previewRef}
                    resumeData={resumeData} 
                    zoom={zoom}
                    templateId={resumeData?.templateId || 'modern'}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Preview Overlay */}
      <AnimatePresence>
        {mobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm"
            >
              <LivePreview 
                ref={previewRef}
                resumeData={resumeData}
                zoom={0.8}
                templateId={resumeData?.templateId || 'modern'}
              />
              <Button 
                className="absolute -top-12 right-0 bg-neutral-900 text-white border border-neutral-800"
                size="sm"
                onClick={() => setMobilePreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Selector Overlay */}
      <AnimatePresence>
        {showTemplateSelector && (
          <TemplateSelector
            isOpen={showTemplateSelector}
            currentTemplateId={resumeData?.templateId || 'modern'}
            onClose={() => setShowTemplateSelector(false)}
            onSelect={(template) => {
              handleDataChange({ ...resumeData, templateId: template._id });
              setShowTemplateSelector(false);
            }}
            allowedTemplates={[
              'azurill',
              'chikorita', 
              'gengar',
              'onyx',
              'pikachu',
            ]}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

export default EditorLayout;