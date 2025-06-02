const jwt = require("jsonwebtoken")
const { User } = require("../models")

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Token d'accès admin requis" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Vérifier que c'est un token admin
    if (!decoded.isAdmin) {
      return res.status(401).json({ message: "Token admin invalide" })
    }

    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" })
    }

    // VÉRIFICATION 1: Compte désactivé (is_active = false)
    if (!user.is_active) {
      return res.status(403).json({
        message: "Votre compte a été désactivé. Contactez l'administrateur système.",
      })
    }

    // VÉRIFICATION 2: Statut inactif
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Votre compte est temporairement suspendu.",
      })
    }

    // VÉRIFICATION 3: Permissions admin/editor
    if (!["admin", "editor"].includes(user.role)) {
      return res.status(403).json({ message: "Permissions insuffisantes" })
    }

    req.userId = decoded.userId
    req.userRole = decoded.role
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ message: "Token admin invalide" })
  }
}

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentification requise" })
    }

    const userPermissions = getPermissionsByRole(req.user.role)

    if (!userPermissions.includes(permission) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Permission insuffisante" })
    }

    next()
  }
}

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Accès refusé. Seuls les administrateurs peuvent effectuer cette action.",
    })
  }
  next()
}

// Fonction pour obtenir les permissions (dupliquée pour le middleware)
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

module.exports = {
  adminAuth,
  requirePermission,
  requireAdmin,
}
