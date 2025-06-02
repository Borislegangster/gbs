const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const BlogPost = sequelize.define(
    "BlogPost",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 255],
        },
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      featured_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gallery: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tags: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
      },
      featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      comments_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      reading_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      seo_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      seo_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      published_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "blog_posts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeCreate: (post) => {
          if (!post.slug) {
            post.slug = post.title
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
          }

          if (post.content) {
            const wordsPerMinute = 200
            const wordCount = post.content.split(/\s+/).length
            post.reading_time = Math.ceil(wordCount / wordsPerMinute)
          }
        },
        beforeUpdate: (post) => {
          if (post.changed("title") && !post.changed("slug")) {
            post.slug = post.title
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
          }

          if (post.changed("content")) {
            const wordsPerMinute = 200
            const wordCount = post.content.split(/\s+/).length
            post.reading_time = Math.ceil(wordCount / wordsPerMinute)
          }
        },
      },
    },
  )

  return BlogPost
}
