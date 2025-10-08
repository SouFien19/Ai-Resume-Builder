"use client";

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { 
  Save, 
  Download, 
  Share2, 
  User, 
  Briefcase, 
  GraduationCap, 
  Zap, 
  FolderOpen, 
  Award,
  FileText,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Eye,
  Undo2,
  Redo2,
  Copy,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
  keywords?: string[];
}

interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

interface CommandPaletteProps {
  groups: CommandGroup[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ groups, open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const setOpen = useCallback((value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  }, [onOpenChange]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const handleSelect = useCallback((callback: () => void) => {
    callback();
    setOpen(false);
  }, [setOpen]);

  // Detect Mac
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          {/* Command Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <Command
              className={cn(
                "rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-xl shadow-2xl overflow-hidden",
                "ring-1 ring-white/10"
              )}
            >
              <div className="flex items-center border-b border-neutral-800 px-4">
                <Sparkles className="w-4 h-4 text-indigo-400 mr-3" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className={cn(
                    "flex h-14 w-full bg-transparent py-3 text-base outline-none",
                    "placeholder:text-neutral-500 text-white",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[10px] font-medium text-neutral-400">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-8 text-center text-sm text-neutral-500">
                  No results found.
                </Command.Empty>

                {groups.map((group, groupIndex) => (
                  <Command.Group
                    key={group.heading}
                    heading={group.heading}
                    className={cn(
                      groupIndex > 0 && "mt-2 pt-2 border-t border-neutral-800"
                    )}
                  >
                    <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {group.heading}
                    </div>
                    {group.items.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.label} ${item.keywords?.join(' ') || ''}`}
                        onSelect={() => handleSelect(item.onSelect)}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none",
                          "data-[selected=true]:bg-indigo-600 data-[selected=true]:text-white",
                          "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
                          "transition-colors duration-150"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex h-6 w-6 items-center justify-center">
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.shortcut && (
                          <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[10px] font-medium text-neutral-400 data-[selected=true]:border-white/20 data-[selected=true]:bg-white/10 data-[selected=true]:text-white">
                            {item.shortcut.replace('Ctrl', isMac ? '⌘' : 'Ctrl').replace('Shift', '⇧').replace('Alt', '⌥')}
                          </kbd>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              <div className="border-t border-neutral-800 px-4 py-3 text-xs text-neutral-500 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="h-4 px-1 bg-neutral-800 border border-neutral-700 rounded text-[10px]">↑</kbd>
                    <kbd className="h-4 px-1 bg-neutral-800 border border-neutral-700 rounded text-[10px]">↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="h-4 px-1.5 bg-neutral-800 border border-neutral-700 rounded text-[10px]">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="h-4 px-1.5 bg-neutral-800 border border-neutral-700 rounded text-[10px]">ESC</kbd>
                    <span>Close</span>
                  </div>
                </div>
                <div className="text-neutral-600">
                  Press <kbd className="px-1 bg-neutral-800 border border-neutral-700 rounded text-[10px]">{isMac ? '⌘' : 'Ctrl'}K</kbd> anytime
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Pre-built command groups for common actions
export function useResumeEditorCommands({
  onSave,
  onExport,
  onShare,
  onNavigate,
  onUndo,
  onRedo,
  onTogglePreview,
  onZoomIn,
  onZoomOut,
  onCopy,
  onPrint,
  canUndo = false,
  canRedo = false,
}: {
  onSave: () => void;
  onExport: () => void;
  onShare: () => void;
  onNavigate: (section: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCopy: () => void;
  onPrint: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}): CommandGroup[] {
  return [
    {
      heading: 'Actions',
      items: [
        {
          id: 'save',
          label: 'Save Resume',
          icon: <Save className="w-4 h-4" />,
          shortcut: 'Ctrl+S',
          onSelect: onSave,
          keywords: ['save', 'store', 'persist']
        },
        {
          id: 'export',
          label: 'Export as PDF',
          icon: <Download className="w-4 h-4" />,
          shortcut: 'Ctrl+E',
          onSelect: onExport,
          keywords: ['export', 'download', 'pdf', 'save as']
        },
        {
          id: 'share',
          label: 'Share Resume',
          icon: <Share2 className="w-4 h-4" />,
          shortcut: 'Ctrl+Shift+S',
          onSelect: onShare,
          keywords: ['share', 'link', 'collaborate']
        },
        {
          id: 'copy',
          label: 'Copy Resume Link',
          icon: <Copy className="w-4 h-4" />,
          onSelect: onCopy,
          keywords: ['copy', 'link', 'url']
        },
        {
          id: 'print',
          label: 'Print Resume',
          icon: <Printer className="w-4 h-4" />,
          shortcut: 'Ctrl+P',
          onSelect: onPrint,
          keywords: ['print', 'paper']
        },
      ]
    },
    {
      heading: 'Edit',
      items: [
        {
          id: 'undo',
          label: 'Undo',
          icon: <Undo2 className="w-4 h-4" />,
          shortcut: 'Ctrl+Z',
          onSelect: canUndo ? onUndo : () => {},
          keywords: ['undo', 'revert', 'back']
        },
        {
          id: 'redo',
          label: 'Redo',
          icon: <Redo2 className="w-4 h-4" />,
          shortcut: 'Ctrl+Y',
          onSelect: canRedo ? onRedo : () => {},
          keywords: ['redo', 'forward', 'repeat']
        },
      ]
    },
    {
      heading: 'Navigation',
      items: [
        {
          id: 'nav-personal',
          label: 'Go to Personal Info',
          icon: <User className="w-4 h-4" />,
          shortcut: 'Ctrl+1',
          onSelect: () => onNavigate('personalInfo'),
          keywords: ['personal', 'info', 'contact', 'name', 'email']
        },
        {
          id: 'nav-summary',
          label: 'Go to Summary',
          icon: <FileText className="w-4 h-4" />,
          shortcut: 'Ctrl+2',
          onSelect: () => onNavigate('summary'),
          keywords: ['summary', 'about', 'bio', 'description']
        },
        {
          id: 'nav-work',
          label: 'Go to Work Experience',
          icon: <Briefcase className="w-4 h-4" />,
          shortcut: 'Ctrl+3',
          onSelect: () => onNavigate('workExperience'),
          keywords: ['work', 'experience', 'job', 'career', 'employment']
        },
        {
          id: 'nav-education',
          label: 'Go to Education',
          icon: <GraduationCap className="w-4 h-4" />,
          shortcut: 'Ctrl+4',
          onSelect: () => onNavigate('education'),
          keywords: ['education', 'school', 'university', 'degree']
        },
        {
          id: 'nav-skills',
          label: 'Go to Skills',
          icon: <Zap className="w-4 h-4" />,
          shortcut: 'Ctrl+5',
          onSelect: () => onNavigate('skills'),
          keywords: ['skills', 'abilities', 'expertise', 'technologies']
        },
        {
          id: 'nav-projects',
          label: 'Go to Projects',
          icon: <FolderOpen className="w-4 h-4" />,
          shortcut: 'Ctrl+6',
          onSelect: () => onNavigate('projects'),
          keywords: ['projects', 'portfolio', 'work samples']
        },
        {
          id: 'nav-certs',
          label: 'Go to Certifications',
          icon: <Award className="w-4 h-4" />,
          shortcut: 'Ctrl+7',
          onSelect: () => onNavigate('certifications'),
          keywords: ['certifications', 'certificates', 'credentials', 'licenses']
        },
      ]
    },
    {
      heading: 'View',
      items: [
        {
          id: 'toggle-preview',
          label: 'Toggle Preview',
          icon: <Eye className="w-4 h-4" />,
          shortcut: 'Ctrl+P',
          onSelect: onTogglePreview,
          keywords: ['preview', 'view', 'show', 'hide']
        },
        {
          id: 'zoom-in',
          label: 'Zoom In',
          icon: <ZoomIn className="w-4 h-4" />,
          shortcut: 'Ctrl++',
          onSelect: onZoomIn,
          keywords: ['zoom', 'in', 'larger', 'bigger']
        },
        {
          id: 'zoom-out',
          label: 'Zoom Out',
          icon: <ZoomOut className="w-4 h-4" />,
          shortcut: 'Ctrl+-',
          onSelect: onZoomOut,
          keywords: ['zoom', 'out', 'smaller']
        },
      ]
    },
  ];
}
