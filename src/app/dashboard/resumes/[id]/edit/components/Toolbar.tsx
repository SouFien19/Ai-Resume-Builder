"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  Download, 
  Share2, 
  Palette, 
  ZoomIn, 
  ZoomOut, 
  Eye,
  Loader2
} from 'lucide-react';
import { KeyboardShortcutsButton } from '@/components/editor/KeyboardShortcutsButton';

interface ToolbarProps {
  onSave?: () => void;
  onTemplateChange?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  zoom?: number;
  isSaving?: boolean;
  className?: string;
}

export default function Toolbar({
  onSave,
  onTemplateChange,
  onShare,
  onExport,
  onPreview,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoom = 1,
  isSaving = false
}: ToolbarProps) {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-lg p-2 text-neutral-200">
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span 
          className="text-sm font-medium px-2 min-w-[50px] text-center"
          role="status"
          aria-label={`Current zoom level: ${Math.round(zoom * 100)} percent`}
        >
          {Math.round(zoom * 100)}%
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomReset}
          title="Reset zoom to 100%"
          aria-label="Reset zoom to 100%"
          className="text-xs px-2"
        >
          100%
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        {/* Separator */}
  <div className="w-px h-6 bg-neutral-700 mx-2" />
        
        {/* Template Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onTemplateChange}
          title="Change Template"
          aria-label="Change resume template"
        >
          <Palette className="h-4 w-4 mr-2" />
          Templates
        </Button>
        
        {/* Mobile Preview */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onPreview}
          title="Preview"
          aria-label="Preview resume"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        
        {/* Separator */}
  <div className="w-px h-6 bg-neutral-700 mx-2" role="separator" aria-orientation="vertical" />
        
        {/* Action Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          title="Share Resume"
          aria-label="Share resume with others"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          title="Export PDF"
          aria-label="Export resume as PDF"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        {/* Separator */}
  <div className="w-px h-6 bg-neutral-700 mx-2" role="separator" aria-orientation="vertical" />
        
        {/* Keyboard Shortcuts */}
        <KeyboardShortcutsButton />
        
        {/* Separator */}
  <div className="w-px h-6 bg-neutral-700 mx-2" role="separator" aria-orientation="vertical" />
        
        {/* Save Button */}
        <Button 
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-md transition-all duration-200 px-4"
          aria-label={isSaving ? "Saving resume" : "Save resume manually"}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}