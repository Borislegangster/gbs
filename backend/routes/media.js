const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const auth = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/"
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

// Upload files
router.post("/upload", auth, upload.array("files", 10), (req, res) => {
  try {
    const files = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
    }))

    res.json({ files })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Upload failed" })
  }
})

// Get all media files
router.get("/", auth, (req, res) => {
  try {
    const uploadsDir = "uploads/"
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ files: [] })
    }

    const files = fs.readdirSync(uploadsDir).map((filename) => {
      const filePath = path.join(uploadsDir, filename)
      const stats = fs.statSync(filePath)

      return {
        filename,
        size: stats.size,
        created_at: stats.birthtime,
        url: `/uploads/${filename}`,
      }
    })

    res.json({ files })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete file
router.delete("/:filename", auth, (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join("uploads/", filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ message: "File deleted successfully" })
    } else {
      res.status(404).json({ message: "File not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
