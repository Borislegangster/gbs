const express = require("express")
const router = express.Router()
const { StaticPage } = require("../models")
const { adminAuth } = require("../middleware/adminAuth")

// GET /api/static-pages - Récupérer toutes les pages statiques
router.get("/", async (req, res) => {
  try {
    const pages = await StaticPage.findAll({
      order: [["createdAt", "DESC"]],
    })
    res.json(pages)
  } catch (error) {
    console.error("Erreur lors de la récupération des pages:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// GET /api/static-pages/public - Récupérer les pages actives (pour le client)
router.get("/public", async (req, res) => {
  try {
    const pages = await StaticPage.findAll({
      where: { isActive: true },
      attributes: ["id", "title", "slug", "content", "metaTitle", "metaDescription"],
    })
    res.json(pages)
  } catch (error) {
    console.error("Erreur lors de la récupération des pages publiques:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// GET /api/static-pages/:slug - Récupérer une page par son slug
router.get("/:slug", async (req, res) => {
  try {
    const page = await StaticPage.findOne({
      where: {
        slug: req.params.slug,
        isActive: true,
      },
    })

    if (!page) {
      return res.status(404).json({ message: "Page non trouvée" })
    }

    res.json(page)
  } catch (error) {
    console.error("Erreur lors de la récupération de la page:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// POST /api/static-pages - Créer une nouvelle page (admin seulement)
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, slug, content, metaTitle, metaDescription, isActive } = req.body

    // Vérifier si le slug existe déjà
    const existingPage = await StaticPage.findOne({ where: { slug } })
    if (existingPage) {
      return res.status(400).json({ message: "Ce slug existe déjà" })
    }

    const page = await StaticPage.create({
      title,
      slug,
      content,
      metaTitle,
      metaDescription,
      isActive: isActive !== undefined ? isActive : true,
    })

    res.status(201).json(page)
  } catch (error) {
    console.error("Erreur lors de la création de la page:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// PUT /api/static-pages/:id - Mettre à jour une page (admin seulement)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { title, slug, content, metaTitle, metaDescription, isActive } = req.body

    const page = await StaticPage.findByPk(req.params.id)
    if (!page) {
      return res.status(404).json({ message: "Page non trouvée" })
    }

    // Vérifier si le slug existe déjà (sauf pour cette page)
    if (slug !== page.slug) {
      const existingPage = await StaticPage.findOne({ where: { slug } })
      if (existingPage) {
        return res.status(400).json({ message: "Ce slug existe déjà" })
      }
    }

    await page.update({
      title,
      slug,
      content,
      metaTitle,
      metaDescription,
      isActive,
    })

    res.json(page)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la page:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// DELETE /api/static-pages/:id - Supprimer une page (admin seulement)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const page = await StaticPage.findByPk(req.params.id)
    if (!page) {
      return res.status(404).json({ message: "Page non trouvée" })
    }

    await page.destroy()
    res.json({ message: "Page supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la page:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router
