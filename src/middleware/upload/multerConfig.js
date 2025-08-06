const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ensure upload directories exist
const ensureUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Create upload directories
const uploadsDir = path.join(__dirname, "../../uploads")
const imagesDir = path.join(uploadsDir, "images")
const videosDir = path.join(uploadsDir, "videos")
const documentsDir = path.join(uploadsDir, "documents")

ensureUploadDir(imagesDir)
ensureUploadDir(videosDir)
ensureUploadDir(documentsDir)

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = imagesDir // default

    // Determine upload path based on file type
    if (file.mimetype.startsWith("image/")) {
      uploadPath = imagesDir
    } else if (file.mimetype.startsWith("video/")) {
      uploadPath = videosDir
    } else {
      uploadPath = documentsDir
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    const filename = file.fieldname + "-" + uniqueSuffix + extension
    cb(null, filename)
  },
})

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  const allowedVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"]
  const allowedDocumentTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only images, videos, and documents are allowed."), false)
  }
}

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
})

// Specific upload configurations
const uploadSingle = (fieldName) => upload.single(fieldName)
const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount)
const uploadFields = (fields) => upload.fields(fields)

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 50MB." })
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Maximum is 10 files." })
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Unexpected field name." })
    }
  }
  
  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({ message: error.message })
  }

  return res.status(500).json({ message: "File upload error", error: error.message })
}

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
}
