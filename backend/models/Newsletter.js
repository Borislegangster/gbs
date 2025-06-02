const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const NewsletterSubscriber = sequelize.define(
  "NewsletterSubscriber",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "unsubscribed", "bounced"),
      defaultValue: "active",
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: "website",
    },
    last_email_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "newsletter_subscribers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

const NewsletterCampaign = sequelize.define(
  "NewsletterCampaign",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "scheduled", "sent", "failed"),
      defaultValue: "draft",
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    recipients_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    open_rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    click_rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "newsletter_campaigns",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

module.exports = { NewsletterSubscriber, NewsletterCampaign }
