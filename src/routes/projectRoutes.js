const express = require("express")
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

// Public routes
router.get("/", getAllProjects)
router.get("/:id", getProjectById)

// Protected routes (require authentication)
router.post("/", protect, createProject)
router.put("/:id", protect, updateProject)
router.delete("/:id", protect, deleteProject)

module.exports = router
