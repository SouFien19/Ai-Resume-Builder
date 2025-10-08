"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateResume: (name: string) => Promise<void>;
}

export function CreateResumeDialog({ open, onOpenChange, onCreateResume }: CreateResumeDialogProps) {
  const [resumeName, setResumeName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    // Validation
    if (!resumeName.trim()) {
      setError("Please enter a resume name");
      return;
    }

    if (resumeName.trim().length < 3) {
      setError("Resume name must be at least 3 characters");
      return;
    }

    if (resumeName.trim().length > 50) {
      setError("Resume name must be less than 50 characters");
      return;
    }

    setError("");
    setIsCreating(true);

    try {
      await onCreateResume(resumeName.trim());
      // Reset state
      setResumeName("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create resume");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCreating) {
      handleCreate();
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setResumeName("");
      setError("");
      onOpenChange(false);
    }
  };

  // Suggested names for quick selection
  const suggestedNames = [
    "Software Engineer Resume",
    "Marketing Manager Resume",
    "Product Designer Resume",
    "Data Analyst Resume",
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50 text-white p-0 overflow-hidden">
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 p-6">
          <DialogHeader className="space-y-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50"
            >
              <FileText className="h-8 w-8 text-white" />
            </motion.div>

            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create New Resume
            </DialogTitle>

            <DialogDescription className="text-center text-neutral-400">
              Give your resume a name to get started. You&apos;ll choose a template next.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Resume Name Input */}
            <div className="space-y-2">
              <Label htmlFor="resumeName" className="text-sm font-semibold text-neutral-300">
                Resume Name <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="resumeName"
                  value={resumeName}
                  onChange={(e) => {
                    setResumeName(e.target.value);
                    setError("");
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Software Engineer Resume"
                  className={cn(
                    "w-full h-12 px-4 bg-neutral-800/50 backdrop-blur-sm border rounded-xl text-white placeholder:text-neutral-500 transition-all duration-200",
                    error 
                      ? "border-red-500/50 focus:ring-2 focus:ring-red-500/50" 
                      : "border-neutral-700/50 focus:ring-2 focus:ring-indigo-500/50"
                  )}
                  disabled={isCreating}
                  autoFocus
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: resumeName.length > 0 ? 1 : 0, scale: resumeName.length > 0 ? 1 : 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                </motion.div>
              </div>
              
              {/* Character Count */}
              <div className="flex items-center justify-between text-xs">
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-red-400 flex items-center gap-1"
                    >
                      ⚠️ {error}
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-500"
                    >
                      Enter a descriptive name for your resume
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className={cn(
                  "text-neutral-500",
                  resumeName.length > 45 && "text-orange-400",
                  resumeName.length > 50 && "text-red-400"
                )}>
                  {resumeName.length}/50
                </span>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-400">
                Quick Suggestions
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedNames.map((name) => (
                  <motion.button
                    key={name}
                    onClick={() => setResumeName(name)}
                    disabled={isCreating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 text-xs rounded-lg bg-neutral-800/50 border border-neutral-700/50 text-neutral-300 hover:bg-neutral-800 hover:border-indigo-500/50 hover:text-white transition-all duration-200 text-left"
                  >
                    {name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="bg-neutral-800/50 text-neutral-300 hover:bg-neutral-800 hover:text-white border-neutral-700/50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isCreating || !resumeName.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Continue to Templates
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
