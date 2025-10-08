import { monitorAPICall } from '@/lib/performance-monitor';

// Cached job matcher API call
export async function getJobMatches(resumeText: string, preferences: { location?: string; experience?: string; salary?: string } = {}) {
  return monitorAPICall(async () => {
    const response = await fetch('/api/ats/job-matcher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, preferences }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch job matches');
    }
    
    return response.json();
  }, 'api_job_matcher');
}

// Track application with caching
export async function trackApplication(jobId: string, action: string) {
  return monitorAPICall(async () => {
    const response = await fetch('/api/analytics/track-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, action }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to track application');
    }
    
    return response.json();
  }, 'api_track_application');
}