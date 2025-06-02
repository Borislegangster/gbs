const request = require("supertest")
const app = require("../server")
const User = require("../models/User")
const bcrypt = require("bcryptjs")

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "+237123456789",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("user")
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user).not.toHaveProperty("password")

      // Vérifier que l'utilisateur est créé en base
      const user = await User.findOne({ where: { email: userData.email } })
      expect(user).toBeTruthy()
      expect(user.name).toBe(userData.name)
    })

    it("should not register user with invalid email", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body).toHaveProperty("errors")
      expect(response.body.errors[0].field).toBe("email")
    })

    it("should not register user with short password", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "123",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body).toHaveProperty("errors")
      expect(response.body.errors[0].field).toBe("password")
    })

    it("should not register user with existing email", async () => {
      // Créer un utilisateur d'abord
      await User.create({
        name: "Existing User",
        email: "existing@example.com",
        password: await bcrypt.hash("password123", 12),
      })

      const userData = {
        name: "John Doe",
        email: "existing@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.message).toContain("existe déjà")
    })
  })

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Créer un utilisateur de test
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
      })
    })

    it("should login user with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(200)

      expect(response.body).toHaveProperty("token")
      expect(response.body).toHaveProperty("user")
      expect(response.body.user.email).toBe(loginData.email)
    })

    it("should not login with invalid email", async () => {
      const loginData = {
        email: "wrong@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(401)

      expect(response.body.message).toContain("incorrect")
    })

    it("should not login with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(401)

      expect(response.body.message).toContain("incorrect")
    })
  })

  describe("GET /api/auth/me", () => {
    let token
    let user

    beforeEach(async () => {
      // Créer un utilisateur et obtenir un token
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
      })

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      })

      token = loginResponse.body.token
    })

    it("should get current user with valid token", async () => {
      const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200)

      expect(response.body.email).toBe(user.email)
      expect(response.body).not.toHaveProperty("password")
    })

    it("should not get user without token", async () => {
      await request(app).get("/api/auth/me").expect(401)
    })

    it("should not get user with invalid token", async () => {
      await request(app).get("/api/auth/me").set("Authorization", "Bearer invalid-token").expect(401)
    })
  })
})
