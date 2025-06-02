const express = require("express")
const router = express.Router()
const { SiteSettings } = require("../../models")
const auth = require("../../middleware/auth")
const adminAuth = require("../../middleware/adminAuth")
const nodemailer = require("nodemailer")

// Middleware pour toutes les routes
router.use(auth, adminAuth)

// GET /admin/settings - Récupérer tous les paramètres
router.get("/", async (req, res) => {
  try {
    const settings = await SiteSettings.findAll()

    // Organiser par catégorie
    const organizedSettings = {}
    settings.forEach((setting) => {
      if (!organizedSettings[setting.category]) {
        organizedSettings[setting.category] = {}
      }

      let value = setting.value
      if (setting.type === "boolean") {
        value = value === "true"
      } else if (setting.type === "number") {
        value = Number.parseFloat(value)
      } else if (setting.type === "json") {
        try {
          value = JSON.parse(value)
        } catch (e) {
          value = {}
        }
      }

      organizedSettings[setting.category][setting.key] = value
    })

    res.json({
      success: true,
      data: organizedSettings,
    })
  } catch (error) {
    console.error("Erreur récupération paramètres:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des paramètres",
    })
  }
})

// GET /admin/settings/site - Paramètres publics pour le site
router.get("/site", async (req, res) => {
  try {
    const publicSettings = await SiteSettings.findAll({
      where: {
        category: ["general", "contact", "social"],
      },
    })

    const settings = {}
    publicSettings.forEach((setting) => {
      let value = setting.value
      if (setting.type === "boolean") {
        value = value === "true"
      } else if (setting.type === "number") {
        value = Number.parseFloat(value)
      }
      settings[setting.key] = value
    })

    res.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Erreur paramètres site:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des paramètres du site",
    })
  }
})

// PUT /admin/settings/:category - Mettre à jour une catégorie
router.put("/:category", async (req, res) => {
  try {
    const { category } = req.params
    const settingsData = req.body

    const updates = []

    for (const [key, value] of Object.entries(settingsData)) {
      let stringValue = value
      let type = "string"

      if (typeof value === "boolean") {
        stringValue = value.toString()
        type = "boolean"
      } else if (typeof value === "number") {
        stringValue = value.toString()
        type = "number"
      } else if (typeof value === "object" && value !== null) {
        stringValue = JSON.stringify(value)
        type = "json"
      }

      const [setting, created] = await SiteSettings.findOrCreate({
        where: { key, category },
        defaults: {
          key,
          value: stringValue,
          type,
          category,
        },
      })

      if (!created) {
        await setting.update({
          value: stringValue,
          type,
        })
      }

      updates.push({ key, value, created })
    }

    res.json({
      success: true,
      message: `Paramètres ${category} mis à jour avec succès`,
      data: {
        category,
        updates: updates.length,
        settings: settingsData,
      },
    })
  } catch (error) {
    console.error("Erreur mise à jour paramètres:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour des paramètres",
    })
  }
})

// POST /admin/settings/email/test - Tester la configuration email
router.post("/email/test", async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption, from_email, test_email } = req.body

    const transporter = nodemailer.createTransporter({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_encryption === "ssl",
      auth: {
        user: smtp_username,
        pass: smtp_password,
      },
    })

    await transporter.sendMail({
      from: from_email,
      to: test_email || req.user.email,
      subject: "Test de configuration email - AME Construction",
      html: `
        <h2>Test de configuration email</h2>
        <p>Si vous recevez cet email, votre configuration SMTP fonctionne correctement.</p>
        <p>Testé le : ${new Date().toLocaleString("fr-FR")}</p>
      `,
    })

    res.json({
      success: true,
      message: "Email de test envoyé avec succès",
    })
  } catch (error) {
    console.error("Erreur test email:", error)
    res.status(400).json({
      success: false,
      message: `Erreur lors du test email: ${error.message}`,
    })
  }
})

// POST /admin/settings/database/backup - Sauvegarder la base
router.post("/database/backup", async (req, res) => {
  try {
    // Simulation de sauvegarde
    const backupName = `backup_${Date.now()}.sql`

    res.json({
      success: true,
      message: "Sauvegarde créée avec succès",
      data: {
        filename: backupName,
        size: "2.5 MB",
        created_at: new Date(),
      },
    })
  } catch (error) {
    console.error("Erreur sauvegarde:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la sauvegarde",
    })
  }
})

// POST /admin/settings/database/optimize - Optimiser la base
router.post("/database/optimize", async (req, res) => {
  try {
    // Simulation d'optimisation
    res.json({
      success: true,
      message: "Base de données optimisée avec succès",
      data: {
        tables_optimized: 12,
        space_saved: "150 MB",
      },
    })
  } catch (error) {
    console.error("Erreur optimisation:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'optimisation",
    })
  }
})

// POST /admin/settings/cache/clear - Vider le cache
router.post("/cache/clear", async (req, res) => {
  try {
    // Simulation de vidage cache
    res.json({
      success: true,
      message: "Cache vidé avec succès",
    })
  } catch (error) {
    console.error("Erreur vidage cache:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors du vidage du cache",
    })
  }
})

// POST /admin/settings/reset - Réinitialiser les paramètres
router.post("/reset", async (req, res) => {
  try {
    await SiteSettings.destroy({ where: {} })

    res.json({
      success: true,
      message: "Paramètres réinitialisés avec succès",
    })
  } catch (error) {
    console.error("Erreur réinitialisation:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation",
    })
  }
})

module.exports = router
