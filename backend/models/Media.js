const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Media = sequelize.define(
  "Media",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("image", "video", "document", "other"),
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    folder_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "media_folders",
        key: "id",
      },
    },
    alt_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "media",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

const MediaFolder = sequelize.define(
  "MediaFolder",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "media_folders",
        key: "id",
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "media_folders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

// Associations
Media.belongsTo(MediaFolder, { foreignKey: "folder_id", as: "folder" })
MediaFolder.hasMany(Media, { foreignKey: "folder_id", as: "files" })
MediaFolder.belongsTo(MediaFolder, { foreignKey: "parent_id", as: "parent" })
MediaFolder.hasMany(MediaFolder, { foreignKey: "parent_id", as: "children" })

module.exports = { Media, MediaFolder }
