const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const EmailVerification = sequelize.define(
  "EmailVerification",
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "email_verifications",
    timestamps: true,
    underscored: true,
  },
)

module.exports = EmailVerification
