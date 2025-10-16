/**
 * Auth Performance Optimization Utilities
 * Prevents crashes and improves sign-in/sign-up speed
 */

/**
 * Preconnect to Clerk domains for faster auth
 */
export function setupAuthPreconnect() {
  if (typeof document === 'undefined') return;
  
  const clerkDomains = [
    'https://clerk.accounts.dev',
    'https://api.clerk.dev',
  ];
  
  clerkDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Clean up stale Clerk sessions to prevent conflicts
 */
export function cleanupStaleAuth() {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove old Clerk client tokens that might cause conflicts
    const keysToCheck = Object.keys(localStorage);
    const clerkKeys = keysToCheck.filter(key => 
      key.startsWith('__clerk_') || 
      key.startsWith('clerk-')
    );
    
    clerkKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (!value) return;
        
        // Check if it's a token with expiry
        const data = JSON.parse(value);
        if (data.exp && data.exp < Date.now() / 1000) {
          localStorage.removeItem(key);
          console.log('[Auth] Removed expired token:', key);
        }
      } catch {
        // Invalid data, keep it for now (Clerk manages its own cleanup)
      }
    });
  } catch (error) {
    console.warn('[Auth] Failed to cleanup stale auth:', error);
  }
}

/**
 * Debounce function to prevent rapid auth attempts
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Rate limiter for auth actions
 */
class AuthRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 60000; // 1 minute

  canAttempt(action: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(action) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      console.warn(`[Auth] Rate limit exceeded for ${action}`);
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(action, recentAttempts);
    return true;
  }

  reset(action: string) {
    this.attempts.delete(action);
  }
}

export const authRateLimiter = new AuthRateLimiter();

/**
 * Error boundary for auth components
 */
export function handleAuthError(error: unknown): string {
  if (error instanceof Error) {
    // Clerk-specific errors
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('rate limit')) {
      return 'Too many attempts. Please try again in a minute.';
    }
    if (error.message.includes('Invalid')) {
      return 'Invalid credentials. Please try again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Performance monitoring for auth flows
 */
export class AuthPerformanceMonitor {
  private startTimes: Map<string, number> = new Map();

  start(action: string) {
    this.startTimes.set(action, performance.now());
  }

  end(action: string) {
    const startTime = this.startTimes.get(action);
    if (!startTime) return;
    
    const duration = performance.now() - startTime;
    console.log(`[Auth Performance] ${action}: ${duration.toFixed(2)}ms`);
    
    // Warn if slow
    if (duration > 3000) {
      console.warn(`[Auth Performance] Slow ${action}: ${duration.toFixed(2)}ms`);
    }
    
    this.startTimes.delete(action);
  }
}

export const authPerformance = new AuthPerformanceMonitor();

/**
 * Optimize Clerk appearance for faster rendering
 */
export const optimizedClerkAppearance = {
  layout: {
    shimmer: false, // Disable shimmer effect for faster render
    unsafe_disableDevelopmentModeWarnings: true,
  },
  elements: {
    // Reduce animation delays
    card: "transition-none",
    formButtonPrimary: "transition-colors duration-150",
    formFieldInput: "transition-colors duration-150",
    footerActionLink: "transition-colors duration-150",
  },
};

/**
 * Preload critical auth assets
 */
export function preloadAuthAssets() {
  if (typeof document === 'undefined') return;
  
  // Preload Clerk's critical CSS/JS
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'style';
  preloadLink.href = 'https://clerk.accounts.dev/v1/styles.css';
  document.head.appendChild(preloadLink);
}
