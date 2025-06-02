const express = require("express")
const { body, validationResult } = require("express-validator")
const { Contact, User } = require("../models")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { Op } = require("sequelize")

const router = express.Router()

// Create contact (public)
router.post(
  "/",
  [
    body("name").notEmpty().trim().withMessage("Nom requis"),
    body("email").isEmail().withMessage("Email valide requis"),
    body("subject").notEmpty().withMessage("Sujet requis"),
    body("message").notEmpty().withMessage("Message requis"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const contact = await Contact.create(req.body)
      res.status(201).json({ message: "Message envoyé avec succès", contact })
    } catch (error) {
      console.error("Create contact error:", error)
      res.status(500).json({ message: "Erreur serveur" })
    }
  },
)

// Admin routes
router.use(authenticateToken)

// Get all contacts (admin)
router.get("/", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
      ]
    }

    const { count, rows } = await Contact.findAndCountAll({
      where,
      include: [{ model: User, as: "assignee", attributes: ["id", "name"], required: false }],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["created_at", "DESC"]],
    })

    res.json({
      contacts: rows,
      total: count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error("Get contacts error:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// Update contact
router.put("/:id", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id)
    if (!contact) {
      return res.status(404).json({ message: "Contact non trouvé" })
    }

    if (req.body.status === "responded" && !contact.responded_at) {
      req.body.responded_at = new Date()
    }

    await contact.update(req.body)
    res.json(contact)
  } catch (error) {
    console.error("Update contact error:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// Delete contact
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id)
    if (!contact) {
      return res.status(404).json({ message: "Contact non trouvé" })
    }

    await contact.destroy()
    res.json({ message: "Contact supprimé avec succès" })
  } catch (error) {
    console.error("Delete contact error:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router
