const { sequelize } = require("../config/database")
const User = require("../models/User")
const UserSession = require("../models/UserSession")
const PasswordReset = require("../models/PasswordReset")
const EmailVerification = require("../models/EmailVerification")

async function migrateAuth() {
  try {
    console.log("Starting authentication migration...")

    // Sync all models
    await User.sync({ alter: true })
    await UserSession.sync({ force: true })
    await PasswordReset.sync({ force: true })
    await EmailVerification.sync({ force: true })

    // Set up associations
    User.hasMany(UserSession, { foreignKey: "user_id" })
    UserSession.belongsTo(User, { foreignKey: "user_id" })

    User.hasMany(EmailVerification, { foreignKey: "user_id" })
    EmailVerification.belongsTo(User, { foreignKey: "user_id" })

    console.log("Authentication migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  migrateAuth()
}

module.exports = migrateAuth
