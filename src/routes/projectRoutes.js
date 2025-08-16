const express = require("express")
const {
  createProject,
  createProjectWithFiles,
  getAllProjects,
  getProjectById,
  updateProject,
  updateProjectWithFiles,
  deleteProject,
} = require("../controllers/projectController")
const { protect } = require("../middleware/authMiddleware")
const { uploadFields, handleUploadError } = require("../middleware/upload/multerConfig")

const router = express.Router()

// Public routes
router.get("/", getAllProjects)
router.get("/:id", getProjectById)

// Protected routes (require authentication)
router.post("/", protect, createProject)
router.post(
  "/with-files",
  protect,
  uploadFields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  createProjectWithFiles
)
router.put("/:id", protect, updateProject)
router.put(
  "/:id/with-files",
  protect,
  uploadFields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  updateProjectWithFiles
)
router.delete("/:id", protect, deleteProject)

// Error handling middleware for multer
router.use(handleUploadError)

module.exports = router
