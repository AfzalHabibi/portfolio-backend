const mongoose = require("mongoose")

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Skill", SkillSchema)
