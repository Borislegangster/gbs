const express = require("express")
const { body, validationResult } = require("express-validator")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()

// Mock settings data
const settings = {
  general: {
    site_name: "AME Construction",
    site_description: "Expert en construction et rénovation",
    site_url: "https://ame-construction.com",
    admin_email: "admin@ame-construction.com",
    timezone: "Africa/Douala",
    language: "fr",
    maintenance_mode: false,
  },
  email: {
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_encryption: "tls",
    from_email: "noreply@ame-construction.com",
    from_name: "AME Construction",
  },
  security: {
    two_factor_auth: false,
    session_timeout: 120,
    password_min_length: 8,
    require_password_change: false,
    login_attempts: 5,
    lockout_duration: 15,
  },
  notifications: {
    email_notifications: true,
    new_contact_notifications: true,
    project_update_notifications: true,
    system_notifications: true,
    weekly_reports: false,
  },
}

// Get all settings (admin only)
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    res.json(settings)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update settings (admin only)
router.put("/:category", auth, adminAuth, async (req, res) => {
  try {
    const { category } = req.params

    if (!settings[category]) {
      return res.status(404).json({ message: "Settings category not found" })
    }

    settings[category] = { ...settings[category], ...req.body }
    res.json(settings[category])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
