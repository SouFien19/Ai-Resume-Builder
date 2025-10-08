/**
 * Input Sanitization Utilities
 * Prevent XSS, SQL injection, and other security vulnerabilities
 */

/**
 * Sanitize string input by removing dangerous characters and HTML
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, ''); // Remove data:text/html
}

/**
 * Sanitize HTML content - allow only safe tags
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return '';
  
  let sanitized = html;
  
  // Remove all tags except allowed ones
  sanitized = sanitized.replace(/<(?!\/?(?:p|br|strong|em|u|ul|ol|li|a|span)\b)[^>]+>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w.@+-]/g, ''); // Keep only valid email characters
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize phone number - keep only digits, spaces, and common characters
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  return phone
    .trim()
    .replace(/[^\d\s+\-()]/g, ''); // Keep digits, spaces, +, -, (, )
}

/**
 * Sanitize filename - remove path traversal attempts
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .trim()
    .substring(0, 255); // Limit length
}

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 */
export function sanitizeMongoQuery(query: unknown): unknown {
  if (typeof query !== 'object' || query === null) {
    return query;
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeMongoQuery);
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(query)) {
    // Skip MongoDB operators that could be dangerous
    if (key.startsWith('$') && !['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin'].includes(key)) {
      continue;
    }
    
    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMongoQuery(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Escape special regex characters
 */
export function escapeRegex(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';
  
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 200); // Limit length
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : 
        item
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize ObjectId
 */
export function sanitizeObjectId(id: string): string | null {
  if (typeof id !== 'string') return null;
  
  // MongoDB ObjectId is 24 hex characters
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return null;
  }
  
  return id.toLowerCase();
}

/**
 * Remove null bytes that can cause issues
 */
export function removeNullBytes(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str.replace(/\0/g, '');
}

/**
 * Truncate string to max length safely
 */
export function truncate(str: string, maxLength: number): string {
  if (typeof str !== 'string') return '';
  
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength).trim() + '...';
}
