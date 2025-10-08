import { Schema, model, models } from 'mongoose';

// Template Category Schema
const TemplateCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  industries: [{ type: String }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Enhanced Resume Template Schema
const TemplateSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Keep backward compatibility
  categoryId: { type: Schema.Types.ObjectId, ref: 'TemplateCategory' },
  
  // Visual properties
  thumbnail: { type: String, required: true },
  previewImage: { type: String },
  
  // Template configuration (legacy support)
  data: { type: Object, required: true },
  popularity: { type: Number, required: true },
  
  // Enhanced properties
  layout: {
    type: { type: String, enum: ['single-column', 'two-column', 'three-column'], default: 'single-column' },
    sections: [{
      name: { type: String, required: true },
      order: { type: Number, required: true },
      isVisible: { type: Boolean, default: true },
      isRequired: { type: Boolean, default: false },
    }],
  },
  
  // Styling options
  styling: {
    primaryColor: { type: String, default: '#3b82f6' },
    secondaryColor: { type: String, default: '#64748b' },
    accentColor: { type: String, default: '#ec4899' },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#000000' },
    
    fonts: {
      heading: { type: String, default: 'Inter' },
      body: { type: String, default: 'Inter' },
      sizes: {
        h1: { type: Number, default: 24 },
        h2: { type: Number, default: 20 },
        h3: { type: Number, default: 16 },
        body: { type: Number, default: 12 },
      }
    },
    
    spacing: {
      margin: { type: Number, default: 20 },
      padding: { type: Number, default: 15 },
      lineHeight: { type: Number, default: 1.4 },
    }
  },
  
  // Metadata
  tags: [{ type: String }],
  industries: [{ type: String }],
  jobLevels: [{ type: String, enum: ['entry', 'mid', 'senior', 'executive'] }],
  atsScore: { type: Number, min: 0, max: 100, default: 85 },
  
  // Usage stats
  usageCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  
  // Status
  isPremium: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// User Template Customization Schema
const UserTemplateCustomizationSchema = new Schema({
  userId: { type: String, required: true }, // Clerk user ID
  templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
  
  customizations: {
    colors: {
      primary: { type: String },
      secondary: { type: String },
      accent: { type: String },
      background: { type: String },
      text: { type: String },
    },
    
    fonts: {
      heading: { type: String },
      body: { type: String },
      sizes: {
        h1: { type: Number },
        h2: { type: Number },
        h3: { type: Number },
        body: { type: Number },
      }
    },
    
    layout: {
      sections: [{
        name: { type: String },
        isVisible: { type: Boolean },
        order: { type: Number },
      }],
    },
    
    spacing: {
      margin: { type: Number },
      padding: { type: Number },
      lineHeight: { type: Number },
    }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create indexes for better performance
// Note: slug index is created automatically by unique: true in schema definition
TemplateCategorySchema.index({ isActive: 1, order: 1 });

// Note: slug index is created automatically by unique: true in schema definition
TemplateSchema.index({ category: 1, isActive: 1 });
TemplateSchema.index({ industries: 1, jobLevels: 1 });
TemplateSchema.index({ isFeatured: 1, isActive: 1 });
TemplateSchema.index({ usageCount: -1 });
TemplateSchema.index({ rating: -1 });

UserTemplateCustomizationSchema.index({ userId: 1, templateId: 1 }, { unique: true });

// Export models
export const TemplateCategory = models.TemplateCategory || model('TemplateCategory', TemplateCategorySchema);
export const UserTemplateCustomization = models.UserTemplateCustomization || model('UserTemplateCustomization', UserTemplateCustomizationSchema);

// Default export for backward compatibility
const Template = models.Template || model('Template', TemplateSchema);
export default Template;
