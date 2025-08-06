const Skill = require("../models/Skill")

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Private (Admin/Authenticated User)
exports.createSkill = async (req, res) => {
  try {
    const skill = new Skill(req.body)
    await skill.save()
    res.status(201).json({ message: "Skill created successfully", skill })
  } catch (error) {
    console.error("Error creating skill:", error)
    res.status(500).json({ message: "Server error creating skill", error: error.message })
  }
}

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find({})
    res.status(200).json(skills)
  } catch (error) {
    console.error("Error fetching skills:", error)
    res.status(500).json({ message: "Server error fetching skills", error: error.message })
  }
}

// @desc    Get single skill by ID
// @route   GET /api/skills/:id
// @access  Public
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" })
    }
    res.status(200).json(skill)
  } catch (error) {
    console.error("Error fetching skill by ID:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid skill ID format" })
    }
    res.status(500).json({ message: "Server error fetching skill", error: error.message })
  }
}

// @desc    Update a skill by ID
// @route   PUT /api/skills/:id
// @access  Private (Admin/Authenticated User)
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" })
    }
    res.status(200).json({ message: "Skill updated successfully", skill })
  } catch (error) {
    console.error("Error updating skill:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid skill ID format" })
    }
    res.status(500).json({ message: "Server error updating skill", error: error.message })
  }
}

// @desc    Delete a skill by ID
// @route   DELETE /api/skills/:id
// @access  Private (Admin/Authenticated User)
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id)
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" })
    }
    res.status(200).json({ message: "Skill deleted successfully" })
  } catch (error) {
    console.error("Error deleting skill:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid skill ID format" })
    }
    res.status(500).json({ message: "Server error deleting skill", error: error.message })
  }
}
