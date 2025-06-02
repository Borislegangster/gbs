const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Début du déploiement...")

// Vérification des variables d'environnement
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_ADMIN_SECRET",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
]

console.log("🔍 Vérification des variables d'environnement...")
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error("❌ Variables d'environnement manquantes:", missingVars.join(", "))
  process.exit(1)
}

console.log("✅ Variables d'environnement OK")

// Création des dossiers nécessaires
const directories = ["uploads", "uploads/images", "uploads/documents", "logs"]

console.log("📁 Création des dossiers...")
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Dossier créé: ${dir}`)
  }
})

// Installation des dépendances
console.log("📦 Installation des dépendances...")
try {
  execSync("npm ci --only=production", { stdio: "inherit" })
  console.log("✅ Dépendances installées")
} catch (error) {
  console.error("❌ Erreur lors de l'installation des dépendances")
  process.exit(1)
}

// Migration de la base de données
console.log("🗄️ Migration de la base de données...")
try {
  execSync("node scripts/migrate.js", { stdio: "inherit" })
  console.log("✅ Migration terminée")
} catch (error) {
  console.error("❌ Erreur lors de la migration")
  process.exit(1)
}

// Seed des données (optionnel en production)
if (process.env.NODE_ENV !== "production") {
  console.log("🌱 Seed des données de test...")
  try {
    execSync("node scripts/seed.js", { stdio: "inherit" })
    console.log("✅ Seed terminé")
  } catch (error) {
    console.warn("⚠️ Erreur lors du seed (non critique)")
  }
}

console.log("🎉 Déploiement terminé avec succès !")
console.log("🌍 L'application est prête à être utilisée")
