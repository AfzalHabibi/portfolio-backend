const SiteSettings = require("../models/SiteSettings")

// Get site settings
exports.getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings()
    res.status(200).json(settings)
  } catch (error) {
    console.error("Error fetching site settings:", error)
    res.status(500).json({ message: "Server error fetching site settings" })
  }
}

// Create site settings (explicit, for completeness)
exports.createSiteSettings = async (req, res) => {
  try {
    // Check if a settings document already exists
    const exists = await SiteSettings.findOne()
    if (exists) {
      return res.status(400).json({ message: "Site settings already exist. Use update instead." })
    }
    const settings = new SiteSettings(req.body)
    await settings.save()
    res.status(201).json({ message: "Site settings created successfully", settings })
  } catch (error) {
    console.error("Error creating site settings:", error)
    res.status(500).json({ message: "Server error creating site settings" })
  }
}

// Update site settings
exports.updateSiteSettings = async (req, res) => {
  try {
    // Find the single settings document and update it
    // upsert: true creates the document if it doesn't exist
    // new: true returns the modified document rather than the original
    const updatedSettings = await SiteSettings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true, // Ensure schema validators run on update
    })

    res.status(200).json({
      message: "Site settings updated successfully",
      settings: updatedSettings,
    })
  } catch (error) {
    console.error("Error updating site settings:", error)
    res.status(500).json({ message: "Server error updating site settings" })
  }
}

// Delete site settings
exports.deleteSiteSettings = async (req, res) => {
  try {
    const deleted = await SiteSettings.findOneAndDelete({})
    if (!deleted) {
      return res.status(404).json({ message: "No site settings found to delete" })
    }
    res.status(200).json({ message: "Site settings deleted successfully" })
  } catch (error) {
    console.error("Error deleting site settings:", error)
    res.status(500).json({ message: "Server error deleting site settings" })
  }
}
