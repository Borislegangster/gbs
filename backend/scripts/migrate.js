const sequelize = require("../config/database")
const User = require("../models/User")
const Project = require("../models/Project")
const Service = require("../models/Service")
const BlogPost = require("../models/BlogPost")
const Contact = require("../models/Contact")
const { Media, MediaFolder } = require("../models/Media")
const Testimonial = require("../models/Testimonial")
const FAQ = require("../models/FAQ")
const { NewsletterSubscriber, NewsletterCampaign } = require("../models/Newsletter")
const SiteSettings = require("../models/SiteSettings")
const HomeContent = require("../models/HomeContent")

async function migrate() {
  try {
    console.log("Starting database migration...")

    // Test connection
    await sequelize.authenticate()
    console.log("Database connection established successfully.")

    // Sync all models
    await sequelize.sync({ force: false, alter: true })
    console.log("All models synchronized successfully.")

    // Create default admin user if not exists
    const adminExists = await User.findOne({ where: { email: "admin@ame.com" } })
    if (!adminExists) {
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 10)

      await User.create({
        name: "Administrateur",
        email: "admin@ame.com",
        password: hashedPassword,
        role: "admin",
        status: "active",
        email_verified_at: new Date(),
      })
      console.log("Default admin user created.")
    }

    // Create default site settings
    const defaultSettings = [
      { key: "site_name", value: "AME Construction", type: "string", category: "general" },
      {
        key: "site_description",
        value: "Votre partenaire de confiance en construction",
        type: "string",
        category: "general",
      },
      { key: "contact_email", value: "contact@ame.com", type: "string", category: "contact" },
      { key: "contact_phone", value: "+237 695 674 827", type: "string", category: "contact" },
      { key: "contact_address", value: "Akwa-Douala, Cameroun", type: "string", category: "contact" },
      { key: "social_facebook", value: "https://facebook.com/ame", type: "string", category: "social" },
      { key: "social_twitter", value: "https://twitter.com/ame", type: "string", category: "social" },
      { key: "social_linkedin", value: "https://linkedin.com/company/ame", type: "string", category: "social" },
    ]

    for (const setting of defaultSettings) {
      await SiteSettings.findOrCreate({
        where: { key: setting.key },
        defaults: setting,
      })
    }
    console.log("Default site settings created.")

    console.log("Migration completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

migrate()
