const express = require("express")
const { body, validationResult } = require("express-validator")
const auth = require("../middleware/auth")

const router = express.Router()

// Mock FAQ data
const faqs = [
  {
    id: 1,
    question: "Combien de temps dure un projet de construction ?",
    answer:
      "La durée dépend de la taille et de la complexité du projet. En moyenne, une maison individuelle prend 8-12 mois.",
    category: "Construction",
    status: "published",
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    question: "Proposez-vous des devis gratuits ?",
    answer: "Oui, nous proposons des devis gratuits et détaillés pour tous nos services.",
    category: "Général",
    status: "published",
    order_index: 2,
    created_at: new Date().toISOString(),
  },
]

// Get all FAQs
router.get("/", async (req, res) => {
  try {
    const { category, status } = req.query

    let filtered = faqs
    if (category) filtered = filtered.filter((f) => f.category === category)
    if (status) filtered = filtered.filter((f) => f.status === status)

    filtered.sort((a, b) => a.order_index - b.order_index)
    res.json(filtered)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create FAQ
router.post(
  "/",
  auth,
  [body("question").notEmpty().trim(), body("answer").notEmpty().trim(), body("category").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const faq = {
        id: faqs.length + 1,
        ...req.body,
        order_index: req.body.order_index || faqs.length + 1,
        created_at: new Date().toISOString(),
      }

      faqs.push(faq)
      res.status(201).json(faq)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update FAQ
router.put("/:id", auth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const index = faqs.findIndex((f) => f.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "FAQ not found" })
    }

    faqs[index] = { ...faqs[index], ...req.body }
    res.json(faqs[index])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete FAQ
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const index = faqs.findIndex((f) => f.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "FAQ not found" })
    }

    faqs.splice(index, 1)
    res.json({ message: "FAQ deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
