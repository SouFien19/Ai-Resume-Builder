"use client";

import { memo, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { User, Globe } from "lucide-react";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  photoUrl: string;
}

export type ContactFieldErrors = Partial<{
  name: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
}>;

interface ContactStepProps {
  personal: PersonalInfo;
  setPersonal: (personal: PersonalInfo) => void;
  errors?: ContactFieldErrors;
  showValidation?: boolean;
}

const ContactStep = memo(function ContactStep({ personal, setPersonal, errors, showValidation }: ContactStepProps) {
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.currentTarget;
    const file = inputElement.files?.[0];
    if (!file) return;
    setPreviewError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/uploads/photo', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        setPersonal({ ...personal, photoUrl: data.url });
        setPreviewError(null);
      } else {
        setPreviewError('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      setPreviewError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // clear input value so the same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      } else {
        inputElement.value = '';
      }
    }
  };

  const removePhoto = () => {
    setPersonal({ ...personal, photoUrl: '' });
    setPreviewError(null);
  };

  const handleReplacePhoto = () => {
    fileInputRef.current?.click();
  };

  const photoInitials = useMemo(() => {
    const initials = personal.name?.trim().split(' ').map(part => part[0]?.toUpperCase()).filter(Boolean) ?? [];
    return initials.slice(0, 2).join('') || personal.email?.[0]?.toUpperCase() || 'U';
  }, [personal.email, personal.name]);

  const shouldShowNameError = Boolean(errors?.name && (showValidation || personal.name.trim().length > 0));
  const shouldShowEmailError = Boolean(errors?.email && (showValidation || personal.email.trim().length > 0));
  const shouldShowPhoneError = Boolean(errors?.phone && personal.phone.trim().length > 0);
  const shouldShowWebsiteError = Boolean(errors?.website && (showValidation || personal.website.trim().length > 0));
  const shouldShowLinkedInError = Boolean(errors?.linkedin && (showValidation || personal.linkedin.trim().length > 0));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-6"
    >
      {/* Essential Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <User className="h-4 w-4 text-green-400" />
          </div>
          <span className="text-sm font-semibold text-white">Essential Information</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">Full Name *</label>
            <motion.div whileFocus={{ scale: 1.02 }}>
              <Input 
                value={personal.name} 
                onChange={e => setPersonal({ ...personal, name: e.target.value })} 
                placeholder="John Doe"
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all duration-300"
              />
            </motion.div>
            {shouldShowNameError && <p className="text-xs text-red-300">{errors?.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">Email Address *</label>
            <motion.div whileFocus={{ scale: 1.02 }}>
              <Input 
                type="email" 
                value={personal.email} 
                onChange={e => setPersonal({ ...personal, email: e.target.value })} 
                placeholder="john@example.com"
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all duration-300"
              />
            </motion.div>
            {shouldShowEmailError && <p className="text-xs text-red-300">{errors?.email}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">Phone Number</label>
            <motion.div whileFocus={{ scale: 1.02 }}>
              <Input 
                value={personal.phone} 
                onChange={e => setPersonal({ ...personal, phone: e.target.value })} 
                placeholder="+1 (555) 123-4567"
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300"
              />
            </motion.div>
            {shouldShowPhoneError && <p className="text-xs text-red-300">{errors?.phone}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">Location</label>
            <motion.div whileFocus={{ scale: 1.02 }}>
              <Input 
                value={personal.location} 
                onChange={e => setPersonal({ ...personal, location: e.target.value })} 
                placeholder="City, Country"
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300"
              />
            </motion.div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold text-white">Upload Photo (optional)</label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <motion.div whileFocus={{ scale: 1.02 }} className="flex-1">
                  <Input 
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onFileChange}
                    disabled={uploading}
                    className="bg-neutral-800/50 border-neutral-600 text-white file:text-white file:bg-neutral-700 file:border-0"
                  />
                </motion.div>
                {uploading && <span className="text-xs text-neutral-400">Uploading…</span>}
                {!uploading && personal.photoUrl && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleReplacePhoto}
                      className="text-blue-300 hover:text-blue-200 underline"
                    >
                      Change
                    </button>
                    <span className="text-neutral-600">•</span>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-red-300 hover:text-red-200 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              {personal.photoUrl ? (
                <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-neutral-700/70 bg-neutral-800/60">
                  <img
                    src={personal.photoUrl}
                    alt="Uploaded profile"
                    className="h-full w-full object-cover"
                    onError={() => setPreviewError('Unable to load image. Try another file or remove it.')}
                  />
                  {previewError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 text-[11px] text-red-300 px-2 text-center">
                      {previewError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-20 w-20 rounded-xl border border-dashed border-neutral-700/70 flex items-center justify-center bg-neutral-800/30 text-neutral-500 text-lg font-semibold">
                  {photoInitials}
                </div>
              )}
            </div>
            {previewError && !personal.photoUrl && (
              <p className="text-xs text-red-300">{previewError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Links */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <Globe className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-sm font-semibold text-white">Professional Links</span>
          <span className="text-xs text-neutral-500">(Optional)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">Personal Website</label>
            <motion.div whileFocus={{ scale: 1.02 }}>
              <Input 
                value={personal.website} 
                onChange={e => setPersonal({ ...personal, website: e.target.value })} 
                placeholder="https://yourname.com"
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-300"
              />
            </motion.div>
            {shouldShowWebsiteError && <p className="text-xs text-red-300">{errors?.website}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">LinkedIn Profile</label>
            <motion.div whileFocus={{ scale: 1.02 }}>
              <Input 
                value={personal.linkedin} 
                onChange={e => setPersonal({ ...personal, linkedin: e.target.value })} 
                placeholder="https://linkedin.com/in/username"
                className="bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-300"
              />
            </motion.div>
            {shouldShowLinkedInError && <p className="text-xs text-red-300">{errors?.linkedin}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ContactStep;