const Joi = require("joi")

// Schémas de validation
const schemas = {
  // User validation
  registerUser: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Le nom doit contenir au moins 2 caractères",
      "string.max": "Le nom ne peut pas dépasser 100 caractères",
      "any.required": "Le nom est requis",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Format d'email invalide",
      "any.required": "L'email est requis",
    }),
    phone: Joi.string()
      .pattern(/^[+]?[0-9\s\-$$$$]{8,15}$/)
      .allow("")
      .messages({
        "string.pattern.base": "Format de téléphone invalide",
      }),
    password: Joi.string().min(6).max(128).required().messages({
      "string.min": "Le mot de passe doit contenir au moins 6 caractères",
      "string.max": "Le mot de passe ne peut pas dépasser 128 caractères",
      "any.required": "Le mot de passe est requis",
    }),
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string()
      .pattern(/^[+]?[0-9\s\-$$$$]{8,15}$/)
      .allow(""),
  }),

  // Project validation
  createProject: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(10).required(),
    content: Joi.string().allow(""),
    category: Joi.string().valid("Résidentiel", "Commercial", "Industriel", "Institutionnel", "Médical").required(),
    location: Joi.string().max(255),
    client: Joi.string().max(255),
    budget: Joi.number().positive().allow(null),
    start_date: Joi.date().allow(null),
    end_date: Joi.date().min(Joi.ref("start_date")).allow(null),
    status: Joi.string().valid("planning", "ongoing", "completed", "paused").default("planning"),
    progress: Joi.number().min(0).max(100).default(0),
    featured: Joi.boolean().default(false),
    published: Joi.boolean().default(false),
    featured_image: Joi.string().uri().allow(""),
    gallery: Joi.array().items(Joi.string().uri()).default([]),
    meta_title: Joi.string().max(255).allow(""),
    meta_description: Joi.string().max(500).allow(""),
  }),

  // Service validation
  createService: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(10).required(),
    content: Joi.string().allow(""),
    category: Joi.string().required(),
    featured_image: Joi.string().uri().allow(""),
    icon: Joi.string().allow(""),
    price_range: Joi.string().allow(""),
    duration: Joi.string().allow(""),
    features: Joi.array().items(Joi.string()).default([]),
    featured: Joi.boolean().default(false),
    published: Joi.boolean().default(false),
    order_index: Joi.number().integer().min(0).default(0),
    meta_title: Joi.string().max(255).allow(""),
    meta_description: Joi.string().max(500).allow(""),
  }),

  // Blog validation
  createBlogPost: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    excerpt: Joi.string().min(10).max(500),
    content: Joi.string().min(50).required(),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).default([]),
    status: Joi.string().valid("draft", "published", "archived").default("draft"),
    featured: Joi.boolean().default(false),
    featured_image: Joi.string().uri().allow(""),
    meta_title: Joi.string().max(255).allow(""),
    meta_description: Joi.string().max(500).allow(""),
    author_id: Joi.number().integer().required(),
  }),

  // Contact validation
  createContact: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^[+]?[0-9\s\-$$$$]{8,15}$/)
      .allow(""),
    company: Joi.string().max(100).allow(""),
    subject: Joi.string().min(5).max(255).required(),
    message: Joi.string().min(10).max(2000).required(),
    service_interest: Joi.string().allow(""),
    budget_range: Joi.string().allow(""),
    project_timeline: Joi.string().allow(""),
  }),

  // FAQ validation
  createFAQ: Joi.object({
    question: Joi.string().min(10).max(500).required(),
    answer: Joi.string().min(10).max(2000).required(),
    category: Joi.string().required(),
    order_index: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid("published", "draft").default("published"),
  }),

  // Newsletter validation
  subscribeNewsletter: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).allow(""),
  }),
}

// Middleware de validation
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      return res.status(400).json({
        message: "Erreur de validation",
        errors,
      })
    }

    req.body = value
    next()
  }
}

// Validation des paramètres de requête
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      return res.status(400).json({
        message: "Erreur de validation des paramètres",
        errors,
      })
    }

    req.query = value
    next()
  }
}

// Schémas pour les paramètres de requête
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).allow(""),
    sort: Joi.string().valid("asc", "desc").default("desc"),
    sortBy: Joi.string().allow(""),
  }),

  projectsQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    category: Joi.string().allow(""),
    status: Joi.string().valid("planning", "ongoing", "completed", "paused").allow(""),
    featured: Joi.boolean(),
    search: Joi.string().max(255).allow(""),
  }),
}

module.exports = {
  validate,
  validateQuery,
  schemas,
  querySchemas,
}
