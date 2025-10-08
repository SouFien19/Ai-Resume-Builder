/**
 * Application Constants
 * Centralized configuration for ResumeCraft AI
 */

// Application Information
export const APP_CONFIG = {
  name: 'ResumeCraft AI',
  version: '3.0.0',
  description: 'Professional AI-Powered Resume Builder & Career Intelligence Platform',
  url: process.env.BASE_URL || 'http://localhost:3000',
  supportEmail: 'support@resumecraft.ai',
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  protectedRoutes: ['/dashboard', '/api/resumes', '/api/analytics'],
} as const;

// API Configuration
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  endpoints: {
    auth: '/api/auth',
    resumes: '/api/resumes',
    templates: '/api/templates',
    analytics: '/api/analytics',
    ai: '/api/ai',
  },
} as const;

// AI Configuration
export const AI_CONFIG = {
  maxTokens: 1000,
  temperature: 0.4,
  models: {
    gemini: 'gemini-1.5-flash',
  },
} as const;

// Performance Thresholds
export const PERFORMANCE_CONFIG = {
  slowOperationThreshold: 1000, // ms
  apiResponseThreshold: 5000, // ms
  renderingThreshold: 100, // ms
  maxFileSize: 10 * 1024 * 1024, // 10MB
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'An unexpected error occurred. Please try again.',
  network: 'Network error. Please check your connection and try again.',
  authentication: 'Authentication failed. Please sign in again.',
  authorization: 'You do not have permission to access this resource.',
  validation: 'Please check your input and try again.',
  fileUpload: 'File upload failed. Please ensure your file is under 10MB.',
  aiGeneration: 'AI service is temporarily unavailable. Please try again later.',
  database: 'Database error. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  resumeSaved: 'Resume saved successfully!',
  resumeDeleted: 'Resume deleted successfully!',
  profileUpdated: 'Profile updated successfully!',
  exportCompleted: 'Export completed successfully!',
  analysisCompleted: 'Analysis completed successfully!',
} as const;
