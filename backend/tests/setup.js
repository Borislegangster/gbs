const { sequelize } = require("../config/database")
const { beforeAll, afterAll, afterEach } = require("@jest/globals")

// Configuration globale pour les tests
beforeAll(async () => {
  // Synchroniser la base de données de test
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  // Fermer la connexion à la base de données
  await sequelize.close()
})

// Nettoyer la base de données entre chaque test
afterEach(async () => {
  // Supprimer toutes les données des tables
  const models = Object.values(sequelize.models)
  for (const model of models) {
    await model.destroy({ where: {}, force: true })
  }
})

// Variables globales pour les tests
global.testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  phone: "+237123456789",
}

global.testAdmin = {
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  role: "admin",
}
