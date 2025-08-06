const Project = require("../models/Project")

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin/Authenticated User)
exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body)
    await project.save()
    res.status(201).json({
      message: "Project created successfully",
      project,
    })
  } catch (error) {
    console.error("Error creating project:", error)
    res.status(500).json({ message: "Server error creating project", error: error.message })
  }
}

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
    res.status(200).json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    res.status(500).json({ message: "Server error fetching projects", error: error.message })
  }
}

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    res.status(200).json(project)
  } catch (error) {
    console.error("Error fetching project by ID:", error)
    // Handle invalid MongoDB ID format
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid project ID format" })
    }
    res.status(500).json({ message: "Server error fetching project", error: error.message })
  }
}

// @desc    Update a project by ID
// @route   PUT /api/projects/:id
// @access  Private (Admin/Authenticated User)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    res.status(200).json({
      message: "Project updated successfully",
      project,
    })
  } catch (error) {
    console.error("Error updating project:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid project ID format" })
    }
    res.status(500).json({ message: "Server error updating project", error: error.message })
  }
}

// @desc    Delete a project by ID
// @route   DELETE /api/projects/:id
// @access  Private (Admin/Authenticated User)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    res.status(200).json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid project ID format" })
    }
    res.status(500).json({ message: "Server error deleting project", error: error.message })
  }
}
