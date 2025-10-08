import { Schema, model, models } from 'mongoose';

// Content Generation Schema
const ContentGenerationSchema = new Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  }, // Clerk user ID
  
  // Content details
  contentType: { 
    type: String, 
    required: true,
    enum: [
      'cover-letter',
      'linkedin-post', 
      'job-description',
      'skills-keywords',
      'resume-summary',
      'work-experience',
      'achievements'
    ],
    index: true
  },
  
  // AI Generation details
  prompt: { 
    type: String, 
    required: true 
  }, // User input/prompt
  
  generatedContent: { 
    type: String, 
    required: true 
  }, // AI generated content
  
  // Content metadata
  metadata: {
    model: { 
      type: String, 
      default: 'gemini-pro' 
    }, // AI model used
    
    tokens: {
      input: { type: Number },
      output: { type: Number },
      total: { type: Number }
    },
    
    processingTime: { 
      type: Number 
    }, // Time taken in milliseconds
    
    temperature: { 
      type: Number, 
      default: 0.7 
    }, // AI creativity setting
    
    qualityScore: { 
      type: Number, 
      min: 0, 
      max: 100 
    }, // Content quality assessment
    
    // Content-specific metadata
    targetRole: { type: String },
    targetCompany: { type: String },
    industry: { type: String },
    experienceLevel: { 
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive']
    },
    
    // Additional context
    additionalContext: { 
      type: Schema.Types.Mixed 
    }
  },
  
  // User interaction
  userRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  }, // User feedback rating
  
  isBookmarked: { 
    type: Boolean, 
    default: false 
  },
  
  isShared: { 
    type: Boolean, 
    default: false 
  },
  
  editCount: { 
    type: Number, 
    default: 0 
  }, // How many times user edited
  
  // Usage tracking
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  
  copyCount: { 
    type: Number, 
    default: 0 
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'completed', 'archived'],
    default: 'completed'
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  lastAccessedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true, // Automatically handle createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ContentGenerationSchema.index({ userId: 1, contentType: 1 });
ContentGenerationSchema.index({ userId: 1, createdAt: -1 });
ContentGenerationSchema.index({ contentType: 1, createdAt: -1 });
ContentGenerationSchema.index({ userId: 1, isBookmarked: 1 });

// Virtual for content length
ContentGenerationSchema.virtual('contentLength').get(function() {
  return this.generatedContent ? this.generatedContent.length : 0;
});

// Virtual for content word count
ContentGenerationSchema.virtual('wordCount').get(function() {
  return this.generatedContent ? this.generatedContent.split(/\s+/).length : 0;
});

// Pre-save middleware to update timestamps
ContentGenerationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Static methods for analytics
ContentGenerationSchema.statics.getContentStats = function(userId: string, timeRange?: { start: Date; end: Date }) {
  const matchStage: Record<string, unknown> = { userId };
  
  if (timeRange) {
    matchStage.createdAt = {
      $gte: timeRange.start,
      $lte: timeRange.end
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$contentType',
        count: { $sum: 1 },
        totalWords: { $sum: { $size: { $split: ['$generatedContent', ' '] } } },
        avgQualityScore: { $avg: '$metadata.qualityScore' },
        avgRating: { $avg: '$userRating' },
        totalDownloads: { $sum: '$downloadCount' },
        totalCopies: { $sum: '$copyCount' },
        bookmarkedCount: { 
          $sum: { 
            $cond: ['$isBookmarked', 1, 0] 
          } 
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

ContentGenerationSchema.statics.getUserActivity = function(userId: string, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('contentType generatedContent createdAt metadata.qualityScore userRating');
};

ContentGenerationSchema.statics.getContentTrends = function(timeRange?: { start: Date; end: Date }) {
  const matchStage: Record<string, unknown> = {};
  
  if (timeRange) {
    matchStage.createdAt = {
      $gte: timeRange.start,
      $lte: timeRange.end
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$contentType',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        },
        count: { $sum: 1 },
        totalWords: { $sum: { $size: { $split: ['$generatedContent', ' '] } } }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

// Export the model
const ContentGeneration = models.ContentGeneration || model('ContentGeneration', ContentGenerationSchema);

export default ContentGeneration;

// Export types for TypeScript
export interface IContentGeneration {
  _id: string;
  userId: string;
  contentType: 'cover-letter' | 'linkedin-post' | 'job-description' | 'skills-keywords' | 'resume-summary' | 'work-experience' | 'achievements';
  prompt: string;
  generatedContent: string;
  metadata: {
    model: string;
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
    processingTime?: number;
    temperature: number;
    qualityScore?: number;
    targetRole?: string;
    targetCompany?: string;
    industry?: string;
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
    additionalContext?: Record<string, unknown>;
  };
  userRating?: number;
  isBookmarked: boolean;
  isShared: boolean;
  editCount: number;
  downloadCount: number;
  copyCount: number;
  status: 'draft' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  contentLength: number;
  wordCount: number;
}