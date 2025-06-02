const sequelize = require("../config/database")
const User = require("../models/User")
const Project = require("../models/Project")
const Service = require("../models/Service")
const BlogPost = require("../models/BlogPost")
const Contact = require("../models/Contact")
const Testimonial = require("../models/Testimonial")
const FAQ = require("../models/FAQ")
const { NewsletterSubscriber } = require("../models/Newsletter")
const HomeContent = require("../models/HomeContent")
const bcrypt = require("bcryptjs")

async function seed() {
  try {
    console.log("Starting database seeding...")

    // Clear existing data
    await sequelize.sync({ force: true })

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const admin = await User.create({
      name: "Boris Tatou",
      email: "boris@ame.com",
      password: hashedPassword,
      phone: "+237 695 674 827",
      address: "Akwa-Douala, Cameroun",
      role: "admin",
      status: "active",
      email_verified_at: new Date(),
    })

    // Create editor user
    const editorPassword = await bcrypt.hash("editor123", 10)
    await User.create({
      name: "Marie Dubois",
      email: "marie@ame.com",
      password: editorPassword,
      phone: "+237 682 815 427",
      address: "Yaoundé, Cameroun",
      role: "editor",
      status: "active",
      email_verified_at: new Date(),
    })

    // Create projects
    const projects = [
      {
        title: "Centre Commercial de la Place",
        description: "Un centre commercial moderne avec 45 boutiques et parking souterrain.",
        category: "Commercial",
        status: "ongoing",
        progress: 85,
        location: "Douala-Akwa",
        start_date: "2023-03-15",
        end_date: "2024-06-30",
        budget: 45000000,
        team_size: 120,
        client_name: "Société Immobilière du Littoral",
        image: "/assets/ex3.jfif",
        gallery: JSON.stringify(["/assets/img1.jfif", "/assets/img2.jfif"]),
        specifications: JSON.stringify({
          surface: "25,000 m²",
          duration: "15 mois",
        }),
      },
      {
        title: "Complexe Résidentiel Les Jardins",
        description: "Ensemble résidentiel de 200 appartements avec espaces verts.",
        category: "Résidentiel",
        status: "ongoing",
        progress: 70,
        location: "Yaoundé, Ngoa-Ekellé",
        start_date: "2022-11-01",
        end_date: "2023-12-15",
        budget: 30000000,
        team_size: 90,
        client_name: "Groupe Habitat Plus",
        image: "/assets/ex4.jfif",
        gallery: JSON.stringify(["/assets/img1.jfif", "/assets/img2.jfif"]),
        specifications: JSON.stringify({
          surface: "18,000 m²",
          duration: "13 mois",
        }),
      },
    ]

    for (const project of projects) {
      await Project.create(project)
    }

    // Create services
    const services = [
      {
        title: "Construction neuve",
        description: "Réalisation complète de bâtiments résidentiels et commerciaux",
        long_description:
          "Notre service de construction neuve propose une solution complète pour la réalisation de votre projet...",
        category: "Construction",
        icon: "HomeIcon",
        image: "/assets/s1.jpeg",
        gallery: JSON.stringify(["/assets/serv1.jfif", "/assets/serv2.jfif"]),
        features: JSON.stringify(["Plans personnalisés", "Matériaux de haute qualité", "Respect des normes"]),
        price: 150000,
        duration: "8-12 mois",
        status: "active",
      },
      {
        title: "Rénovation complète",
        description: "Transformation et modernisation de bâtiments existants",
        long_description: "Notre service de rénovation complète transforme votre espace existant...",
        category: "Rénovation",
        icon: "PaintBucketIcon",
        image: "/assets/serv2.jfif",
        gallery: JSON.stringify(["/assets/serv1.jfif", "/assets/serv2.jfif"]),
        features: JSON.stringify(["Diagnostic complet", "Optimisation des espaces", "Mise aux normes"]),
        price: 80000,
        duration: "4-8 mois",
        status: "active",
      },
    ]

    for (const service of services) {
      await Service.create(service)
    }

    // Create blog posts
    const blogPosts = [
      {
        title: "Les Tendances de la Construction en 2024",
        excerpt: "Découvrez les dernières innovations et tendances dans le secteur de la construction...",
        content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>",
        image: "/assets/ap1.jfif",
        author: "Boris Tatou",
        category: "Tendances",
        tags: JSON.stringify(["construction", "innovation", "2024"]),
        status: "published",
        featured: true,
        seo_title: "Tendances Construction 2024 - AME",
        seo_description: "Découvrez les dernières tendances de la construction en 2024...",
        published_at: new Date(),
      },
    ]

    for (const post of blogPosts) {
      await BlogPost.create(post)
    }

    // Create testimonials
    const testimonials = [
      {
        name: "Jean Dupont",
        position: "Directeur Général",
        company: "Entreprise XYZ",
        content:
          "AME a réalisé un travail exceptionnel sur notre projet de construction. Leur professionnalisme et leur expertise ont dépassé nos attentes.",
        rating: 5,
        status: "approved",
        featured: true,
      },
    ]

    for (const testimonial of testimonials) {
      await Testimonial.create(testimonial)
    }

    // Create FAQ items
    const faqItems = [
      {
        question: "Quels types de projets de construction réalisez-vous ?",
        answer:
          "Nous réalisons une large gamme de projets de construction, y compris des bâtiments résidentiels, commerciaux et industriels.",
        category: "Services",
        order_index: 1,
        status: "published",
      },
    ]

    for (const faq of faqItems) {
      await FAQ.create(faq)
    }

    // Create home content
    const homeContent = [
      {
        section: "hero",
        title: "Construisons ensemble votre avenir",
        subtitle: "Votre partenaire de confiance en construction",
        content:
          "Depuis plus de 15 ans, AME accompagne ses clients dans la réalisation de leurs projets de construction les plus ambitieux.",
        button_text: "Découvrir nos services",
        button_url: "/services",
        order_index: 1,
        is_active: true,
      },
    ]

    for (const content of homeContent) {
      await HomeContent.create(content)
    }

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

seed()
