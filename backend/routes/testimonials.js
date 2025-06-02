const express = require("express")
const { body, validationResult } = require("express-validator")
const auth = require("../middleware/auth")

const router = express.Router()

// Mock testimonials data (you can replace with database model)
const testimonials = [
  {
    id: 1,
    name: "Jean Dupont",
    company: "Entreprise ABC",
    position: "Directeur Général",
    content: "Excellent travail, équipe professionnelle et délais respectés.",
    rating: 5,
    image: "/assets/photo.jpg",
    status: "published",
    featured: true,
    created_at: new Date().toISOString(),
  },
]

// Get all testimonials
router.get("/", async (req, res) => {
  try {
    const { status, featured } = req.query

    let filtered = testimonials
    if (status) filtered = filtered.filter((t) => t.status === status)
    if (featured !== undefined) filtered = filtered.filter((t) => t.featured === (featured === "true"))

    res.json(filtered)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create testimonial
router.post(
  "/",
  auth,
  [body("name").notEmpty().trim(), body("content").notEmpty().trim(), body("rating").isInt({ min: 1, max: 5 })],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const testimonial = {
        id: testimonials.length + 1,
        ...req.body,
        created_at: new Date().toISOString(),
      }

      testimonials.push(testimonial)
      res.status(201).json(testimonial)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update testimonial
router.put("/:id", auth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const index = testimonials.findIndex((t) => t.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Testimonial not found" })
    }

    testimonials[index] = { ...testimonials[index], ...req.body }
    res.json(testimonials[index])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete testimonial
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const index = testimonials.findIndex((t) => t.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Testimonial not found" })
    }

    testimonials.splice(index, 1)
    res.json({ message: "Testimonial deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
