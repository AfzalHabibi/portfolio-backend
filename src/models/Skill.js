const mongoose = require("mongoose")

const SkillItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  keywords: [{ type: String, trim: true }],
  proficiency: { 
    type: String, 
    required: true, 
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    trim: true 
  },
  experience: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  projects: [{ type: String, trim: true }],
  certifications: [{ type: String, trim: true }],
  tools_used: [{ type: String, trim: true }],
  best_practices: [{ type: String, trim: true }],
  achievements: [{ type: String, trim: true }],
  version: { type: String, trim: true },
  methodologies: [{ type: String, trim: true }],
  performance_metrics: [{ type: String, trim: true }],
  used_in_roles: [{ type: String, trim: true }],
  difficulty_handled: { type: String, trim: true },
  endorsements: [{ type: String, trim: true }],
  icon: { type: String, trim: true },
  color: { type: String, trim: true, default: "#0ea5e9" },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { _id: true })

const SkillSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    color: { type: String, trim: true, default: "#0ea5e9" },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    items: [SkillItemSchema]
  },
  {
    timestamps: true,
  }
)

// Index for better performance
SkillSchema.index({ category: 1 })
SkillSchema.index({ 'items.name': 1 })
SkillSchema.index({ displayOrder: 1 })

module.exports = mongoose.model("Skill", SkillSchema)
