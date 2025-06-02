const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { sequelize } = require("./models")

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.CLIENT_URL, process.env.ADMIN_URL]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/admin/auth", require("./routes/admin/auth"))
app.use("/api/admin/users", require("./routes/admin/users"))
app.use("/api/projects", require("./routes/projects"))
app.use("/api/services", require("./routes/services"))
app.use("/api/blog", require("./routes/blog"))
app.use("/api/contacts", require("./routes/contacts"))
app.use("/api/faq", require("./routes/faq"))
app.use("/api/testimonials", require("./routes/testimonials"))
app.use("/api/newsletter", require("./routes/newsletter"))
app.use("/api/home-content", require("./routes/home-content"))
app.use("/api/static-pages", require("./routes/static-pages"))
app.use("/api/media", require("./routes/media"))
app.use("/api/admin/media", require("./routes/media"))
app.use("/api/settings", require("./routes/settings"))
app.use("/api/admin/settings", require("./routes/admin/settings"))
app.use("/api/site-settings", require("./routes/site-settings"))

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

const PORT = process.env.PORT || 5000

// Database connection and server start
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully")
    return sequelize.sync({ alter: true })
  })
  .then(() => {
    console.log("✅ Database synchronized")
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
    })
  })
  .catch((error) => {
    console.error("❌ Unable to connect to database:", error)
    process.exit(1)
  })

module.exports = app
