"use client";

/**
 * PhotoUpload Component
 * Handles professional photo upload with regional guidance
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Info, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResumeTemplate } from "@/lib/templates/template-types";

interface PhotoUploadProps {
  template: ResumeTemplate;
  onPhotoChange: (url: string | null) => void;
  onVisibilityChange?: (visible: boolean) => void;
  initialPhoto?: string | null;
  initialVisible?: boolean;
}

export const PhotoUpload = ({ 
  template, 
  onPhotoChange, 
  onVisibilityChange,
  initialPhoto = null,
  initialVisible = true 
}: PhotoUploadProps) => {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [photoVisible, setPhotoVisible] = useState(initialVisible);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoConfig = template._metadata.photo;

  // If template doesn't support photos
  if (!photoConfig.supported) {
    return (
      <div className="photo-not-supported bg-neutral-900 rounded-lg p-6 border border-neutral-800">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">This template doesn&apos;t include photos</h3>
            <p className="text-sm text-neutral-400 mb-3">
              <strong>{template._metadata.name}</strong> is optimized for {template._metadata.region === 'us-canadian' ? 'US/Canadian' : 'international'} markets 
              where resumes typically don&apos;t include photos.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300 font-medium mb-2">💡 Why no photo?</p>
              <ul className="text-xs text-blue-200/80 space-y-1.5">
                <li>✓ Better ATS (Applicant Tracking System) compatibility</li>
                <li>✓ Prevents potential unconscious bias</li>
                <li>✓ Focuses on your skills and experience</li>
                <li>✓ Standard practice in US/Canadian markets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPhoto(url);
        setPhotoVisible(true);
        onPhotoChange(url);
        if (onVisibilityChange) onVisibilityChange(true);
        toast.success('✓ Photo uploaded successfully!');
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (photoConfig.required) {
      toast.error('Photo is required for this template');
      return;
    }
    
    setPhoto(null);
    setPhotoVisible(false);
    onPhotoChange(null);
    if (onVisibilityChange) onVisibilityChange(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Photo removed');
  };

  const handleToggleVisibility = () => {
    if (photoConfig.required) {
      toast.error('Photo is required for this template');
      return;
    }
    
    const newVisibility = !photoVisible;
    setPhotoVisible(newVisibility);
    if (onVisibilityChange) onVisibilityChange(newVisibility);
    toast.success(newVisibility ? 'Photo will appear in resume' : 'Photo hidden from resume');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Regional guidance
  const getRegionalGuidance = () => {
    const region = template._metadata.region;
    
    if (region === 'european') {
      return {
        title: '🇪🇺 European CV Standard',
        description: 'Professional photos are standard and often expected in European CVs',
        tips: [
          'Professional headshot with neutral background',
          'Business attire (suit or professional dress)',
          'Clear face visibility, front-facing',
          'Recent photo (within 6 months)',
          'High resolution (at least 600x600px)'
        ],
        required: true
      };
    } else if (region === 'asia-pacific') {
      return {
        title: '🌏 Asia-Pacific Format',
        description: 'Photos are commonly included in resumes across Asia-Pacific markets',
        tips: [
          'Professional studio-quality photo preferred',
          'Formal business attire required',
          'Passport-style or professional headshot',
          'Light-colored background recommended',
          'Ensure photo meets local standards'
        ],
        required: false
      };
    } else if (region === 'uk') {
      return {
        title: '🇬🇧 UK CV Guidelines',
        description: 'Photos are optional in UK CVs - use based on industry preference',
        tips: [
          'Creative industries: Professional photo acceptable',
          'Corporate/Finance: Generally omit photo',
          'If included: Professional headshot only',
          'Avoid casual photos',
          'Consider employer expectations'
        ],
        required: false
      };
    } else {
      return {
        title: '🌍 International Format',
        description: 'Photo optional - check regional and industry norms',
        tips: [
          'Professional headshot if included',
          'Business formal attire',
          'Neutral background',
          'High-quality image',
          'Research target market standards'
        ],
        required: false
      };
    }
  };

  const guidance = getRegionalGuidance();

  // Empty state - no photo uploaded
  if (!photo) {
    return (
      <div className="photo-upload-empty">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload photo"
        />

        <div className="bg-neutral-900 rounded-lg p-6 border-2 border-dashed border-neutral-700 hover:border-pink-500/50 transition-all">
          {/* Upload Area */}
          <div 
            onClick={handleUploadClick}
            onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
            role="button"
            tabIndex={0}
            className="cursor-pointer text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-800 mb-4">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent" />
              ) : (
                <Camera className="h-8 w-8 text-neutral-400" />
              )}
            </div>
            
            <h3 className="text-white font-semibold text-lg mb-2">
              {photoConfig.required ? 'Add Professional Photo (Required)' : 'Add Professional Photo (Optional)'}
            </h3>
            
            <p className="text-sm text-neutral-400 mb-4">
              Click to upload or drag and drop
            </p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-3">
              <span>JPG, PNG or WebP</span>
              <span>•</span>
              <span>Max 5MB</span>
              <span>•</span>
              <span>600x600px recommended</span>
            </div>

            <Button 
              variant="outline" 
              className="gap-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Choose Photo'}
            </Button>
          </div>

          {/* Regional Guidance */}
          <div className={`rounded-lg p-4 ${
            photoConfig.required 
              ? 'bg-yellow-500/10 border border-yellow-500/30' 
              : 'bg-neutral-800/50 border border-neutral-700'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              {photoConfig.required ? (
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className={`font-medium mb-1 ${
                  photoConfig.required ? 'text-yellow-300' : 'text-white'
                }`}>
                  {guidance.title}
                </h4>
                <p className="text-sm text-neutral-300 mb-3">
                  {guidance.description}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 ml-8">
              {guidance.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-neutral-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Photo uploaded state
  return (
    <div className="photo-uploaded bg-neutral-900 rounded-lg p-6 border border-neutral-800">
      <div className="flex items-start gap-6">
        {/* Photo Preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={photoVisible ? 'visible' : 'hidden'}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative flex-shrink-0"
          >
            <div 
              className={`w-32 h-32 rounded-lg overflow-hidden border-2 transition-all ${
                photoVisible 
                  ? 'border-green-500/50' 
                  : 'border-neutral-600'
              }`}
              style={{ opacity: photoVisible ? 1 : 0.4, position: 'relative' }}
            >
              <Image
                src={photo}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            {/* Visibility Badge */}
            <div className={`absolute -top-2 -right-2 rounded-full p-1.5 ${
              photoVisible 
                ? 'bg-green-500' 
                : 'bg-neutral-600'
            }`}>
              {photoVisible ? (
                <Eye className="h-4 w-4 text-white" />
              ) : (
                <EyeOff className="h-4 w-4 text-white" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Photo Info & Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold mb-1">Professional Photo</h3>
              <p className="text-sm text-neutral-400">
                {photoVisible 
                  ? '✓ Photo will appear in your resume' 
                  : '⚠️ Photo is hidden (not in resume)'}
              </p>
            </div>
            
            {photoConfig.required && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                  <AlertCircle className="h-3 w-3" />
                  Required
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              className="gap-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              Replace
            </Button>

            {!photoConfig.required && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleVisibility}
                  className="gap-2"
                >
                  {photoVisible ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="gap-2 text-red-400 hover:text-red-300 hover:border-red-400"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
            <p className="text-xs text-neutral-400 font-medium mb-2">
              📋 Photo Quality Checklist:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Professional attire</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Neutral background</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Clear face</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Good lighting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
