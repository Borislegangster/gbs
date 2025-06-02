const { Sequelize } = require("sequelize")

const isProduction = process.env.NODE_ENV === "production"

let sequelize

if (isProduction) {
  // MySQL for production
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  })
} else {
  // SQLite for development
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: console.log,
  })
}

module.exports = sequelize
