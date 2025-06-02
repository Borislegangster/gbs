const express = require("express")
const { body, validationResult } = require("express-validator")
const { Project, User } = require("../models")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { Op } = require("sequelize")

const router = express.Router()

// Get all projects (public)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, featured, search } = req.query
    const offset = (page - 1) * limit

    const where = { published: true }
    if (category) where.category = category
    if (status) where.status = status
    if (featured === "true") where.featured = true
    if (search) {
      where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["created_at", "DESC"]],
    })

    res.json({
      success: true,
      data: rows,
      total: count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du chargement des projets",
    })
  }
})

// Get project by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { slug: req.params.slug, published: true },
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      })
    }

    res.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error("Get project error:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du chargement du projet",
    })
  }
})

// Admin routes
router.use(authenticateToken)

// Get all projects (admin)
router.get("/admin/all", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (category) where.category = category
    if (status) where.status = status
    if (search) {
      where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }]
    }

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{ model: User, as: "creator", attributes: ["id", "name"] }],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["created_at", "DESC"]],
    })

    res.json({
      success: true,
      data: rows,
      total: count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error("Get admin projects error:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du chargement des projets",
    })
  }
})

// Create project
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
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: errors.array(),
        })
      }

      const slug = req.body.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Vérifier l'unicité du slug
      const existingProject = await Project.findOne({ where: { slug } })
      if (existingProject) {
        return res.status(400).json({
          success: false,
          message: "Un projet avec ce titre existe déjà",
        })
      }

      const project = await Project.create({
        ...req.body,
        slug,
        created_by: req.user.userId,
      })

      res.status(201).json({
        success: true,
        data: project,
        message: "Projet créé avec succès",
      })
    } catch (error) {
      console.error("Create project error:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la création du projet",
      })
    }
  },
)

// Update project
router.put("/:id", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      })
    }

    if (req.body.title && req.body.title !== project.title) {
      const newSlug = req.body.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Vérifier l'unicité du nouveau slug
      const existingProject = await Project.findOne({
        where: {
          slug: newSlug,
          id: { [Op.ne]: req.params.id },
        },
      })

      if (existingProject) {
        return res.status(400).json({
          success: false,
          message: "Un projet avec ce titre existe déjà",
        })
      }

      req.body.slug = newSlug
    }

    await project.update(req.body)

    res.json({
      success: true,
      data: project,
      message: "Projet mis à jour avec succès",
    })
  } catch (error) {
    console.error("Update project error:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du projet",
    })
  }
})

// Toggle project status
router.patch("/:id/toggle-status", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      })
    }

    await project.update({ published: !project.published })

    res.json({
      success: true,
      data: project,
      message: `Projet ${project.published ? "publié" : "dépublié"} avec succès`,
    })
  } catch (error) {
    console.error("Toggle project status error:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors du changement de statut",
    })
  }
})

// Delete project
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      })
    }

    await project.destroy()

    res.json({
      success: true,
      message: "Projet supprimé avec succès",
    })
  } catch (error) {
    console.error("Delete project error:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression du projet",
    })
  }
})

module.exports = router
