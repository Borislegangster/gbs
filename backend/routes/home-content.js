const express = require("express")
const router = express.Router()
const HomeContent = require("../models/HomeContent")
const adminAuth = require("../middleware/adminAuth")

// Get all home content (public)
router.get("/", async (req, res) => {
  try {
    const content = await HomeContent.findAll({
      where: { is_active: true },
      order: [
        ["section", "ASC"],
        ["order_index", "ASC"],
      ],
    })

    const groupedContent = content.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = []
      }
      acc[item.section].push(item)
      return acc
    }, {})

    // Transformer les données pour correspondre aux attentes du client
    const transformedContent = {}

    // Hero section
    if (groupedContent.hero && groupedContent.hero[0]) {
      const hero = groupedContent.hero[0]
      transformedContent.hero = {
        title: hero.title || "Construisons l'avenir ensemble",
        subtitle:
          hero.subtitle ||
          "AME Construction, votre partenaire de confiance pour tous vos projets de construction et de rénovation",
        background_image: hero.background_image || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1",
        cta_text: hero.cta_text || "Obtenir un devis",
        cta_url: hero.cta_url || "/contact",
        secondary_cta_text: hero.secondary_cta_text || "Voir nos projets",
        secondary_cta_url: hero.secondary_cta_url || "/projects",
      }
    } else {
      transformedContent.hero = {
        title: "Construisons l'avenir ensemble",
        subtitle:
          "AME Construction, votre partenaire de confiance pour tous vos projets de construction et de rénovation",
        background_image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1",
        cta_text: "Obtenir un devis",
        cta_url: "/contact",
        secondary_cta_text: "Voir nos projets",
        secondary_cta_url: "/projects",
      }
    }

    // Stats section
    if (groupedContent.stats && groupedContent.stats[0]) {
      const stats = groupedContent.stats[0]
      transformedContent.stats = {
        projects_completed: stats.projects_completed || 150,
        years_experience: stats.years_experience || 15,
        happy_clients: stats.happy_clients || 200,
        team_members: stats.team_members || 25,
      }
    } else {
      transformedContent.stats = {
        projects_completed: 150,
        years_experience: 15,
        happy_clients: 200,
        team_members: 25,
      }
    }

    // Features section
    if (groupedContent.features && groupedContent.features[0]) {
      const features = groupedContent.features[0]
      transformedContent.features = {
        title: features.title,
        subtitle: features.subtitle,
        items: features.features || [
          {
            icon: "UserIcon",
            title: "Qualité Professionnelle",
            description:
              "Nos experts qualifiés s'engagent à fournir des services de construction de la plus haute qualité pour tous vos projets.",
            link_text: "En savoir plus",
            link_url: "#",
          },
          {
            icon: "AwardIcon",
            title: "Travail De Qualité",
            description:
              "Nous nous engageons à fournir un travail exceptionnel, en utilisant les meilleurs matériaux et techniques de construction.",
            link_text: "En savoir plus",
            link_url: "#",
          },
          {
            icon: "PhoneIcon",
            title: "Assistance 24/7",
            description:
              "Notre équipe est disponible à tout moment pour répondre à vos questions et résoudre vos problèmes rapidement.",
            link_text: "En savoir plus",
            link_url: "#",
          },
        ],
      }
    } else {
      transformedContent.features = {
        title: null,
        subtitle: null,
        items: [
          {
            icon: "UserIcon",
            title: "Qualité Professionnelle",
            description:
              "Nos experts qualifiés s'engagent à fournir des services de construction de la plus haute qualité pour tous vos projets.",
            link_text: "En savoir plus",
            link_url: "#",
          },
          {
            icon: "AwardIcon",
            title: "Travail De Qualité",
            description:
              "Nous nous engageons à fournir un travail exceptionnel, en utilisant les meilleurs matériaux et techniques de construction.",
            link_text: "En savoir plus",
            link_url: "#",
          },
          {
            icon: "PhoneIcon",
            title: "Assistance 24/7",
            description:
              "Notre équipe est disponible à tout moment pour répondre à vos questions et résoudre vos problèmes rapidement.",
            link_text: "En savoir plus",
            link_url: "#",
          },
        ],
      }
    }

    // Experience section
    if (groupedContent.experience && groupedContent.experience[0]) {
      const experience = groupedContent.experience[0]
      transformedContent.experience = {
        title: experience.title || "20 Ans D'expériences",
        subtitle: experience.subtitle || "Notre Histoire et Notre Expérience",
        description:
          experience.description ||
          "Depuis plus de deux décennies, notre entreprise s'est imposée comme un leader dans le secteur de la construction. Nous avons acquis une expertise inégalée dans la réalisation de projets de toutes tailles, des résidences privées aux grands complexes commerciaux.\n\nNotre équipe de professionnels qualifiés s'engage à fournir des services de construction de la plus haute qualité, en respectant les délais et les budgets convenus.",
        images: experience.images || ["/assets/ex1.jpg", "/assets/ex2.jfif", "/assets/ex3.jfif", "/assets/ex4.jfif"],
        cta_text: experience.cta_text || "En Savoir Plus",
        cta_url: experience.cta_url || "/about",
      }
    } else {
      transformedContent.experience = {
        title: "20 Ans D'expériences",
        subtitle: "Notre Histoire et Notre Expérience",
        description:
          "Depuis plus de deux décennies, notre entreprise s'est imposée comme un leader dans le secteur de la construction. Nous avons acquis une expertise inégalée dans la réalisation de projets de toutes tailles, des résidences privées aux grands complexes commerciaux.\n\nNotre équipe de professionnels qualifiés s'engage à fournir des services de construction de la plus haute qualité, en respectant les délais et les budgets convenus.",
        images: ["/assets/ex1.jpg", "/assets/ex2.jfif", "/assets/ex3.jfif", "/assets/ex4.jfif"],
        cta_text: "En Savoir Plus",
        cta_url: "/about",
      }
    }

    // Promise section
    if (groupedContent.promise && groupedContent.promise[0]) {
      const promise = groupedContent.promise[0]
      transformedContent.promise = {
        title: promise.title || "Notre promesse",
        description:
          promise.description ||
          "Chez AME, nous nous engageons à fournir des services de construction et de gestion de projets de la plus haute qualité. Notre équipe de professionnels qualifiés travaille avec précision et attention aux détails pour garantir que chaque projet soit livré à temps et dans le respect du budget. Nous utilisons des matériaux de qualité supérieure et des techniques de construction modernes pour créer des structures durables et esthétiques.",
        video_id: promise.video_id || "YOUR_VIDEO_ID",
        background_image: promise.background_image || "/assets/pro1.jpg",
        cta_text: promise.cta_text || "En Savoir Plus",
        cta_url: promise.cta_url || "https://youtube.com/@ameConstruction",
      }
    } else {
      transformedContent.promise = {
        title: "Notre promesse",
        description:
          "Chez AME, nous nous engageons à fournir des services de construction et de gestion de projets de la plus haute qualité. Notre équipe de professionnels qualifiés travaille avec précision et attention aux détails pour garantir que chaque projet soit livré à temps et dans le respect du budget. Nous utilisons des matériaux de qualité supérieure et des techniques de construction modernes pour créer des structures durables et esthétiques.",
        video_id: "YOUR_VIDEO_ID",
        background_image: "/assets/pro1.jpg",
        cta_text: "En Savoir Plus",
        cta_url: "https://youtube.com/@ameConstruction",
      }
    }

    // Newsletter section
    if (groupedContent.newsletter && groupedContent.newsletter[0]) {
      const newsletter = groupedContent.newsletter[0]
      transformedContent.newsletter = {
        title: newsletter.title || "Newsletter",
        description:
          newsletter.description ||
          "Restez informé de nos dernières actualités et projets. Abonnez-vous à notre newsletter.",
        placeholder_text: newsletter.placeholder_text || "Votre email",
        button_text: newsletter.button_text || "Soumettre",
      }
    } else {
      transformedContent.newsletter = {
        title: "Newsletter",
        description: "Restez informé de nos dernières actualités et projets. Abonnez-vous à notre newsletter.",
        placeholder_text: "Votre email",
        button_text: "Soumettre",
      }
    }

    // Services section
    if (groupedContent.services && groupedContent.services[0]) {
      const services = groupedContent.services[0]
      transformedContent.services = {
        title: services.title || "Nos Services",
        subtitle: services.subtitle || "Des solutions complètes pour tous vos projets",
        description: services.description,
        cta_text: services.cta_text || "Voir tous nos services",
        cta_url: services.cta_url || "/services",
      }
    } else {
      transformedContent.services = {
        title: "Nos Services",
        subtitle: "Des solutions complètes pour tous vos projets",
        description: null,
        cta_text: "Voir tous nos services",
        cta_url: "/services",
      }
    }

    // Projects section
    if (groupedContent.projects && groupedContent.projects[0]) {
      const projects = groupedContent.projects[0]
      transformedContent.projects = {
        title: projects.title || "Nos Réalisations",
        subtitle: projects.subtitle || "Découvrez nos projets les plus récents",
        description: projects.description,
        cta_text: projects.cta_text || "Voir tous nos projets",
        cta_url: projects.cta_url || "/projects",
      }
    } else {
      transformedContent.projects = {
        title: "Nos Réalisations",
        subtitle: "Découvrez nos projets les plus récents",
        description: null,
        cta_text: "Voir tous nos projets",
        cta_url: "/projects",
      }
    }

    // FAQ section
    if (groupedContent.faq && groupedContent.faq[0]) {
      const faq = groupedContent.faq[0]
      transformedContent.faq = {
        title: faq.title || "Questions Fréquentes",
        subtitle: faq.subtitle || "Trouvez les réponses à vos questions",
        description: faq.description,
        cta_text: faq.cta_text || "Voir toutes les FAQ",
        cta_url: faq.cta_url || "/faq",
      }
    } else {
      transformedContent.faq = {
        title: "Questions Fréquentes",
        subtitle: "Trouvez les réponses à vos questions",
        description: null,
        cta_text: "Voir toutes les FAQ",
        cta_url: "/faq",
      }
    }

    // Testimonials section
    if (groupedContent.testimonials && groupedContent.testimonials[0]) {
      const testimonials = groupedContent.testimonials[0]
      transformedContent.testimonials = {
        title: testimonials.title || "Témoignages Clients",
        subtitle: testimonials.subtitle || "Ce que disent nos clients",
        description: testimonials.description,
        cta_text: testimonials.cta_text,
        cta_url: testimonials.cta_url,
      }
    } else {
      transformedContent.testimonials = {
        title: "Témoignages Clients",
        subtitle: "Ce que disent nos clients",
        description: null,
        cta_text: null,
        cta_url: null,
      }
    }

    res.json({ content: transformedContent })
  } catch (error) {
    console.error("Error fetching home content:", error)
    res.status(500).json({ error: "Internal server error", message: error.message })
  }
})

// Admin routes
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const content = await HomeContent.findAll({
      order: [
        ["section", "ASC"],
        ["order_index", "ASC"],
      ],
    })
    res.json({ content })
  } catch (error) {
    console.error("Error fetching home content:", error)
    res.status(500).json({ error: "Internal server error", message: error.message })
  }
})

router.post("/admin", adminAuth, async (req, res) => {
  try {
    const content = await HomeContent.create(req.body)
    res.status(201).json({ content, message: "Contenu créé avec succès" })
  } catch (error) {
    console.error("Error creating home content:", error)
    res.status(500).json({ error: "Internal server error", message: error.message })
  }
})

router.put("/admin/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const [updated] = await HomeContent.update(req.body, {
      where: { id },
    })

    if (updated) {
      const content = await HomeContent.findByPk(id)
      res.json({ content, message: "Contenu mis à jour avec succès" })
    } else {
      res.status(404).json({ error: "Content not found" })
    }
  } catch (error) {
    console.error("Error updating home content:", error)
    res.status(500).json({ error: "Internal server error", message: error.message })
  }
})

router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await HomeContent.destroy({
      where: { id },
    })

    if (deleted) {
      res.json({ message: "Contenu supprimé avec succès" })
    } else {
      res.status(404).json({ error: "Content not found" })
    }
  } catch (error) {
    console.error("Error deleting home content:", error)
    res.status(500).json({ error: "Internal server error", message: error.message })
  }
})

router.post("/admin/reorder", adminAuth, async (req, res) => {
  try {
    const { items } = req.body

    for (const item of items) {
      await HomeContent.update({ order_index: item.order_index }, { where: { id: item.id } })
    }

    res.json({ message: "Ordre du contenu mis à jour avec succès" })
  } catch (error) {
    console.error("Error reordering home content:", error)
    res.status(500).json({ error: "Internal server error", message: error.message })
  }
})

module.exports = router
