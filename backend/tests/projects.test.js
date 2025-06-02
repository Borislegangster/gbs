const request = require("supertest")
const app = require("../server")
const { Project, User } = require("../models")
const bcrypt = require("bcryptjs")

describe("Projects API", () => {
  let authToken
  let testUser

  beforeEach(async () => {
    // Créer un utilisateur de test et obtenir un token
    testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 12),
      role: "admin",
    })

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    })

    authToken = loginResponse.body.token
  })

  describe("GET /api/projects", () => {
    beforeEach(async () => {
      // Créer des projets de test
      await Project.bulkCreate([
        {
          title: "Projet 1",
          slug: "projet-1",
          description: "Description du projet 1",
          category: "Résidentiel",
          published: true,
          created_by: testUser.id,
        },
        {
          title: "Projet 2",
          slug: "projet-2",
          description: "Description du projet 2",
          category: "Commercial",
          published: true,
          created_by: testUser.id,
        },
        {
          title: "Projet 3",
          slug: "projet-3",
          description: "Description du projet 3",
          category: "Résidentiel",
          published: false,
          created_by: testUser.id,
        },
      ])
    })

    it("should get published projects only", async () => {
      const response = await request(app).get("/api/projects").expect(200)

      expect(response.body.projects).toHaveLength(2)
      expect(response.body.total).toBe(2)
      expect(response.body.projects.every((p) => p.published)).toBe(true)
    })

    it("should filter projects by category", async () => {
      const response = await request(app).get("/api/projects?category=Résidentiel").expect(200)

      expect(response.body.projects).toHaveLength(1)
      expect(response.body.projects[0].category).toBe("Résidentiel")
    })

    it("should paginate projects", async () => {
      const response = await request(app).get("/api/projects?page=1&limit=1").expect(200)

      expect(response.body.projects).toHaveLength(1)
      expect(response.body.page).toBe(1)
      expect(response.body.totalPages).toBe(2)
    })
  })

  describe("POST /api/projects", () => {
    it("should create a new project with valid data", async () => {
      const projectData = {
        title: "Nouveau Projet",
        description: "Description du nouveau projet",
        category: "Résidentiel",
        location: "Douala",
        budget: 50000,
      }

      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send(projectData)
        .expect(201)

      expect(response.body.title).toBe(projectData.title)
      expect(response.body.slug).toBe("nouveau-projet")
      expect(response.body.created_by).toBe(testUser.id)

      // Vérifier en base
      const project = await Project.findByPk(response.body.id)
      expect(project).toBeTruthy()
      expect(project.title).toBe(projectData.title)
    })

    it("should not create project without authentication", async () => {
      const projectData = {
        title: "Nouveau Projet",
        description: "Description du nouveau projet",
        category: "Résidentiel",
      }

      await request(app).post("/api/projects").send(projectData).expect(401)
    })

    it("should not create project with invalid data", async () => {
      const projectData = {
        title: "AB", // Trop court
        description: "Court", // Trop court
        category: "InvalidCategory",
      }

      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send(projectData)
        .expect(400)

      expect(response.body).toHaveProperty("errors")
      expect(response.body.errors.length).toBeGreaterThan(0)
    })
  })

  describe("GET /api/projects/:slug", () => {
    let testProject

    beforeEach(async () => {
      testProject = await Project.create({
        title: "Test Project",
        slug: "test-project",
        description: "Description du projet de test",
        category: "Résidentiel",
        published: true,
        created_by: testUser.id,
      })
    })

    it("should get project by slug", async () => {
      const response = await request(app).get(`/api/projects/${testProject.slug}`).expect(200)

      expect(response.body.id).toBe(testProject.id)
      expect(response.body.title).toBe(testProject.title)
    })

    it("should return 404 for non-existent project", async () => {
      await request(app).get("/api/projects/non-existent-project").expect(404)
    })

    it("should return 404 for unpublished project", async () => {
      await testProject.update({ published: false })

      await request(app).get(`/api/projects/${testProject.slug}`).expect(404)
    })
  })
})
