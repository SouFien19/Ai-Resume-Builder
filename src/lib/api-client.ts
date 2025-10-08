import { cachedFetch } from '@/lib/api-cache';
import { monitorAPICall } from '@/lib/performance-monitor';

// Optimized template fetching with caching
export async function getTemplates() {
  return monitorAPICall(async () => {
    const response = await cachedFetch('/api/templates', {
      cache: 'no-store', // Let our custom cache handle it
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    
    const result = await response.json();
    
    // Handle new API response format { success, data, meta }
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    
    // Fallback for old format (direct array)
    return result;
  }, 'api_templates_fetch');
}

// Optimized resume fetching with caching
export async function getResumes() {
  return monitorAPICall(async () => {
    const response = await cachedFetch('/api/resumes', {
      cache: 'no-store', // Let our custom cache handle it
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch resumes');
    }
    
    const result = await response.json();
    
    // Handle new API response format { success, data, meta }
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data;
    }
    
    // Fallback for old format (direct array)
    return result;
  }, 'api_resumes_fetch');
}

// Optimized user sync with less frequent calls
export async function syncUser() {
  return monitorAPICall(async () => {
    try {
      // Use optimized endpoint
      const response = await cachedFetch('/api/sync-user-optimized', {
        method: 'POST',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to sync user';
        
        // Check if it's a real Response object (not cached)
        if ('status' in response && 'statusText' in response) {
          errorMessage = `Failed to sync user: ${response.status} ${response.statusText}`;
          
          try {
            const errorData = await response.text();
            if (errorData) {
              errorMessage += ` - ${errorData}`;
            }
          } catch {
            // Ignore parsing error, use default message
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('User sync successful:', result);
      return result;
    } catch (error) {
      console.error('User sync error:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to sync service. Please check your connection.');
      }
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Authentication error: Please log in again.');
        }
        
        if (error.message.includes('500')) {
          throw new Error('Server error: The sync service is temporarily unavailable. Please try again later.');
        }
      }
      
      // Re-throw the original error if it's already descriptive
      throw error;
    }
  }, 'api_user_sync');
}