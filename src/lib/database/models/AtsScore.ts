import { Schema, model, models } from 'mongoose';

const AtsScoreSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' },
  score: { type: Number, required: true, min: 0, max: 100 },
  resumeText: { type: String },
  jobDescription: { type: String },
  analysis: {
    missingKeywords: [{ type: String }],
    recommendations: [{ type: String }],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true
});

AtsScoreSchema.index({ userId: 1, createdAt: -1 });

const AtsScore = models.AtsScore || model('AtsScore', AtsScoreSchema);

export default AtsScore;
