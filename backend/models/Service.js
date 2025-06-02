const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Service = sequelize.define(
    "Service",
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
      longDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "HomeIcon",
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gallery: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      features: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      process: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      faq: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "services",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  )

  return Service
}
