const express = require("express")
const { body, validationResult } = require("express-validator")
const { User } = require("../models")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const { Op } = require("sequelize")

const router = express.Router()

// Get all users (admin only)
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (search) {
      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }]
    }
    if (role) where.role = role
    if (status) where.status = status

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["created_at", "DESC"]],
    })

    res.json({
      users: rows,
      total: count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create user (admin only)
router.post(
  "/",
  auth,
  adminAuth,
  [
    body("name").notEmpty().trim(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["admin", "editor", "user"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, email, password, phone, address, role, status, permissions } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" })
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        address,
        role,
        status: status || "active",
        permissions: permissions || [],
      })

      res.status(201).json(user.toJSON())
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update user
router.put(
  "/:id",
  auth,
  [
    body("name").optional().notEmpty().trim(),
    body("email").optional().isEmail().normalizeEmail(),
    body("role").optional().isIn(["admin", "editor", "user"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const updates = req.body

      // Only admin can update other users or change roles
      if (req.user.userId !== Number.parseInt(id) && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      await user.update(updates)
      res.json(user.toJSON())
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete user (admin only)
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await user.destroy()
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
