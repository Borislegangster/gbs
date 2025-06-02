const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Contact = sequelize.define(
    "Contact",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      service_interest: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      budget_range: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      project_timeline: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("new", "in_progress", "responded", "closed"),
        defaultValue: "new",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      source: {
        type: DataTypes.STRING,
        defaultValue: "website",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "contacts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  )

  return Contact
}
