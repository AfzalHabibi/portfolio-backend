const express = require("express")
const { getSiteSettings, updateSiteSettings, createSiteSettings, deleteSiteSettings } = require("../controllers/siteSettingsController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()


// Public route to get settings
router.get("/", getSiteSettings)

// Protected route to create settings (should only be used if no settings exist)
router.post("/", protect, createSiteSettings)

// Protected route to update settings
router.put("/", protect, updateSiteSettings)

// Protected route to delete settings
router.delete("/", protect, deleteSiteSettings)

module.exports = router
