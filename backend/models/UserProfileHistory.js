const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const UserProfileHistory = sequelize.define(
  "UserProfileHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    field_changed: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Champ modifié (name, email, phone, password)",
    },
    old_value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Ancienne valeur (null pour password pour sécurité)",
    },
    new_value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Nouvelle valeur (null pour password pour sécurité)",
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_profile_history",
    timestamps: true,
    underscored: true,
  },
)

module.exports = UserProfileHistory
