const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { Op } = require("sequelize")
const User = require("../models/User")
const UserSession = require("../models/UserSession")
const PasswordReset = require("../models/PasswordReset")
const EmailVerification = require("../models/EmailVerification")
const BannedUser = require("../models/BannedUser")
const { sendEmail } = require("../utils/email")
const auth = require("../middleware/auth")
const { validate, schemas } = require("../middleware/validation")
const UserProfileHistory = require("../models/UserProfileHistory")

const router = express.Router()

// Register
router.post("/register", validate(schemas.registerUser), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // Vérifier si l'utilisateur est banni
    const bannedUser = await BannedUser.findOne({
      where: {
        [Op.or]: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    })

    if (bannedUser) {
      return res.status(403).json({
        message: "Cette adresse email ou ce numéro de téléphone a été banni de la plateforme.",
      })
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, Number.parseInt(process.env.BCRYPT_ROUNDS) || 12)

    // Create user avec statut actif par défaut
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user", // Rôle par défaut
      status: "active", // Statut par défaut
      is_active: true, // Compte actif par défaut
    })

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    })

    // Create session
    await UserSession.create({
      user_id: user.id,
      session_token: token,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      session_type: "client",
    })

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    await EmailVerification.create({
      user_id: user.id,
      token: verificationToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: email,
      subject: "Vérifiez votre adresse email - AME Construction",
      html: `
        <h2>Bienvenue chez AME Construction !</h2>
        <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a>
        <p>Ce lien expirera dans 24 heures.</p>
      `,
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user.toJSON()

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Erreur lors de l'inscription" })
  }
})

// Login CLIENT avec vérifications complètes
router.post("/login", validate(schemas.loginUser), async (req, res) => {
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
        message: "Votre compte a été désactivé. Contactez l'administrateur pour plus d'informations.",
      })
    }

    // VÉRIFICATION 2: Statut inactif
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Votre compte est temporairement suspendu. Contactez l'administrateur.",
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" })
    }

    // Generate JWT token
    const expiresIn = rememberMe ? "30d" : "24h"
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn })

    // Update last login
    await user.update({ last_login_at: new Date() })

    // Create session
    const expiresAt = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await UserSession.create({
      user_id: user.id,
      session_token: token,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
      expires_at: expiresAt,
      session_type: "client",
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user.toJSON()

    res.json({
      message: "Connexion réussie",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Erreur lors de la connexion" })
  }
})

// Update profile
router.put("/profile", auth, validate(schemas.updateProfile), async (req, res) => {
  try {
    const { name, phone } = req.body

    const user = await User.findByPk(req.userId)
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    // Enregistrer l'historique des modifications
    const changes = []
    if (name !== user.name) {
      changes.push({
        user_id: req.userId,
        field_changed: "name",
        old_value: user.name,
        new_value: name,
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      })
    }
    if (phone !== user.phone) {
      changes.push({
        user_id: req.userId,
        field_changed: "phone",
        old_value: user.phone,
        new_value: phone,
        ip_address: req.ip,
        user_agent: req.get("User-Agent"),
      })
    }

    // Sauvegarder les modifications
    if (changes.length > 0) {
      await UserProfileHistory.bulkCreate(changes)
    }

    await user.update({ name, phone })

    const { password: _, ...userWithoutPassword } = user.toJSON()
    res.json(userWithoutPassword)
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour" })
  }
})

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")

    // Delete any existing reset tokens for this email
    await PasswordReset.destroy({ where: { email } })

    // Create new reset token (expires in 5 minutes)
    await PasswordReset.create({
      email,
      token: resetToken,
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    })

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    await sendEmail({
      to: email,
      subject: "Réinitialisation de mot de passe - AME Construction",
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
        <p><strong>Ce lien expirera dans 5 minutes.</strong></p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
    })

    res.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email" })
  }
})

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body

    // Find valid reset token
    const resetRecord = await PasswordReset.findOne({
      where: {
        token,
        expires_at: { [Op.gt]: new Date() },
        used_at: null,
      },
    })

    if (!resetRecord) {
      return res.status(400).json({ message: "Token invalide ou expiré" })
    }

    // Find user
    const user = await User.findOne({ where: { email: resetRecord.email } })
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, Number.parseInt(process.env.BCRYPT_ROUNDS) || 12)

    // Update user password
    await user.update({ password: hashedPassword })

    // Mark token as used
    await resetRecord.update({ used_at: new Date() })

    // Invalidate all user sessions
    await UserSession.update(
      { is_active: false, logout_at: new Date() },
      { where: { user_id: user.id, is_active: true } },
    )

    res.json({ message: "Mot de passe réinitialisé avec succès" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Erreur lors de la réinitialisation" })
  }
})

// Vérifier la validité d'un token de réinitialisation
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.body

    // Vérifier si le token existe et est valide
    const resetRecord = await PasswordReset.findOne({
      where: {
        token,
        expires_at: { [Op.gt]: new Date() },
        used_at: null,
      },
    })

    if (!resetRecord) {
      return res.status(400).json({ message: "Token invalide ou expiré" })
    }

    res.json({ valid: true })
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(500).json({ message: "Erreur lors de la vérification du token" })
  }
})

// Verify Email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body

    // Find valid verification token
    const verification = await EmailVerification.findOne({
      where: {
        token,
        expires_at: { [Op.gt]: new Date() },
        verified_at: null,
      },
    })

    if (!verification) {
      return res.status(400).json({ message: "Token de vérification invalide ou expiré" })
    }

    // Find user
    const user = await User.findByPk(verification.user_id)
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" })
    }

    // Mark email as verified
    await user.update({ email_verified_at: new Date() })
    await verification.update({ verified_at: new Date() })

    res.json({ message: "Email vérifié avec succès" })
  } catch (error) {
    console.error("Email verification error:", error)
    res.status(500).json({ message: "Erreur lors de la vérification" })
  }
})

// Renvoyer un email de vérification
router.post("/resend-verification", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId)

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    // Si l'email est déjà vérifié
    if (user.email_verified_at) {
      return res.status(400).json({ message: "Votre email est déjà vérifié" })
    }

    // Supprimer les anciens tokens de vérification
    await EmailVerification.destroy({
      where: {
        user_id: user.id,
        verified_at: null,
      },
    })

    // Générer un nouveau token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    await EmailVerification.create({
      user_id: user.id,
      token: verificationToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
    })

    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: user.email,
      subject: "Vérifiez votre adresse email - AME Construction",
      html: `
        <h2>Vérification d'email</h2>
        <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a>
        <p>Ce lien expirera dans 24 heures.</p>
      `,
    })

    res.json({ message: "Email de vérification envoyé avec succès" })
  } catch (error) {
    console.error("Resend verification error:", error)
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email" })
  }
})

// Get current user avec vérifications
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    // Vérifier si le compte est toujours actif
    if (!user.is_active || user.status !== "active") {
      return res.status(403).json({
        message: "Votre compte a été désactivé ou suspendu. Contactez l'administrateur.",
      })
    }

    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des données" })
  }
})

// Logout
router.post("/logout", auth, async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (token) {
      // Enregistrer la fin de session dans l'historique
      await UserSession.update(
        { is_active: false, logout_at: new Date() },
        { where: { session_token: token, is_active: true } },
      )
    }

    res.json({ message: "Déconnexion réussie" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ message: "Erreur lors de la déconnexion" })
  }
})

// Get user sessions (for profile page)
router.get("/sessions", auth, async (req, res) => {
  try {
    const sessions = await UserSession.findAll({
      where: { user_id: req.userId },
      order: [["login_at", "DESC"]],
      limit: 10,
    })

    res.json(sessions)
  } catch (error) {
    console.error("Get sessions error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des sessions" })
  }
})

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findByPk(req.userId)
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" })
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, Number.parseInt(process.env.BCRYPT_ROUNDS) || 12)

    // Enregistrer l'historique de modification du mot de passe
    await UserProfileHistory.create({
      user_id: req.userId,
      field_changed: "password",
      old_value: null, // Pour sécurité, on ne stocke pas les mots de passe
      new_value: null,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    })

    // Mettre à jour le mot de passe
    await user.update({ password: hashedPassword })

    // Invalider toutes les autres sessions (sauf la session actuelle)
    const currentToken = req.header("Authorization")?.replace("Bearer ", "")
    await UserSession.update(
      { is_active: false, logout_at: new Date() },
      {
        where: {
          user_id: req.userId,
          is_active: true,
          session_token: { [Op.ne]: currentToken },
        },
      },
    )

    res.json({ message: "Mot de passe modifié avec succès" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Erreur lors de la modification du mot de passe" })
  }
})

// Get profile history
router.get("/profile-history", auth, async (req, res) => {
  try {
    const history = await UserProfileHistory.findAll({
      where: { user_id: req.userId },
      order: [["changed_at", "DESC"]],
      limit: 20,
    })

    res.json(history)
  } catch (error) {
    console.error("Get profile history error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération de l'historique" })
  }
})

module.exports = router
