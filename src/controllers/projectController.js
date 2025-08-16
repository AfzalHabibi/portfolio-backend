const Project = require("../models/Project")
const fs = require("fs")
const path = require("path")

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.error("Error deleting file:", error)
  }
}

// Helper function to extract filename from URL
const getFilenameFromUrl = (url) => {
  if (!url) return null
  const parts = url.split("/")
  return parts[parts.length - 1]
}

// @desc    Create a new project with file uploads
// @route   POST /api/projects/with-files
// @access  Private (Admin/Authenticated User)
exports.createProjectWithFiles = async (req, res) => {
  try {
    const projectData = { ...req.body }
    
    // Validate required files
    if (!req.files || !req.files.mainImage || !req.files.mainImage[0]) {
      return res.status(400).json({ message: "Main image is required" })
    }
    
    // Handle file URLs from uploaded files
    if (req.files) {
      // Handle main image
      if (req.files.mainImage && req.files.mainImage[0]) {
        projectData.mainImage = `${req.protocol}://${req.get("host")}/uploads/images/${req.files.mainImage[0].filename}`
      }
      
      // Handle additional images
      if (req.files.images) {
        projectData.images = req.files.images.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/images/${file.filename}`
        )
      } else {
        projectData.images = [] // Ensure it's an empty array if no additional images
      }
      
      // Handle videos
      if (req.files.videos) {
        projectData.videos = req.files.videos.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/videos/${file.filename}`
        )
      } else {
        projectData.videos = [] // Ensure it's an empty array if no videos
      }
    }

    // Parse arrays from form data if they come as strings
    if (typeof projectData.features === 'string') {
      try {
        projectData.features = JSON.parse(projectData.features)
      } catch (e) {
        return res.status(400).json({ message: "Invalid features format. Must be a valid JSON array." })
      }
    }
    
    if (typeof projectData.technologies === 'string') {
      try {
        projectData.technologies = JSON.parse(projectData.technologies)
      } catch (e) {
        return res.status(400).json({ message: "Invalid technologies format. Must be a valid JSON array." })
      }
    }

    // Validate required fields
    if (!projectData.title || !projectData.description || !projectData.longDescription || 
        !projectData.category || !projectData.completedDate) {
      return res.status(400).json({ 
        message: "Missing required fields: title, description, longDescription, category, completedDate" 
      })
    }

    if (!projectData.technologies || !Array.isArray(projectData.technologies) || projectData.technologies.length === 0) {
      return res.status(400).json({ 
        message: "At least one technology is required" 
      })
    }

    const project = new Project(projectData)
    await project.save()
    
    res.status(201).json({
      message: "Project created successfully with files",
      project,
    })
  } catch (error) {
    console.error("Error creating project with files:", error)
    
    // Clean up uploaded files if project creation fails
    if (req.files) {
      const uploadsDir = path.join(__dirname, "..", "uploads")
      
      if (req.files.mainImage) {
        req.files.mainImage.forEach(file => {
          deleteFile(path.join(uploadsDir, "images", file.filename))
        })
      }
      
      if (req.files.images) {
        req.files.images.forEach(file => {
          deleteFile(path.join(uploadsDir, "images", file.filename))
        })
      }
      
      if (req.files.videos) {
        req.files.videos.forEach(file => {
          deleteFile(path.join(uploadsDir, "videos", file.filename))
        })
      }
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(error.errors).map(err => err.message) 
      })
    }
    
    res.status(500).json({ message: "Server error creating project", error: error.message })
  }
}

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

// @desc    Update a project by ID with file uploads
// @route   PUT /api/projects/:id/with-files
// @access  Private (Admin/Authenticated User)
exports.updateProjectWithFiles = async (req, res) => {
  try {
    // Get existing project first
    const existingProject = await Project.findById(req.params.id)
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" })
    }

    const projectData = { ...req.body }
    const uploadsDir = path.join(__dirname, "..", "uploads")
    
    // Handle file URLs from uploaded files
    if (req.files) {
      // Handle main image replacement
      if (req.files.mainImage && req.files.mainImage[0]) {
        // Delete old main image if exists
        if (existingProject.mainImage) {
          const oldMainImageFilename = getFilenameFromUrl(existingProject.mainImage)
          if (oldMainImageFilename) {
            const oldMainImagePath = path.join(uploadsDir, "images", oldMainImageFilename)
            deleteFile(oldMainImagePath)
          }
        }
        projectData.mainImage = `${req.protocol}://${req.get("host")}/uploads/images/${req.files.mainImage[0].filename}`
      }
      
      // Handle additional images replacement
      if (req.files.images) {
        // Delete old images if replacing
        if (existingProject.images && existingProject.images.length > 0) {
          existingProject.images.forEach((imageUrl) => {
            const filename = getFilenameFromUrl(imageUrl)
            if (filename) {
              const imagePath = path.join(uploadsDir, "images", filename)
              deleteFile(imagePath)
            }
          })
        }
        projectData.images = req.files.images.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/images/${file.filename}`
        )
      }
      
      // Handle videos replacement
      if (req.files.videos) {
        // Delete old videos if replacing
        if (existingProject.videos && existingProject.videos.length > 0) {
          existingProject.videos.forEach((videoUrl) => {
            const filename = getFilenameFromUrl(videoUrl)
            if (filename) {
              const videoPath = path.join(uploadsDir, "videos", filename)
              deleteFile(videoPath)
            }
          })
        }
        projectData.videos = req.files.videos.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/videos/${file.filename}`
        )
      }
    }

    // Parse arrays from form data if they come as strings
    if (typeof projectData.features === 'string') {
      try {
        projectData.features = JSON.parse(projectData.features)
      } catch (e) {
        return res.status(400).json({ message: "Invalid features format" })
      }
    }
    if (typeof projectData.technologies === 'string') {
      try {
        projectData.technologies = JSON.parse(projectData.technologies)
      } catch (e) {
        return res.status(400).json({ message: "Invalid technologies format" })
      }
    }

    const project = await Project.findByIdAndUpdate(req.params.id, projectData, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      message: "Project updated successfully with files",
      project,
    })
  } catch (error) {
    console.error("Error updating project with files:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid project ID format" })
    }
    res.status(500).json({ message: "Server error updating project", error: error.message })
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
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    // Delete associated files
    const uploadsDir = path.join(__dirname, "..", "uploads")
    
    // Delete main image
    if (project.mainImage) {
      const mainImageFilename = getFilenameFromUrl(project.mainImage)
      if (mainImageFilename) {
        const mainImagePath = path.join(uploadsDir, "images", mainImageFilename)
        deleteFile(mainImagePath)
      }
    }

    // Delete additional images
    if (project.images && project.images.length > 0) {
      project.images.forEach((imageUrl) => {
        const filename = getFilenameFromUrl(imageUrl)
        if (filename) {
          const imagePath = path.join(uploadsDir, "images", filename)
          deleteFile(imagePath)
        }
      })
    }

    // Delete videos
    if (project.videos && project.videos.length > 0) {
      project.videos.forEach((videoUrl) => {
        const filename = getFilenameFromUrl(videoUrl)
        if (filename) {
          const videoPath = path.join(uploadsDir, "videos", filename)
          deleteFile(videoPath)
        }
      })
    }

    // Delete the project from database
    await Project.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "Project and associated files deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid project ID format" })
    }
    res.status(500).json({ message: "Server error deleting project", error: error.message })
  }
}
