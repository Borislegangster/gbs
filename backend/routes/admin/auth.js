const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize")
const User = require("../../models/User")
const UserSession = require("../../models/UserSession")
const { adminAuth } = require("../../middleware/adminAuth")

const router = express.Router()

// Admin Login avec vérifications complètes
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body

    // Find user
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" })
    }

    // VÉRIFICATION 1: Compte désactivé (is_active = false)
    if (!user.is_active) {
      return res.status(403).json({
        message: "Votre compte a été désactivé. Contactez l'administrateur système.",
      })
    }

    // VÉRIFICATION 2: Statut inactif (status = 'inactive')
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Votre compte est temporairement suspendu. Contactez l'administrateur.",
      })
    }

    // VÉRIFICATION 3: Vérifier que l'utilisateur a les droits admin ou editor
    if (!["admin", "editor"].includes(user.role)) {
      return res.status(403).json({
        message:
          "Accès refusé. Vous n'avez pas les permissions nécessaires pour accéder à l'interface d'administration.",
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" })
    }

    // Generate JWT token avec des permissions admin
    const expiresIn = rememberMe ? "30d" : "8h" // Sessions admin plus courtes
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        isAdmin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn },
    )

    // Update last login
    await user.update({ last_login_at: new Date() })

    // Create admin session
    const expiresAt = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours

    await UserSession.create({
      user_id: user.id,
      session_token: token,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
      expires_at: expiresAt,
      session_type: "admin", // Marquer comme session admin
    })

    // Return user data (without password) avec permissions
    const { password: _, ...userWithoutPassword } = user.toJSON()

    // Ajouter les permissions basées sur le rôle
    const permissions = getPermissionsByRole(user.role)

    res.json({
      message: "Connexion admin réussie",
      token,
      user: {
        ...userWithoutPassword,
        permissions,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Erreur lors de la connexion" })
  }
})

// Get current admin user avec vérifications
router.get("/profile", adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    // Vérifier que le compte est toujours actif
    if (!user.is_active) {
      return res.status(403).json({
        message: "Votre compte a été désactivé. Contactez l'administrateur système.",
      })
    }

    // Vérifier que le statut est actif
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Votre compte est temporairement suspendu.",
      })
    }

    // Vérifier les permissions
    if (!["admin", "editor"].includes(user.role)) {
      return res.status(403).json({ message: "Accès refusé" })
    }

    const permissions = getPermissionsByRole(user.role)

    res.json({
      user: {
        ...user.toJSON(),
        permissions,
      },
    })
  } catch (error) {
    console.error("Get admin profile error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des données" })
  }
})

// Update admin profile
router.put("/profile", adminAuth, async (req, res) => {
  try {
    const { name, phone } = req.body

    const user = await User.findByPk(req.userId)
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    await user.update({ name, phone })

    const { password: _, ...userWithoutPassword } = user.toJSON()
    const permissions = getPermissionsByRole(user.role)

    res.json({
      user: {
        ...userWithoutPassword,
        permissions,
      },
    })
  } catch (error) {
    console.error("Update admin profile error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour" })
  }
})

// Admin logout
router.post("/logout", adminAuth, async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (token) {
      // Enregistrer la fin de session admin
      await UserSession.update(
        { is_active: false, logout_at: new Date() },
        {
          where: {
            session_token: token,
            is_active: true,
            session_type: "admin",
          },
        },
      )
    }

    res.json({ message: "Déconnexion admin réussie" })
  } catch (error) {
    console.error("Admin logout error:", error)
    res.status(500).json({ message: "Erreur lors de la déconnexion" })
  }
})

// Fonction pour obtenir les permissions selon le rôle
function getPermissionsByRole(role) {
  const permissions = {
    admin: [
      "users.read",
      "users.create",
      "users.update",
      "users.delete",
      "projects.read",
      "projects.create",
      "projects.update",
      "projects.delete",
      "services.read",
      "services.create",
      "services.update",
      "services.delete",
      "blog.read",
      "blog.create",
      "blog.update",
      "blog.delete",
      "contacts.read",
      "contacts.update",
      "contacts.delete",
      "media.read",
      "media.upload",
      "media.delete",
      "testimonials.read",
      "testimonials.create",
      "testimonials.update",
      "testimonials.delete",
      "faq.read",
      "faq.create",
      "faq.update",
      "faq.delete",
      "newsletter.read",
      "newsletter.create",
      "newsletter.delete",
      "home-content.read",
      "home-content.create",
      "home-content.update",
      "home-content.delete",
      "settings.read",
      "settings.update",
      "dashboard.read",
    ],
    editor: [
      "projects.read",
      "projects.create",
      "projects.update",
      "services.read",
      "services.create",
      "services.update",
      "blog.read",
      "blog.create",
      "blog.update",
      "contacts.read",
      "contacts.update",
      "media.read",
      "media.upload",
      "testimonials.read",
      "testimonials.create",
      "testimonials.update",
      "faq.read",
      "faq.create",
      "faq.update",
      "home-content.read",
      "home-content.update",
      "dashboard.read",
    ],
    user: [],
  }

  return permissions[role] || []
}

module.exports = router
