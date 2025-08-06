const express = require("express")
const {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

// Public routes
router.get("/", getAllTestimonials)
router.get("/:id", getTestimonialById)

// Protected routes
router.post("/", protect, createTestimonial)
router.put("/:id", protect, updateTestimonial)
router.delete("/:id", protect, deleteTestimonial)

module.exports = router
