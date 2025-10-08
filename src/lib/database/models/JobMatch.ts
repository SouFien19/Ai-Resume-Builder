import { Schema, model, models } from 'mongoose';

const JobMatchSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeText: { type: String, required: true },
  jobDescription: { type: String }, // Optional - for AI job match endpoint
  matches: [{
    title: { type: String, required: true },
    company: { type: String, required: false }, // Made optional since AI generates role titles, not specific companies
    location: { type: String },
    description: { type: String },
    requirements: { type: [String], default: [] },
    matchScore: { type: Number },
    matchReason: { type: String },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    url: { type: String }
  }],
  searchDate: { type: Date, default: Date.now },
  preferences: {
    jobType: { type: String },
    location: { type: String },
    salaryRange: { type: String },
    experienceLevel: { type: String }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index for efficient queries by user and date
JobMatchSchema.index({ userId: 1, searchDate: -1 });

// Force model recreation in development
delete models.JobMatch;
const JobMatch = model('JobMatch', JobMatchSchema);

export default JobMatch;
