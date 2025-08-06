const express = require("express")
const path = require("path")
const fs = require("fs")
const { uploadSingle, uploadMultiple, uploadFields, handleUploadError } = require("../middleware/upload/multerConfig")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

// Helper function to get file URL
const getFileUrl = (req, filename, folder) => {
  return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`
}

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post("/image", protect, uploadSingle("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const fileUrl = getFileUrl(req, req.file.filename, "images")
    
    res.status(200).json({
      message: "Image uploaded successfully",
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error: error.message })
  }
})

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post("/images", protect, uploadMultiple("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" })
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: getFileUrl(req, file.filename, "images"),
      path: file.path,
    }))

    res.status(200).json({
      message: "Images uploaded successfully",
      files,
    })
  } catch (error) {
    res.status(500).json({ message: "Error uploading images", error: error.message })
  }
})

// @desc    Upload single video
// @route   POST /api/upload/video
// @access  Private
router.post("/video", protect, uploadSingle("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const fileUrl = getFileUrl(req, req.file.filename, "videos")
    
    res.status(200).json({
      message: "Video uploaded successfully",
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Error uploading video", error: error.message })
  }
})

// @desc    Upload document (CV)
// @route   POST /api/upload/document
// @access  Private
router.post("/document", protect, uploadSingle("document"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const fileUrl = getFileUrl(req, req.file.filename, "documents")
    
    res.status(200).json({
      message: "Document uploaded successfully",
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Error uploading document", error: error.message })
  }
})

// @desc    Upload mixed files for project (images and videos)
// @route   POST /api/upload/project-files
// @access  Private
router.post(
  "/project-files",
  protect,
  uploadFields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  (req, res) => {
    try {
      if (!req.files) {
        return res.status(400).json({ message: "No files uploaded" })
      }

      const result = {}

      // Process main image
      if (req.files.mainImage && req.files.mainImage[0]) {
        const mainImage = req.files.mainImage[0]
        result.mainImage = {
          filename: mainImage.filename,
          originalName: mainImage.originalname,
          size: mainImage.size,
          url: getFileUrl(req, mainImage.filename, "images"),
          path: mainImage.path,
        }
      }

      // Process additional images
      if (req.files.images) {
        result.images = req.files.images.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          url: getFileUrl(req, file.filename, "images"),
          path: file.path,
        }))
      }

      // Process videos
      if (req.files.videos) {
        result.videos = req.files.videos.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          url: getFileUrl(req, file.filename, "videos"),
          path: file.path,
        }))
      }

      res.status(200).json({
        message: "Project files uploaded successfully",
        files: result,
      })
    } catch (error) {
      res.status(500).json({ message: "Error uploading project files", error: error.message })
    }
  },
)

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:folder/:filename
// @access  Private
router.delete("/:folder/:filename", protect, (req, res) => {
  try {
    const { folder, filename } = req.params
    const allowedFolders = ["images", "videos", "documents"]
    
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ message: "Invalid folder specified" })
    }

    const filePath = path.join(__dirname, "..", "uploads", folder, filename)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" })
    }

    // Delete the file
    fs.unlinkSync(filePath)
    
    res.status(200).json({ message: "File deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting file", error: error.message })
  }
})

// Error handling middleware
router.use(handleUploadError)

module.exports = router
