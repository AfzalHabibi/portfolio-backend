const express = require("express")
const {
  createSkill,
  createSkillDirect,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  addSkillItem,
  updateSkillItem,
  deleteSkillItem,
  reorderSkills,
} = require("../controllers/skillController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

// Public routes
router.get("/", getAllSkills)
router.get("/:id", getSkillById)

// Protected routes - Direct skill creation
router.post("/direct", protect, createSkillDirect)

// Protected routes - Categories
router.post("/", protect, createSkill)
router.put("/reorder", protect, reorderSkills)
router.put("/:id", protect, updateSkill)
router.delete("/:id", protect, deleteSkill)

// Protected routes - Skill Items
router.post("/:id/items", protect, addSkillItem)
router.put("/:id/items/:itemId", protect, updateSkillItem)
router.delete("/:id/items/:itemId", protect, deleteSkillItem)

module.exports = router
