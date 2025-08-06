const SiteSettings = require("../models/SiteSettings")
const fs = require("fs")
const path = require("path")

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.error("Error deleting file:", error)
  }
}

// Helper function to extract filename from URL
const getFilenameFromUrl = (url) => {
  if (!url) return null
  const parts = url.split("/")
  return parts[parts.length - 1]
}

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

// Update site settings with file uploads
exports.updateSiteSettingsWithFiles = async (req, res) => {
  try {
    const updateData = { ...req.body }
    
    // Handle file uploads
    if (req.files) {
      // Handle profile image
      if (req.files.profileImage && req.files.profileImage[0]) {
        // Get current settings to delete old profile image
        const currentSettings = await SiteSettings.findOne()
        if (currentSettings && currentSettings.profileImage) {
          const oldFilename = getFilenameFromUrl(currentSettings.profileImage)
          if (oldFilename) {
            const oldFilePath = path.join(__dirname, "..", "uploads", "images", oldFilename)
            deleteFile(oldFilePath)
          }
        }
        
        updateData.profileImage = `${req.protocol}://${req.get("host")}/uploads/images/${req.files.profileImage[0].filename}`
      }
      
      // Handle CV file
      if (req.files.cv && req.files.cv[0]) {
        // Get current settings to delete old CV
        const currentSettings = await SiteSettings.findOne()
        if (currentSettings && currentSettings.cvUrl) {
          const oldFilename = getFilenameFromUrl(currentSettings.cvUrl)
          if (oldFilename) {
            const oldFilePath = path.join(__dirname, "..", "uploads", "documents", oldFilename)
            deleteFile(oldFilePath)
          }
        }
        
        updateData.cvUrl = `${req.protocol}://${req.get("host")}/uploads/documents/${req.files.cv[0].filename}`
      }
    }

    // Parse socialLinks if it comes as a string
    if (typeof updateData.socialLinks === 'string') {
      updateData.socialLinks = JSON.parse(updateData.socialLinks)
    }

    const updatedSettings = await SiteSettings.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
      runValidators: true,
    })

    res.status(200).json({
      message: "Site settings updated successfully with files",
      settings: updatedSettings,
    })
  } catch (error) {
    console.error("Error updating site settings with files:", error)
    res.status(500).json({ message: "Server error updating site settings", error: error.message })
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
