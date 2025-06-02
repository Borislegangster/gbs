const express = require("express")
const { body, validationResult } = require("express-validator")
const auth = require("../middleware/auth")

const router = express.Router()

// Mock newsletter subscribers data
const subscribers = [
  {
    id: 1,
    email: "user@example.com",
    status: "active",
    subscribed_at: new Date().toISOString(),
  },
]

// Get all subscribers (auth required)
router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query

    let filtered = subscribers
    if (status) filtered = filtered.filter((s) => s.status === status)

    res.json(filtered)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Subscribe to newsletter (public endpoint)
router.post("/subscribe", [body("email").isEmail().normalizeEmail()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email } = req.body

    // Check if already subscribed
    const existing = subscribers.find((s) => s.email === email)
    if (existing) {
      return res.status(400).json({ message: "Email already subscribed" })
    }

    const subscriber = {
      id: subscribers.length + 1,
      email,
      status: "active",
      subscribed_at: new Date().toISOString(),
    }

    subscribers.push(subscriber)
    res.status(201).json({ message: "Successfully subscribed to newsletter" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Unsubscribe from newsletter
router.post("/unsubscribe", [body("email").isEmail().normalizeEmail()], async (req, res) => {
  try {
    const { email } = req.body

    const index = subscribers.findIndex((s) => s.email === email)
    if (index === -1) {
      return res.status(404).json({ message: "Email not found" })
    }

    subscribers[index].status = "unsubscribed"
    res.json({ message: "Successfully unsubscribed from newsletter" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete subscriber (auth required)
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const index = subscribers.findIndex((s) => s.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Subscriber not found" })
    }

    subscribers.splice(index, 1)
    res.json({ message: "Subscriber deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
