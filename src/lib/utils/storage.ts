/**
 * Safe localStorage wrapper with error handling
 * Prevents crashes from:
 * - localStorage not available (SSR, private browsing)
 * - Storage quota exceeded
 * - Invalid JSON
 * - Cross-origin issues
 */

export class SafeStorage {
  private static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  static get(key: string): string | null {
    if (!this.isAvailable()) return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`[SafeStorage] Failed to get item "${key}":`, error);
      return null;
    }
  }

  static set(key: string, value: string): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`[SafeStorage] Failed to set item "${key}":`, error);
      
      // Try to clear some space if quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('[SafeStorage] Storage quota exceeded, clearing old data...');
        this.clearOldData();
        
        // Retry once
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          return false;
        }
      }
      
      return false;
    }
  }

  static remove(key: string): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[SafeStorage] Failed to remove item "${key}":`, error);
      return false;
    }
  }

  static getJSON<T>(key: string, fallback: T): T {
    const value = this.get(key);
    if (!value) return fallback;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`[SafeStorage] Failed to parse JSON for "${key}":`, error);
      return fallback;
    }
  }

  static setJSON<T>(key: string, value: T): boolean {
    try {
      return this.set(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[SafeStorage] Failed to stringify JSON for "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear old/stale data to free up space
   */
  private static clearOldData(): void {
    if (!this.isAvailable()) return;
    
    const keysToCheck = ['cookie-consent', 'theme', 'preferences'];
    const threshold = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    keysToCheck.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return;
        
        const data = JSON.parse(item);
        const timestamp = data.timestamp ? new Date(data.timestamp).getTime() : 0;
        const now = Date.now();
        
        if (now - timestamp > threshold) {
          localStorage.removeItem(key);
          console.log(`[SafeStorage] Cleared old data: ${key}`);
        }
      } catch {
        // Invalid data, remove it
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Check available storage space (approximate)
   */
  static getUsage(): { used: number; available: boolean } {
    if (!this.isAvailable()) {
      return { used: 0, available: false };
    }
    
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          total += key.length + value.length;
        }
      }
      
      return { 
        used: total, 
        available: true 
      };
    } catch {
      return { used: 0, available: false };
    }
  }
}

/**
 * Safe sessionStorage wrapper
 */
export class SafeSessionStorage {
  private static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const testKey = '__session_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  static get(key: string): string | null {
    if (!this.isAvailable()) return null;
    
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn(`[SafeSessionStorage] Failed to get item "${key}":`, error);
      return null;
    }
  }

  static set(key: string, value: string): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`[SafeSessionStorage] Failed to set item "${key}":`, error);
      return false;
    }
  }

  static remove(key: string): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[SafeSessionStorage] Failed to remove item "${key}":`, error);
      return false;
    }
  }

  static getJSON<T>(key: string, fallback: T): T {
    const value = this.get(key);
    if (!value) return fallback;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`[SafeSessionStorage] Failed to parse JSON for "${key}":`, error);
      return fallback;
    }
  }

  static setJSON<T>(key: string, value: T): boolean {
    try {
      return this.set(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[SafeSessionStorage] Failed to stringify JSON for "${key}":`, error);
      return false;
    }
  }
}
