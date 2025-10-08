/**
 * Environment Configuration Validator
 * Ensures all required environment variables are properly set
 */

import { logger } from './logger';

interface EnvironmentConfig {
  // Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string;
  NEXT_PUBLIC_CLERK_DOMAIN: string;
  
  // Database
  MONGODB_URI: string;
  
  // AI Services
  GOOGLE_GEMINI_API_KEY: string;
  GEMINI_API_KEY: string;
  
  // Application
  BASE_URL: string;
  NODE_ENV: string;
  
  // Optional
  NEXT_PUBLIC_LOGGING_ENDPOINT?: string;
  CLERK_ENCRYPTION_KEY?: string;
  NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG?: string;
}

const requiredEnvVars: (keyof EnvironmentConfig)[] = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_DOMAIN',
  'MONGODB_URI',
  'GOOGLE_GEMINI_API_KEY',
  'GEMINI_API_KEY',
  'BASE_URL',
  'NODE_ENV',
];

class EnvironmentValidator {
  private config: Partial<EnvironmentConfig> = {};
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.loadEnvironmentVariables();
    this.validateConfiguration();
  }

  private loadEnvironmentVariables(): void {
    // Load all environment variables
    this.config = {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
      NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
      MONGODB_URI: process.env.MONGODB_URI,
      GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      BASE_URL: process.env.BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_LOGGING_ENDPOINT: process.env.NEXT_PUBLIC_LOGGING_ENDPOINT,
      CLERK_ENCRYPTION_KEY: process.env.CLERK_ENCRYPTION_KEY,
      NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG: process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG,
    };
  }

  private validateConfiguration(): void {
    this.errors = [];
    this.warnings = [];

    // Check required variables
    for (const envVar of requiredEnvVars) {
      if (!this.config[envVar]) {
        this.errors.push(`Missing required environment variable: ${envVar}`);
      }
    }

    // Validate specific formats
    this.validateUrls();
    this.validateApiKeys();
    this.validateNodeEnvironment();
    
    // Check for potential issues
    this.checkForCommonIssues();
  }

  private validateUrls(): void {
    const urlFields: (keyof EnvironmentConfig)[] = [
      'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
      'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
      'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
      'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
      'BASE_URL',
    ];

    for (const field of urlFields) {
      const value = this.config[field];
      if (value) {
        if (field === 'BASE_URL') {
          // BASE_URL should include protocol
          if (!value.startsWith('http://') && !value.startsWith('https://')) {
            this.errors.push(`${field} must include protocol (http:// or https://)`);
          }
        } else if (!value.startsWith('/') && !value.startsWith('http')) {
          // Other URLs should be relative paths or absolute URLs
          this.warnings.push(`${field} should start with '/' for relative paths`);
        }
      }
    }
  }

  private validateApiKeys(): void {
    const { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, GOOGLE_GEMINI_API_KEY } = this.config;

    if (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
      this.errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with "pk_"');
    }

    if (CLERK_SECRET_KEY && !CLERK_SECRET_KEY.startsWith('sk_')) {
      this.errors.push('CLERK_SECRET_KEY should start with "sk_"');
    }

    if (GOOGLE_GEMINI_API_KEY && GOOGLE_GEMINI_API_KEY.length < 20) {
      this.warnings.push('GOOGLE_GEMINI_API_KEY appears to be too short');
    }
  }

  private validateNodeEnvironment(): void {
    const { NODE_ENV } = this.config;
    const validEnvironments = ['development', 'production', 'test'];

    if (NODE_ENV && !validEnvironments.includes(NODE_ENV)) {
      this.warnings.push(`NODE_ENV should be one of: ${validEnvironments.join(', ')}`);
    }
  }

  private checkForCommonIssues(): void {
    // Check for development keys in production
    if (this.config.NODE_ENV === 'production') {
      if (this.config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('test')) {
        this.errors.push('Using test Clerk keys in production environment');
      }
      
      if (this.config.BASE_URL?.includes('localhost')) {
        this.errors.push('Using localhost BASE_URL in production environment');
      }
    }

    // Check for missing optional but recommended variables
    if (!this.config.CLERK_ENCRYPTION_KEY) {
      this.warnings.push('CLERK_ENCRYPTION_KEY not set - consider adding for enhanced security');
    }

    if (this.config.NODE_ENV === 'production' && !this.config.NEXT_PUBLIC_LOGGING_ENDPOINT) {
      this.warnings.push('NEXT_PUBLIC_LOGGING_ENDPOINT not set - logging will fall back to console');
    }
  }

  public getValidatedConfig(): EnvironmentConfig {
    if (this.errors.length > 0) {
      throw new Error(`Environment validation failed:\n${this.errors.join('\n')}`);
    }

    if (this.warnings.length > 0) {
      logger.warn('Environment configuration warnings detected', { 
        warnings: this.warnings 
      });
    }

    return this.config as EnvironmentConfig;
  }

  public isValid(): boolean {
    return this.errors.length === 0;
  }

  public getErrors(): string[] {
    return [...this.errors];
  }

  public getWarnings(): string[] {
    return [...this.warnings];
  }

  public logStatus(): void {
    if (this.errors.length > 0) {
      logger.error('Environment validation failed', { 
        errors: this.errors,
        warnings: this.warnings 
      });
    } else if (this.warnings.length > 0) {
      logger.warn('Environment configuration has warnings', { 
        warnings: this.warnings 
      });
    } else {
      logger.info('Environment configuration validated successfully');
    }
  }
}

// Create singleton instance
const environmentValidator = new EnvironmentValidator();

// Export validated configuration
export const env = environmentValidator.getValidatedConfig();

// Export validator for additional checks
export { environmentValidator };

// Log validation status on import
environmentValidator.logStatus();