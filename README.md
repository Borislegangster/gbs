# Projet CMS Complet

Un système de gestion de contenu (CMS) complet avec un backend API, un site client et un panneau d'administration.

## Structure du projet

\`\`\`
/
├── backend/          # API Node.js/Express
├── client/           # Site web React/Vite
├── admin/            # Panel admin React/Vite
└── README.md
\`\`\`

## Prérequis

- Node.js (v14+)
- npm ou yarn
- SQLite (développement)
- MySQL (production)

## Installation

### 1. Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Éditer le fichier .env avec vos configurations
npm run migrate
npm run seed # Optionnel: ajoute des données de test
npm run dev
\`\`\`

### 2. Client

\`\`\`bash
cd client
npm install
cp .env.example .env
# Éditer le fichier .env
npm run dev
\`\`\`

### 3. Admin

\`\`\`bash
cd admin
npm install
cp .env.example .env
# Éditer le fichier .env
npm run dev
\`\`\`

## Base de données

Le projet utilise:
- **Développement**: SQLite (fichier local)
- **Production**: MySQL

La configuration se fait dans le fichier `backend/.env`:

\`\`\`
# Développement (SQLite)
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=database.sqlite

# Production (MySQL)
NODE_ENV=production
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cms_db
DB_USER=root
DB_PASSWORD=password
\`\`\`

## Variables d'environnement

### Backend (.env)

\`\`\`
# Serveur
PORT=5000
NODE_ENV=development

# Base de données
DB_DIALECT=sqlite
DB_STORAGE=database.sqlite
# Pour MySQL en production
# DB_DIALECT=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=cms_db
# DB_USER=root
# DB_PASSWORD=password

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
FROM_NAME=CMS
FROM_EMAIL=noreply@example.com

# URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Sécurité
BCRYPT_ROUNDS=10
\`\`\`

### Client (.env)

\`\`\`
VITE_API_URL=http://localhost:5000/api
VITE_SITE_NAME=Mon Site
\`\`\`

### Admin (.env)

\`\`\`
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_SITE_NAME=Admin CMS
\`\`\`

## URLs par défaut

- Backend API: http://localhost:5000
- Client: http://localhost:3000
- Admin: http://localhost:3001

## Scripts disponibles

### Backend

- `npm run dev`: Démarrage en mode développement avec nodemon
- `npm start`: Démarrage en production
- `npm run migrate`: Exécuter les migrations
- `npm run seed`: Insérer les données de test
- `npm test`: Exécuter les tests

### Client/Admin

- `npm run dev`: Démarrage en mode développement
- `npm run build`: Build pour production
- `npm run preview`: Prévisualiser le build
- `npm run lint`: Vérifier le code avec ESLint

## Déploiement

### Backend

\`\`\`bash
cd backend
npm install --production
npm run migrate
npm start
\`\`\`

### Client/Admin

\`\`\`bash
cd client # ou cd admin
npm install
npm run build
# Déployer le contenu du dossier 'dist'
\`\`\`

## Fonctionnalités principales

### Backend
- API RESTful complète
- Authentification JWT
- Upload de fichiers
- Envoi d'emails
- Validation des données
- Migrations et seeders

### Client
- Site web responsive
- Page d'accueil dynamique
- Blog
- Services
- Projets
- Témoignages
- FAQ
- Formulaire de contact
- Newsletter

### Admin
- Tableau de bord
- Gestion des utilisateurs
- Gestion du contenu de la page d'accueil
- Gestion des articles de blog
- Gestion des services
- Gestion des projets
- Gestion des témoignages
- Gestion des FAQ
- Gestion des pages statiques
- Gestion des médias
- Gestion des contacts
- Gestion de la newsletter
- Paramètres du site

## Technologies utilisées

### Backend
- Node.js
- Express
- Sequelize ORM
- SQLite/MySQL
- JWT
- Multer
- Nodemailer

### Frontend (Client & Admin)
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide Icons

## Licence

MIT
