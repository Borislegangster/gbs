const express = require("express")
const { body, validationResult } = require("express-validator")
const { User, BannedUser } = require("../../models")
const auth = require("../../middleware/auth")
const adminAuth = require("../../middleware/adminAuth")
const { Op } = require("sequelize")

const router = express.Router()

// Middleware pour vérifier que seuls les admins peuvent accéder à la gestion des utilisateurs
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Accès refusé. Seuls les administrateurs peuvent gérer les utilisateurs.",
    })
  }
  next()
}

// Get all users (admin only)
router.get("/", auth, adminAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ]
    }
    if (role && role !== "all") where.role = role
    if (status && status !== "all") where.status = status

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["password"] },
    })

    res.json({
      users: rows,
      total: count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs" })
  }
})

// Update user role (admin only)
router.put(
  "/:id/role",
  auth,
  adminAuth,
  requireAdmin,
  [body("role").isIn(["user", "editor", "admin"]).withMessage("Rôle invalide")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { role } = req.body

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" })
      }

      // Empêcher de modifier son propre rôle
      if (user.id === req.user.userId) {
        return res.status(400).json({ message: "Vous ne pouvez pas modifier votre propre rôle" })
      }

      const oldRole = user.role
      await user.update({ role })

      res.json({
        message: `Rôle mis à jour de "${oldRole}" vers "${role}"`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          is_active: user.is_active,
        },
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      res.status(500).json({ message: "Erreur lors de la mise à jour du rôle" })
    }
  },
)

// Update user status (admin only)
router.put(
  "/:id/status",
  auth,
  adminAuth,
  requireAdmin,
  [body("status").isIn(["active", "inactive"]).withMessage("Statut invalide")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { status } = req.body

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" })
      }

      // Empêcher de modifier son propre statut
      if (user.id === req.user.userId) {
        return res.status(400).json({ message: "Vous ne pouvez pas modifier votre propre statut" })
      }

      const oldStatus = user.status
      await user.update({ status })

      res.json({
        message: `Statut mis à jour de "${oldStatus}" vers "${status}"`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          is_active: user.is_active,
        },
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      res.status(500).json({ message: "Erreur lors de la mise à jour du statut" })
    }
  },
)

// NOUVELLE ROUTE: Toggle user account activation (admin only)
router.put(
  "/:id/toggle-account",
  auth,
  adminAuth,
  requireAdmin,
  [body("is_active").isBoolean().withMessage("is_active doit être un booléen")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { is_active } = req.body

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" })
      }

      // Empêcher de désactiver son propre compte
      if (user.id === req.user.userId) {
        return res.status(400).json({ message: "Vous ne pouvez pas désactiver votre propre compte" })
      }

      const oldIsActive = user.is_active
      await user.update({ is_active })

      res.json({
        message: `Compte ${is_active ? "activé" : "désactivé"} avec succès`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          is_active: user.is_active,
        },
        action: is_active ? "activated" : "deactivated",
      })
    } catch (error) {
      console.error("Error toggling user account:", error)
      res.status(500).json({ message: "Erreur lors de l'activation/désactivation du compte" })
    }
  },
)

// Ban user (admin only)
router.delete(
  "/:id",
  auth,
  adminAuth,
  requireAdmin,
  [body("reason").optional().isString().withMessage("La raison doit être une chaîne de caractères")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const { reason } = req.body

      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" })
      }

      // Empêcher de bannir son propre compte
      if (user.id === req.user.userId) {
        return res.status(400).json({ message: "Vous ne pouvez pas bannir votre propre compte" })
      }

      // Empêcher de bannir un autre admin
      if (user.role === "admin") {
        return res.status(400).json({ message: "Impossible de bannir un autre administrateur" })
      }

      // Enregistrer dans l'historique des bannis
      await BannedUser.create({
        user_id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        banned_by: req.user.userId,
        ban_reason: reason || "Aucune raison spécifiée",
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      })

      // Supprimer l'utilisateur
      await user.destroy()

      res.json({
        message: `Utilisateur ${user.name} (${user.email}) a été banni avec succès`,
      })
    } catch (error) {
      console.error("Error banning user:", error)
      res.status(500).json({ message: "Erreur lors du bannissement de l'utilisateur" })
    }
  },
)

// Check if email/phone is banned
router.post("/check-banned", async (req, res) => {
  try {
    const { email, phone } = req.body

    const where = {}
    if (email) where.email = email
    if (phone) where.phone = phone

    const bannedUser = await BannedUser.findOne({
      where: {
        [Op.or]: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
      },
    })

    if (bannedUser) {
      return res.status(403).json({
        message: "Cette adresse email ou ce numéro de téléphone a été banni",
        banned: true,
        bannedAt: bannedUser.banned_at,
        reason: bannedUser.ban_reason,
      })
    }

    res.json({ banned: false })
  } catch (error) {
    console.error("Error checking banned status:", error)
    res.status(500).json({ message: "Erreur lors de la vérification" })
  }
})

module.exports = router
