"use client";

import { use, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/modern/page-header";
import LivePreview from "../edit/components/LivePreview";
import { ArrowLeft, Download } from "lucide-react";
import { logger } from "@/lib/logger";
import { ResumeContent } from "@/types/resume";
import { exportElementToPDF } from "@/lib/export/pdf-export";

interface ResumeDocument {
  _id: string;
  name: string;
  templateId: string;
  data: ResumeContent;
}

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [resume, setResume] = useState<ResumeDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoDownloadTriggered, setAutoDownloadTriggered] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Auto-download handler - opens print dialog automatically
  useEffect(() => {
    if (!resume || autoDownloadTriggered) return;
    
    // Check if autoDownload parameter is in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoDownload') === 'true') {
      setAutoDownloadTriggered(true);
      
      // Trigger print dialog after a brief delay to ensure rendering is complete
      setTimeout(async () => {
        try {
          toast.loading("Opening print dialog...", { id: 'auto-download' });
          
          // Wait for rendering to complete
          await new Promise(resolve => requestAnimationFrame(resolve));
          await new Promise(resolve => requestAnimationFrame(resolve));
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find the visible preview wrapper (not the hidden ref)
          const previewWrapper = document.querySelector('.aspect-\\[210\\/297\\]')?.parentElement as HTMLElement;
          
          if (!previewWrapper) {
            throw new Error('Preview not ready - could not find preview wrapper');
          }
          
          console.log('🔍 Auto-download: Found preview wrapper', {
            hasElement: !!previewWrapper,
            innerHTML: previewWrapper.innerHTML.substring(0, 200),
            children: previewWrapper.children.length
          });
          
          // Use the native print dialog (most reliable)
          const { exportElementToPDFNative } = await import('@/lib/export/pdf-export');
          const filename = `${resume.name || 'resume'}.pdf`.replace(/\s+/g, '_');
          await exportElementToPDFNative(previewWrapper, filename);
          
          toast.success("Print dialog opened! Save as PDF.", {
            id: 'auto-download',
            duration: 5000
          });
          
          // Increment download counter
          await fetch(`/api/resumes/${resolvedParams.id}/download`, { method: 'POST' });
        } catch (error) {
          logger.error('Auto-download failed', { error });
          toast.error("Could not open print dialog", {
            id: 'auto-download',
            description: "Please use the Download button.",
          });
        }
      }, 1500);
    }
  }, [resume, autoDownloadTriggered, resolvedParams.id]);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        logger.info('Fetching resume for preview', { resumeId: resolvedParams.id });
        const response = await fetch(`/api/resumes/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch resume');
        }
        
        const data = await response.json();
        
        // Debug logging to console
        console.log('📄 Preview Page - Raw API Response:', data);
        console.log('📊 Resume Data Structure:', {
          hasData: !!data.data,
          dataKeys: data.data ? Object.keys(data.data) : [],
          personalInfo: data.data?.personalInfo,
          workExperience: data.data?.workExperience?.length || 0,
          education: data.data?.education?.length || 0,
          skills: data.data?.skills?.length || 0,
          projects: data.data?.projects?.length || 0,
        });
        
        logger.info('Resume loaded for preview', { 
          hasData: !!data.data, 
          dataKeys: data.data ? Object.keys(data.data) : [],
          dataStructure: data.data 
        });
        setResume(data);
      } catch (error) {
        logger.error('Error fetching resume', { error: error instanceof Error ? error.message : 'Unknown error' });
        toast.error("Failed to Load Resume", {
          description: "Could not load resume data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-neutral-400">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Resume Not Found</h2>
          <p className="text-neutral-400">Could not load resume data.</p>
          <Button onClick={() => router.push('/dashboard/resumes')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resumes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/resumes')}
            className="text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resumes
          </Button>
          
          <Button
            onClick={async () => {
              try {
                toast.loading("Opening print dialog...", { id: 'preview-export' });
                
                // Wait for rendering to complete
                await new Promise(resolve => requestAnimationFrame(resolve));
                await new Promise(resolve => requestAnimationFrame(resolve));
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Find the visible preview wrapper (not the hidden ref)
                const previewWrapper = document.querySelector('.aspect-\\[210\\/297\\]')?.parentElement as HTMLElement;
                
                if (!previewWrapper) {
                  throw new Error('Preview not ready - could not find preview wrapper');
                }
                
                console.log('🔍 Manual download: Found preview wrapper', {
                  hasElement: !!previewWrapper,
                  innerHTML: previewWrapper.innerHTML.substring(0, 200),
                  children: previewWrapper.children.length
                });
                
                // Use the native print dialog (most reliable method)
                const { exportElementToPDFNative } = await import('@/lib/export/pdf-export');
                const filename = `${resume.name || 'resume'}.pdf`.replace(/\s+/g, '_');
                await exportElementToPDFNative(previewWrapper, filename);
                
                toast.success("Print dialog opened! Save as PDF.", {
                  id: 'preview-export',
                  duration: 5000
                });
                
                // Increment download counter
                await fetch(`/api/resumes/${resolvedParams.id}/download`, { method: 'POST' });
              } catch (error) {
                logger.error('PDF export failed', { error });
                toast.error("Failed to open print dialog. Please try again.", {
                  id: 'preview-export',
                });
              }
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
        
        <PageHeader 
          title={resume.name || "Resume Preview"} 
          description="Quick look at your resume with the current template." 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-6 flex justify-center"
        >
          {(() => {
            const resumeDataForPreview = {
              title: resume.name,
              templateId: resume.templateId,
              content: {
                personalInfo: resume.data?.personalInfo || {},
                workExperience: resume.data?.workExperience || [],
                education: resume.data?.education || [],
                skills: resume.data?.skills || [],
                projects: resume.data?.projects || [],
                certifications: resume.data?.certifications || [],
                languages: resume.data?.languages || [],
                interests: resume.data?.interests || []
              }
            };
            
            console.log('🎨 LivePreview Input Data:', resumeDataForPreview);
            console.log('📋 Content Check:', {
              hasPersonalInfo: Object.keys(resumeDataForPreview.content.personalInfo).length > 0,
              workExpCount: resumeDataForPreview.content.workExperience.length,
              educationCount: resumeDataForPreview.content.education.length,
              skillsCount: resumeDataForPreview.content.skills.length,
            });
            
            return (
              <LivePreview 
                ref={previewRef}
                resumeData={resumeDataForPreview} 
                templateId={resume.templateId || "azurill"} 
              />
            );
          })()}
        </motion.div>
      </div>
    </div>
  );
}
