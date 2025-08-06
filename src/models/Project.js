const mongoose = require("mongoose")

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }], // Array of strings
    technologies: [{ type: String, required: true, trim: true }], // Array of strings
    images: [{ type: String, trim: true }], // Array of image URLs
    mainImage: { type: String, required: true, trim: true }, // Main image URL
    videos: [{ type: String, trim: true }], // Array of video URLs
    demoUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    clientRemarks: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    completedDate: { type: String, required: true, trim: true }, // Storing as string for flexibility (e.g., "May 2023")
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

module.exports = mongoose.model("Project", ProjectSchema)
