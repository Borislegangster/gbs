const express = require("express")
const { body, validationResult } = require("express-validator")
const { BlogPost, BlogComment, BlogLike, User } = require("../models")
const auth = require("../middleware/auth")
const optionalAuth = require("../middleware/optionalAuth")

const router = express.Router()

// Get all blog posts (public)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = "published", featured } = req.query
    const offset = (page - 1) * limit

    const where = { status }
    if (category) where.category = category
    if (featured !== undefined) where.featured = featured === "true"

    const { count, rows } = await BlogPost.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [
        ["featured", "DESC"],
        ["published_at", "DESC"],
        ["created_at", "DESC"],
      ],
      attributes: {
        exclude: ["author_id"],
      },
    })

    res.json({
      posts: rows,
      total: count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single blog post (public)
router.get("/:slug", optionalAuth, async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      where: { slug: req.params.slug, status: "published" },
      attributes: {
        exclude: ["author_id"],
      },
    })

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Increment views
    await post.increment("views")

    // Get comments with user info and replies
    const comments = await BlogComment.findAll({
      where: { post_id: post.id, parent_id: null, status: "approved" },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    })

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await BlogComment.findAll({
          where: { parent_id: comment.id, status: "approved" },
          include: [
            {
              model: User,
              attributes: ["id", "name"],
            },
          ],
          order: [["created_at", "ASC"]],
        })

        // Check if user liked this comment
        let userLiked = false
        if (req.user) {
          const like = await BlogLike.findOne({
            where: { user_id: req.user.id, comment_id: comment.id, type: "comment" },
          })
          userLiked = !!like
        }

        return {
          ...comment.toJSON(),
          replies: replies.map((reply) => ({
            ...reply.toJSON(),
            userLiked: false, // TODO: implement for replies
          })),
          userLiked,
        }
      }),
    )

    // Check if user liked this post
    let userLiked = false
    if (req.user) {
      const like = await BlogLike.findOne({
        where: { user_id: req.user.id, post_id: post.id, type: "post" },
      })
      userLiked = !!like
    }

    res.json({
      ...post.toJSON(),
      comments: commentsWithReplies,
      userLiked,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Like/Unlike post (auth required)
router.post("/:slug/like", auth, async (req, res) => {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug } })
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const existingLike = await BlogLike.findOne({
      where: { user_id: req.user.id, post_id: post.id, type: "post" },
    })

    if (existingLike) {
      // Unlike
      await existingLike.destroy()
      await post.decrement("likes_count")
      res.json({ liked: false, likes: post.likes_count - 1 })
    } else {
      // Like
      await BlogLike.create({
        user_id: req.user.id,
        post_id: post.id,
        type: "post",
      })
      await post.increment("likes_count")
      res.json({ liked: true, likes: post.likes_count + 1 })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add comment (auth required)
router.post(
  "/:slug/comments",
  auth,
  [body("content").notEmpty().trim().isLength({ min: 1, max: 1000 }), body("parentId").optional().isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const post = await BlogPost.findOne({ where: { slug: req.params.slug } })
      if (!post) {
        return res.status(404).json({ message: "Post not found" })
      }

      const { content, parentId } = req.body

      const comment = await BlogComment.create({
        content,
        post_id: post.id,
        user_id: req.user.id,
        parent_id: parentId || null,
      })

      // Increment comments count
      await post.increment("comments_count")

      // Get comment with user info
      const commentWithUser = await BlogComment.findByPk(comment.id, {
        include: [
          {
            model: User,
            attributes: ["id", "name"],
          },
        ],
      })

      res.status(201).json(commentWithUser)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Like/Unlike comment (auth required)
router.post("/comments/:id/like", auth, async (req, res) => {
  try {
    const comment = await BlogComment.findByPk(req.params.id)
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    const existingLike = await BlogLike.findOne({
      where: { user_id: req.user.id, comment_id: comment.id, type: "comment" },
    })

    if (existingLike) {
      // Unlike
      await existingLike.destroy()
      await comment.decrement("likes_count")
      res.json({ liked: false, likes: comment.likes_count - 1 })
    } else {
      // Like
      await BlogLike.create({
        user_id: req.user.id,
        comment_id: comment.id,
        type: "comment",
      })
      await comment.increment("likes_count")
      res.json({ liked: true, likes: comment.likes_count + 1 })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin routes
router.get("/admin/all", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, featured } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (category) where.category = category
    if (status) where.status = status
    if (featured !== undefined) where.featured = featured === "true"

    const { count, rows } = await BlogPost.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["created_at", "DESC"]],
    })

    res.json({
      posts: rows,
      total: count,
      page: Number.parseInt(page),
      totalPages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create blog post (admin)
router.post(
  "/",
  auth,
  [
    body("title").notEmpty().trim(),
    body("excerpt").notEmpty().trim(),
    body("content").notEmpty().trim(),
    body("author").notEmpty(),
    body("category").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const postData = {
        ...req.body,
        author_id: req.user.id,
      }

      if (postData.status === "published" && !postData.published_at) {
        postData.published_at = new Date()
      }

      const post = await BlogPost.create(postData)
      res.status(201).json(post)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update blog post (admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const updateData = { ...req.body }
    if (updateData.status === "published" && !post.published_at) {
      updateData.published_at = new Date()
    }

    await post.update(updateData)
    res.json(post)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete blog post (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    await post.destroy()
    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Toggle post status (admin)
router.patch("/:id/toggle-status", auth, async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const newStatus = post.status === "published" ? "draft" : "published"
    await post.update({
      status: newStatus,
      published_at: newStatus === "published" ? new Date() : post.published_at,
    })

    res.json(post)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
