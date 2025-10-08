import { Schema, model, models } from 'mongoose';

// Enhanced Analytics Schema (keep backward compatibility)
const AnalyticsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clerkUserId: { type: String, index: true }, // Add Clerk support
  event: { type: String, required: true },
  properties: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

// User Activity Tracking Schema
const UserActivitySchema = new Schema({
  userId: { type: String, required: true, index: true }, // Clerk user ID
  
  // Event details
  eventType: { 
    type: String, 
    required: true,
    enum: [
      'resume_created', 'resume_edited', 'resume_viewed', 'resume_downloaded', 'resume_shared',
      'template_selected', 'template_customized', 'template_previewed',
      'ats_scan_performed', 'content_generated', 'job_matched',
      'profile_updated', 'login', 'logout',
      'application_submitted', 'interview_scheduled', 'job_offer_received'
    ]
  },
  
  // Event metadata
  metadata: {
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' },
    templateId: { type: Schema.Types.ObjectId, ref: 'Template' },
    jobId: { type: String },
    companyName: { type: String },
    source: { type: String }, // web, mobile, api
    duration: { type: Number }, // Time spent in milliseconds
    score: { type: Number }, // ATS score, match percentage, etc.
    additionalData: { type: Schema.Types.Mixed }
  },
  
  // Session info
  sessionId: { type: String },
  userAgent: { type: String },
  ipAddress: { type: String },
  
  timestamp: { type: Date, default: Date.now, index: true },
});

// Resume Performance Tracking Schema
const ResumePerformanceSchema = new Schema({
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
  userId: { type: String, required: true, index: true },
  
  // View metrics
  views: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    bySource: {
      direct: { type: Number, default: 0 },
      linkedin: { type: Number, default: 0 },
      jobBoard: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  
  // Download metrics
  downloads: {
    total: { type: Number, default: 0 },
    pdf: { type: Number, default: 0 },
    docx: { type: Number, default: 0 },
    byDevice: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    }
  },
  
  // Application tracking
  applications: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    interviews: { type: Number, default: 0 },
    offers: { type: Number, default: 0 },
    rejections: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 } // percentage
  },
  
  // ATS Performance
  atsScores: [{
    score: { type: Number, required: true },
    jobTitle: { type: String },
    company: { type: String },
    scanDate: { type: Date, default: Date.now }
  }],
  
  averageAtsScore: { type: Number, default: 0 },
  
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Job Application Tracking Schema
const JobApplicationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  
  // Job details
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  jobDescription: { type: String },
  jobUrl: { type: String },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  
  // Application details
  applicationDate: { type: Date, required: true },
  source: { type: String }, // linkedin, indeed, company-website, etc.
  
  // Status tracking
  status: {
    type: String,
    enum: ['applied', 'under-review', 'phone-screen', 'interview', 'final-round', 'offer', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  
  // Timeline
  timeline: [{
    status: { type: String, required: true },
    date: { type: Date, required: true },
    notes: { type: String }
  }],
  
  // Outcome
  outcome: {
    result: { type: String, enum: ['pending', 'offer', 'rejection', 'no-response'], default: 'pending' },
    feedback: { type: String }
  },
  
  // Analytics
  responseTime: { type: Number }, // Days to first response
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// User Analytics Summary Schema
const UserAnalyticsSummarySchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  
  // Summary metrics
  totalResumes: { type: Number, default: 0 },
  totalApplications: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  totalDownloads: { type: Number, default: 0 },
  
  // Success metrics
  interviewRate: { type: Number, default: 0 }, // percentage
  offerRate: { type: Number, default: 0 }, // percentage
  averageResponseTime: { type: Number, default: 0 }, // days
  
  // ATS performance
  averageAtsScore: { type: Number, default: 0 },
  bestAtsScore: { type: Number, default: 0 },
  
  // Activity metrics
  loginStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Create indexes for performance
AnalyticsSchema.index({ userId: 1, createdAt: -1 });
AnalyticsSchema.index({ clerkUserId: 1, createdAt: -1 });

UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ eventType: 1, timestamp: -1 });

ResumePerformanceSchema.index({ userId: 1, resumeId: 1 }, { unique: true });
ResumePerformanceSchema.index({ 'applications.successRate': -1 });

JobApplicationSchema.index({ userId: 1, applicationDate: -1 });
JobApplicationSchema.index({ status: 1, applicationDate: -1 });

// Export models
export const UserActivity = models.UserActivity || model('UserActivity', UserActivitySchema);
export const ResumePerformance = models.ResumePerformance || model('ResumePerformance', ResumePerformanceSchema);
export const JobApplication = models.JobApplication || model('JobApplication', JobApplicationSchema);
export const UserAnalyticsSummary = models.UserAnalyticsSummary || model('UserAnalyticsSummary', UserAnalyticsSummarySchema);

// Default export for backward compatibility
const Analytics = models.Analytics || model('Analytics', AnalyticsSchema);
export default Analytics;
