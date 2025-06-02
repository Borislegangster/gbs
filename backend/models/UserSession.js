const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const UserSession = sequelize.define(
  "UserSession",
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
    session_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    session_type: {
      type: DataTypes.ENUM("client", "admin"),
      defaultValue: "client",
    },
    login_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    logout_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "user_sessions",
    timestamps: true,
    underscored: true,
  },
)

module.exports = UserSession
