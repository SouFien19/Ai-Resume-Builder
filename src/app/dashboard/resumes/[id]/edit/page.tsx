"use client";

import { useEffect, useRef, useState, use, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import EditorLayout, { EditorLayoutRef } from "./components/EditorLayout";
import { ResumeData } from "@/types/resume";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useLocalStorageBackup } from "@/hooks/useLocalStorageBackup";
import { EditorErrorBoundary } from "@/components/editor/EditorErrorBoundary";
import { CommandPalette, useResumeEditorCommands } from "@/components/editor/CommandPalette";
import { EditorSkeleton } from "@/components/editor/EditorSkeleton";
import { SaveSuccessIndicator } from "@/components/editor/SaveSuccessIndicator";

// Enhanced loading states
type LoadingState = 'idle' | 'loading' | 'saving' | 'error' | 'success';

// Error types for better error handling
interface ResumeError {
  type: 'network' | 'parse' | 'permission' | 'notFound';
  message: string;
  details?: string;
}

// Page variants for smooth transitions
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.25, 0, 1] as const,
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.98,
    transition: { duration: 0.3 }
  }
};

function EditResumePageContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  // Enhanced state management with undo/redo
  const {
    state: resumeData,
    setState: setResumeData,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo<ResumeData>({
    initialState: {
      title: "New Resume",
      content: {
        personalInfo: {},
        workExperience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
      },
    },
    maxHistory: 50,
  });
  
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<ResumeError | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isFirstSave, setIsFirstSave] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('personalInfo');
  const [showPreview, setShowPreview] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const isInitialLoadRef = useRef(true);
  const editorLayoutRef = useRef<EditorLayoutRef>(null);
  
  // LocalStorage backup
  const { loadBackup, clearBackup, hasBackup } = useLocalStorageBackup({
    key: `resume-draft-${resolvedParams.id}`,
    data: resumeData,
    enabled: loadingState !== 'loading',
  });

  // Enhanced data fetching with error handling and retries
  const fetchResumeData = useCallback(async (retryCount = 0): Promise<void> => {
    try {
      setLoadingState('loading');
      setError(null);
      
      const response = await fetch(`/api/resumes/${resolvedParams.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const doc = await response.json();
      const resume = doc?.data ?? doc;

      if (!resume || typeof resume !== 'object') {
        throw new Error('Resume response missing data payload');
      }

      // Enhanced data mapping with validation
      console.log('📦 Fetched resume data:', resume);
      console.log('📋 Template ID:', resume.templateId);
      console.log('📝 Resume content:', resume.data);
      
      const mapped: ResumeData = {
        _id: resume._id,
        title: resume.name || "Untitled Resume",
        templateId: resume.templateId || 'azurill',
        content: {
          personalInfo: resume.data?.personalInfo || {},
          workExperience: resume.data?.workExperience || [],
          education: resume.data?.education || [],
          skills: resume.data?.skills || [],
          projects: resume.data?.projects || [],
          certifications: resume.data?.certifications || [],
          languages: resume.data?.languages || [],
          interests: resume.data?.interests || [],
        },
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };
      
      console.log('✅ Mapped resume data:', mapped);
      console.log('🎨 Mapped template ID:', mapped.templateId);
      
      // Use reset instead of setState to avoid undo/redo issues
      resetHistory(mapped); // This sets history to [mapped] with index 0
      
      setLoadingState('idle');
      setIsDataLoaded(true);
      retryCountRef.current = 0;
      
      // Check for backup on initial load only
      if (isInitialLoadRef.current) {
        const backupExists = hasBackup();
        if (backupExists) {
          const backup = loadBackup();
          if (backup.data && backup.timestamp) {
            const backupAge = Date.now() - backup.timestamp;
            // Only show restore prompt if backup is newer and less than 24 hours old
            if (backupAge < 86400000 && backup.timestamp > new Date(mapped.updatedAt || 0).getTime()) {
              toast.info("Draft found. Would you like to restore it?", {
                duration: 10000,
                action: {
                  label: "Restore",
                  onClick: () => {
                    setResumeData(backup.data!);
                    resetHistory(backup.data!);
                    toast.success("Draft restored successfully");
                  }
                }
              });
            }
          }
        }
        isInitialLoadRef.current = false;
      }
      
    } catch (error) {
      console.error("Failed to fetch resume:", error);
      
      // Enhanced error handling
      const resumeError: ResumeError = {
        type: 'network',
        message: 'Failed to load resume',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
      
      if (retryCount < maxRetries) {
        retryCountRef.current = retryCount + 1;
        
        toast.error(`Loading failed. Retrying... (${retryCount + 1}/${maxRetries})`, {
          duration: 2000,
        });
        
        // Exponential backoff retry
        setTimeout(() => {
          fetchResumeData(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
        
      } else {
        setError(resumeError);
        setLoadingState('error');
        
        toast.error("Failed to load resume after multiple attempts", {
          duration: 5000,
          action: {
            label: "Retry",
            onClick: () => fetchResumeData(0)
          }
        });
      }
    }
  }, [resolvedParams.id]);

  // Enhanced auto-save with optimistic updates
  const saveResumeData = useCallback(async (data: ResumeData) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        setLoadingState('saving');
        setHasUnsavedChanges(false);
        
        console.log('💾 Saving resume:', {
          title: data.title,
          templateId: data.templateId,
          contentKeys: Object.keys(data.content || {}),
          languagesCount: data.content?.languages?.length || 0,
          interestsCount: data.content?.interests?.length || 0,
        });
        
        const response = await fetch(`/api/resumes/${resolvedParams.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.title,
            data: data.content,
            templateId: data.templateId,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Save failed:', { status: response.status, statusText: response.statusText, error: errorData });
          throw new Error(`Save failed: ${errorData.error || response.statusText}`);
        }
        
        setLoadingState('success');
        
        // Show subtle success indicator
        toast.success("Auto-saved", {
          duration: 1500,
          icon: <Save className="h-4 w-4" />
        });
        
        // Return to idle state after brief success indication
        setTimeout(() => setLoadingState('idle'), 1000);
        
      } catch (error) {
        console.error("Failed to save resume:", error);
        setHasUnsavedChanges(true);
        setLoadingState('error');
        
        toast.error("Failed to save changes", {
          duration: 4000,
          action: {
            label: "Retry",
            onClick: () => saveResumeData(data)
          }
        });
        
        // Return to idle state after error
        setTimeout(() => setLoadingState('idle'), 2000);
      }
    }, 800); // Slightly longer debounce for better UX
  }, [resolvedParams.id]);

  // Manual save handler
  const handleManualSave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    await saveResumeData(resumeData);
    clearBackup(); // Clear draft after manual save
  }, [resumeData, saveResumeData, clearBackup]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    enabled: loadingState !== 'loading',
    shortcuts: [
      {
        key: 's',
        ctrlKey: true,
        callback: (e) => {
          e.preventDefault();
          handleManualSave();
          toast.success("Saved manually", { duration: 1500 });
        },
        preventDefault: true,
      },
      {
        key: 'z',
        ctrlKey: true,
        callback: () => {
          if (canUndo) {
            undo();
            toast.info("Undone", { duration: 1000 });
          }
        },
        preventDefault: true,
      },
      {
        key: 'y',
        ctrlKey: true,
        callback: () => {
          if (canRedo) {
            redo();
            toast.info("Redone", { duration: 1000 });
          }
        },
        preventDefault: true,
      },
      {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        callback: () => {
          if (canRedo) {
            redo();
            toast.info("Redone", { duration: 1000 });
          }
        },
        preventDefault: true,
      },
    ],
  });

  useEffect(() => {
    // Only fetch on initial mount
    fetchResumeData();
  }, []);

  // Auto-export when autoExport=true in URL
  useEffect(() => {
    if (loadingState !== 'idle' || !isDataLoaded) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoExport') === 'true') {
      // Remove the parameter to prevent re-triggering
      window.history.replaceState({}, '', window.location.pathname);
      
      // Trigger export after a brief delay to ensure rendering
      setTimeout(() => {
        if (editorLayoutRef.current?.handleExport) {
          console.log('🚀 Auto-exporting PDF from edit page');
          editorLayoutRef.current.handleExport();
        }
      }, 1500);
    }
  }, [loadingState, isDataLoaded]);

  // Enhanced data change handler with change detection
  const handleDataChange = useCallback((newData: ResumeData) => {
    // Guard: Ensure content exists before updating
    if (!newData || !newData.content) {
      console.warn('handleDataChange: newData.content is undefined, skipping update');
      return;
    }
    
    setResumeData(newData);
    setHasUnsavedChanges(true);
    saveResumeData(newData);
  }, [setResumeData, saveResumeData]);

  // Command palette handlers
  const handleExport = useCallback(async () => {
    if (editorLayoutRef.current?.handleExport) {
      await editorLayoutRef.current.handleExport();
    } else {
      toast.error('Export not ready. Please wait for the editor to load.');
    }
  }, []);

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: resumeData?.title || 'My Resume',
      text: 'Check out my professional resume',
      url: shareUrl,
    };

    try {
      // Try native Web Share API first (mobile friendly)
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard! Share it with others.');
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error('Failed to share');
      }
    }
  }, [resumeData?.title]);

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section);
    
    // Call EditorLayout to change the active section (which will scroll automatically)
    if (editorLayoutRef.current?.setActiveSection) {
      editorLayoutRef.current.setActiveSection(section);
      
      const sectionNames: Record<string, string> = {
        personalInfo: 'Personal Info',
        summary: 'Summary',
        workExperience: 'Work Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Projects',
        certifications: 'Certifications',
      };
      
      toast.success(`Navigated to ${sectionNames[section] || section}`);
    }
  }, []);

  const handleTogglePreview = useCallback(() => {
    setShowPreview(prev => {
      const newState = !prev;
      if (editorLayoutRef.current?.setShowPreview) {
        editorLayoutRef.current.setShowPreview(newState);
      }
      toast.success(newState ? 'Preview shown' : 'Preview hidden');
      return newState;
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => {
      const newZoom = Math.min(2, parseFloat((prevZoom + 0.1).toFixed(2)));
      if (editorLayoutRef.current?.setZoom) {
        editorLayoutRef.current.setZoom(newZoom);
      }
      toast.success(`Zoom: ${Math.round(newZoom * 100)}%`);
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => {
      const newZoom = Math.max(0.5, parseFloat((prevZoom - 0.1).toFixed(2)));
      if (editorLayoutRef.current?.setZoom) {
        editorLayoutRef.current.setZoom(newZoom);
      }
      toast.success(`Zoom: ${Math.round(newZoom * 100)}%`);
      return newZoom;
    });
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Command palette groups
  const commandGroups = useResumeEditorCommands({
    onSave: handleManualSave,
    onExport: handleExport,
    onShare: handleShare,
    onNavigate: handleNavigate,
    onUndo: undo,
    onRedo: redo,
    onTogglePreview: handleTogglePreview,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onCopy: handleCopy,
    onPrint: handlePrint,
    canUndo,
    canRedo,
  });

  // Trigger success indicator on save
  useEffect(() => {
    if (loadingState === 'success') {
      setShowSaveSuccess(true);
      if (isFirstSave) {
        setIsFirstSave(false);
      }
    }
  }, [loadingState, isFirstSave]);

  // Enhanced loading screen with skeleton UI
  if (loadingState === 'loading' || !isDataLoaded) {
    return <EditorSkeleton />;
  }

  // Enhanced error screen with recovery options
  if (loadingState === 'error' && error) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center space-y-6 max-w-md p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {error.message}
            </h3>
            {error.details && (
              <p className="text-neutral-400 text-sm mb-4">
                {error.details}
              </p>
            )}
            {error.details?.includes('404') && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-left">
                <p className="text-sm text-yellow-200 mb-2">
                  <strong>💡 This usually means:</strong>
                </p>
                <ul className="text-xs text-yellow-200/80 space-y-1 ml-4">
                  <li>• The resume was not created successfully</li>
                  <li>• You&apos;re trying to access someone else&apos;s resume</li>
                  <li>• The resume ID in the URL is incorrect</li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 justify-center">
            <motion.button
              onClick={() => window.location.href = '/dashboard/resumes'}
              className="px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back to Dashboard
            </motion.button>
            <motion.button
              onClick={() => fetchResumeData(0)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Main editor with enhanced animations and status indicators
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 relative overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Background Elements matching create page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/8 to-purple-500/8 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-cyan-500/8 to-blue-500/8 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      {/* Floating save indicator */}
      <AnimatePresence>
        {(loadingState === 'saving' || hasUnsavedChanges) && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            role="status"
            aria-live="polite"
          >
            <div className={`px-4 py-2 rounded-full backdrop-blur-sm border flex items-center space-x-2 ${
              loadingState === 'saving' 
                ? 'bg-blue-500/20 border-blue-400/30 text-blue-200' 
                : 'bg-orange-500/20 border-orange-400/30 text-orange-200'
            }`}>
              {loadingState === 'saving' ? (
                <>
                  <Loader2 className="w-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success indicator - New Component */}
      <SaveSuccessIndicator 
        show={showSaveSuccess} 
        isFirstSave={isFirstSave}
        onComplete={() => setShowSaveSuccess(false)}
      />

      {/* Command Palette */}
      <CommandPalette 
        groups={commandGroups}
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
      />

      {/* Main editor content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isDataLoaded && resumeData?.content ? (
          <EditorLayout
            ref={editorLayoutRef}
            resumeData={resumeData}
            onDataChange={handleDataChange}
            resumeId={resolvedParams.id}
            initialZoom={zoom}
            initialShowPreview={showPreview}
            initialActiveSection={activeSection}
            className="transition-all duration-300"
          />
        ) : null}
      </motion.div>
    </motion.div>
  );
}

// Wrap in error boundary for production-ready error handling
export default function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <EditorErrorBoundary>
      <EditResumePageContent params={params} />
    </EditorErrorBoundary>
  );
}
