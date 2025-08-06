const mongoose = require("mongoose")

const SiteSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    profileImage: { type: String, default: "" }, // Profile image URL
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      behance: { type: String, default: "" },
      dribbble: { type: String, default: "" },
    },
    cvUrl: { type: String, default: "" },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

// Ensure there's only one site settings document
SiteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne()
  if (!settings) {
    // Create a default if none exists
    settings = await this.create({
      name: "Your Name",
      title: "Your Title",
      description: "Your Description",
      email: "your@email.com",
      phone: "+1234567890",
      location: "Your City, Country",
      profileImage: "",
      socialLinks: {},
      cvUrl: "",
    })
  }
  return settings
}

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema)
