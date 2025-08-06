const express = require("express")
const {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

// Public routes
router.get("/", getAllSkills)
router.get("/:id", getSkillById)

// Protected routes
router.post("/", protect, createSkill)
router.put("/:id", protect, updateSkill)
router.delete("/:id", protect, deleteSkill)

module.exports = router
