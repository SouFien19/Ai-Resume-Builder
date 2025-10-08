import { Schema, model, models } from 'mongoose';

const AppliedJobSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  matchScore: { type: Number },
  status: { 
    type: String, 
    enum: {
      values: ['Applied', 'Saved', 'Assessment', 'Interviewing', 'Offer', 'Rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Applied' 
  },
  appliedAt: { type: Date, default: Date.now },
  url: { type: String },
}, {
  timestamps: true,
  versionKey: false
});

AppliedJobSchema.index({ userId: 1, appliedAt: -1 });

// Force model recreation in development
delete models.AppliedJob;
const AppliedJob = model('AppliedJob', AppliedJobSchema);

export default AppliedJob;
