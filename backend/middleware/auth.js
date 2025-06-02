const jwt = require("jsonwebtoken")
const { User } = require("../models")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Token d'accès requis" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" })
    }

    // VÉRIFICATION 1: Compte désactivé (is_active = false)
    if (!user.is_active) {
      return res.status(403).json({
        message: "Votre compte a été désactivé. Contactez l'administrateur.",
      })
    }

    // VÉRIFICATION 2: Statut inactif
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Votre compte est temporairement suspendu.",
      })
    }

    req.user = decoded
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(403).json({ message: "Token invalide" })
  }
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentification requise" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permissions insuffisantes" })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole,
}
