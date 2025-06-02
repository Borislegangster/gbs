const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const BlogLike = sequelize.define(
    "BlogLike",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "blog_posts",
          key: "id",
        },
      },
      comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "blog_comments",
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM("post", "comment"),
        allowNull: false,
      },
    },
    {
      tableName: "blog_likes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["user_id", "post_id"],
          where: {
            post_id: { [sequelize.Sequelize.Op.ne]: null },
          },
        },
        {
          unique: true,
          fields: ["user_id", "comment_id"],
          where: {
            comment_id: { [sequelize.Sequelize.Op.ne]: null },
          },
        },
      ],
    },
  )

  return BlogLike
}
