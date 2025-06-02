const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const BannedUser = sequelize.define(
  "BannedUser",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID de l'utilisateur banni",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Email de l'utilisateur banni",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Téléphone de l'utilisateur banni",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Nom de l'utilisateur banni",
    },
    banned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "ID de l'admin qui a banni",
    },
    ban_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Raison du bannissement",
    },
    banned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "banned_users",
    timestamps: true,
    underscored: true,
  },
)

module.exports = BannedUser
