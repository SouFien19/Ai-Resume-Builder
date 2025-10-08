// API Request Cache Utility
class APICache {
  private cache = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

// Enhanced fetch with caching
export async function cachedFetch(url: string, options?: RequestInit) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Return cached data if available
  const cached = apiCache.get(cacheKey);
  if (cached && options?.method !== 'POST') {
    return { 
      ok: true, 
      json: () => Promise.resolve(cached),
      data: cached 
    };
  }

  // Make request and cache result
  const response = await fetch(url, options);
  if (response.ok && options?.method !== 'POST') {
    const data = await response.clone().json();
    apiCache.set(cacheKey, data);
  }
  
  return response;
}