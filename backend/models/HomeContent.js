const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const HomeContent = sequelize.define(
  "HomeContent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            "hero",
            "features",
            "experience",
            "stats",
            "promise",
            "newsletter",
            "services",
            "projects",
            "faq",
            "testimonials",
          ],
        ],
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    background_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    featured_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cta_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cta_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    secondary_cta_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    secondary_cta_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    button_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    button_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    placeholder_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Stats spécifiques
    projects_completed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    years_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    happy_clients: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    team_members: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Données structurées
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    gallery: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    tableName: "home_content",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

module.exports = HomeContent
