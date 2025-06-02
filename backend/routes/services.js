const express = require("express")
const { body, validationResult } = require("express-validator")
const { Service } = require("../models")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { Op } = require("sequelize")

const router = express.Router()

// Get all services (public)
router.get("/", async (req, res) => {
  try {
    const { category, featured, status = "active" } = req.query

    const where = { published: true, status }
    if (category && category !== "all") where.category = category
    if (featured === "true") where.featured = true

    const services = await Service.findAll({
      where,
      order: [
        ["order_index", "ASC"],
        ["created_at", "DESC"],
      ],
    })

    // CORRECTION : Retourner directement les services pour le client
    res.json({ success: true, data: services })
  } catch (error) {
    console.error("Get services error:", error)
    res.status(500).json({ success: false, message: "Erreur serveur" })
  }
})

// Get service by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const service = await Service.findOne({
      where: { slug: req.params.slug, published: true, status: "active" },
    })

    if (!service) {
      return res.status(404).json({ success: false, message: "Service non trouvé" })
    }

    res.json({ success: true, data: service })
  } catch (error) {
    console.error("Get service error:", error)
    res.status(500).json({ success: false, message: "Erreur serveur" })
  }
})

// Admin routes
router.use(authenticateToken)

// Get all services (admin)
router.get("/admin/all", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, status } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (category && category !== "all") where.category = category
    if (status && status !== "all") where.status = status
    if (search) {
      where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }

    const { count, rows } = await Service.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [
        ["order_index", "ASC"],
        ["created_at", "DESC"],
      ],
    })

    res.json({
      success: true,
      data: {
        services: rows,
        total: count,
        page: Number.parseInt(page),
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Get admin services error:", error)
    res.status(500).json({ success: false, message: "Erreur serveur" })
  }
})

// Create service
router.post(
  "/",
  requireRole(["admin", "editor"]),
  [
    body("title").notEmpty().trim().withMessage("Titre requis"),
    body("description").notEmpty().withMessage("Description requise"),
    body("category").notEmpty().withMessage("Catégorie requise"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const slug = req.body.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Vérifier l'unicité du slug
      const existingService = await Service.findOne({ where: { slug } })
      if (existingService) {
        return res.status(400).json({
          success: false,
          message: "Un service avec ce titre existe déjà",
        })
      }

      const service = await Service.create({
        ...req.body,
        slug,
      })

      res.status(201).json({ success: true, data: service, message: "Service créé avec succès" })
    } catch (error) {
      console.error("Create service error:", error)
      res.status(500).json({ success: false, message: "Erreur lors de la création du service" })
    }
  },
)

// Update service
router.put("/:id", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) {
      return res.status(404).json({ success: false, message: "Service non trouvé" })
    }

    if (req.body.title && req.body.title !== service.title) {
      const newSlug = req.body.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Vérifier l'unicité du nouveau slug
      const existingService = await Service.findOne({
        where: { slug: newSlug, id: { [Op.ne]: req.params.id } },
      })
      if (existingService) {
        return res.status(400).json({
          success: false,
          message: "Un service avec ce titre existe déjà",
        })
      }

      req.body.slug = newSlug
    }

    await service.update(req.body)
    res.json({ success: true, data: service, message: "Service mis à jour avec succès" })
  } catch (error) {
    console.error("Update service error:", error)
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du service" })
  }
})

// Delete service
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) {
      return res.status(404).json({ success: false, message: "Service non trouvé" })
    }

    await service.destroy()
    res.json({ success: true, message: "Service supprimé avec succès" })
  } catch (error) {
    console.error("Delete service error:", error)
    res.status(500).json({ success: false, message: "Erreur lors de la suppression du service" })
  }
})

// Toggle service status
router.patch("/:id/toggle-status", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) {
      return res.status(404).json({ success: false, message: "Service non trouvé" })
    }

    const newStatus = service.status === "active" ? "inactive" : "active"
    await service.update({ status: newStatus })

    res.json({
      success: true,
      data: service,
      message: `Service ${newStatus === "active" ? "activé" : "désactivé"} avec succès`,
    })
  } catch (error) {
    console.error("Toggle service status error:", error)
    res.status(500).json({ success: false, message: "Erreur lors du changement de statut" })
  }
})

module.exports = router
