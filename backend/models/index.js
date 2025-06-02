const { Sequelize } = require("sequelize")
const sequelize = require("../config/database")

// Import models
const User = require("./User")(sequelize)
const Service = require("./Service")(sequelize)
const Project = require("./Project")(sequelize)
const BlogPost = require("./BlogPost")(sequelize)
const BlogComment = require("./BlogComment")(sequelize)
const BlogLike = require("./BlogLike")(sequelize)
const Contact = require("./Contact")(sequelize)
const FAQ = require("./FAQ")(sequelize)
const HomeContent = require("./HomeContent")(sequelize)
const Newsletter = require("./Newsletter")(sequelize)
const Testimonial = require("./Testimonial")(sequelize)
const StaticPage = require("./StaticPage")(sequelize)
const Media = require("./Media")(sequelize)
const SiteSettings = require("./SiteSettings")(sequelize)
const EmailVerification = require("./EmailVerification")(sequelize)
const PasswordReset = require("./PasswordReset")(sequelize)
const UserSession = require("./UserSession")(sequelize)
const UserProfileHistory = require("./UserProfileHistory")(sequelize)
const BannedUser = require("./BannedUser")(sequelize)

// Define associations
// Blog associations
BlogPost.hasMany(BlogComment, { foreignKey: "post_id", onDelete: "CASCADE" })
BlogComment.belongsTo(BlogPost, { foreignKey: "post_id" })

BlogComment.belongsTo(User, { foreignKey: "user_id" })
User.hasMany(BlogComment, { foreignKey: "user_id" })

BlogComment.hasMany(BlogComment, { as: "replies", foreignKey: "parent_id", onDelete: "CASCADE" })
BlogComment.belongsTo(BlogComment, { as: "parent", foreignKey: "parent_id" })

BlogLike.belongsTo(User, { foreignKey: "user_id" })
BlogLike.belongsTo(BlogPost, { foreignKey: "post_id" })
BlogLike.belongsTo(BlogComment, { foreignKey: "comment_id" })

User.hasMany(BlogLike, { foreignKey: "user_id" })
BlogPost.hasMany(BlogLike, { foreignKey: "post_id" })
BlogComment.hasMany(BlogLike, { foreignKey: "comment_id" })

// User associations
User.hasMany(UserSession, { foreignKey: "user_id", onDelete: "CASCADE" })
UserSession.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(UserProfileHistory, { foreignKey: "user_id", onDelete: "CASCADE" })
UserProfileHistory.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(EmailVerification, { foreignKey: "user_id", onDelete: "CASCADE" })
EmailVerification.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(PasswordReset, { foreignKey: "user_id", onDelete: "CASCADE" })
PasswordReset.belongsTo(User, { foreignKey: "user_id" })

// Banned user associations
User.hasMany(BannedUser, { foreignKey: "banned_by", as: "bannedUsers" })
BannedUser.belongsTo(User, { foreignKey: "banned_by", as: "bannedBy" })

module.exports = {
  sequelize,
  User,
  Service,
  Project,
  BlogPost,
  BlogComment,
  BlogLike,
  Contact,
  FAQ,
  HomeContent,
  Newsletter,
  Testimonial,
  StaticPage,
  Media,
  SiteSettings,
  EmailVerification,
  PasswordReset,
  UserSession,
  UserProfileHistory,
  BannedUser,
}
