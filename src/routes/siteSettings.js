const express = require("express")
const { 
  getSiteSettings, 
  updateSiteSettings, 
  updateSiteSettingsWithFiles,
  createSiteSettings, 
  deleteSiteSettings 
} = require("../controllers/siteSettingsController")
const { protect } = require("../middleware/authMiddleware")
const { uploadFields } = require("../middleware/upload/multerConfig")

const router = express.Router()

// Public route to get settings
router.get("/", getSiteSettings)

// Protected route to create settings (should only be used if no settings exist)
router.post("/", protect, createSiteSettings)

// Protected route to update settings
router.put("/", protect, updateSiteSettings)

// Protected route to update settings with file uploads
router.put(
  "/with-files",
  protect,
  uploadFields([
    { name: "profileImage", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  updateSiteSettingsWithFiles
)

// Protected route to delete settings
router.delete("/", protect, deleteSiteSettings)

module.exports = router
