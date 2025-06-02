const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const PasswordReset = sequelize.define(
  "PasswordReset",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "password_resets",
    timestamps: true,
    underscored: true,
  },
)

module.exports = PasswordReset
