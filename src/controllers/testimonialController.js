const Testimonial = require("../models/Testimonial")

// @desc    Create a new testimonial
// @route   POST /api/testimonials
// @access  Private (Admin/Authenticated User)
exports.createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body)
    await testimonial.save()
    res.status(201).json({ message: "Testimonial created successfully", testimonial })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    res.status(500).json({ message: "Server error creating testimonial", error: error.message })
  }
}

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({})
    res.status(200).json(testimonials)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    res.status(500).json({ message: "Server error fetching testimonials", error: error.message })
  }
}

// @desc    Get single testimonial by ID
// @route   GET /api/testimonials/:id
// @access  Public
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" })
    }
    res.status(200).json(testimonial)
  } catch (error) {
    console.error("Error fetching testimonial by ID:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid testimonial ID format" })
    }
    res.status(500).json({ message: "Server error fetching testimonial", error: error.message })
  }
}

// @desc    Update a testimonial by ID
// @route   PUT /api/testimonials/:id
// @access  Private (Admin/Authenticated User)
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" })
    }
    res.status(200).json({ message: "Testimonial updated successfully", testimonial })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid testimonial ID format" })
    }
    res.status(500).json({ message: "Server error updating testimonial", error: error.message })
  }
}

// @desc    Delete a testimonial by ID
// @route   DELETE /api/testimonials/:id
// @access  Private (Admin/Authenticated User)
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id)
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" })
    }
    res.status(200).json({ message: "Testimonial deleted successfully" })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid testimonial ID format" })
    }
    res.status(500).json({ message: "Server error deleting testimonial", error: error.message })
  }
}
