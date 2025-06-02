const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const SiteSettings = sequelize.define(
  "SiteSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("string", "number", "boolean", "json", "text"),
      defaultValue: "string",
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "general",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "site_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

module.exports = SiteSettings
