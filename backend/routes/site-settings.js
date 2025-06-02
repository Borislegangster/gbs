const express = require("express")
const router = express.Router()
const { SiteSettings } = require("../models")

// GET /api/site-settings - Paramètres publics
router.get("/", async (req, res) => {
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
    console.error("Erreur paramètres publics:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des paramètres",
    })
  }
})

module.exports = router
