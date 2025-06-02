const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Project = sequelize.define(
    "Project",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      featured_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gallery: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      client_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      budget: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("planning", "ongoing", "completed", "paused"),
        defaultValue: "planning",
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      team_size: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      specifications: {
        type: DataTypes.JSON,
        defaultValue: {
          surface: "",
          duration: "",
        },
      },
      milestones: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "projects",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  )

  return Project
}
