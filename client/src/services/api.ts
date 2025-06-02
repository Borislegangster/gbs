const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async register(userData: { name: string; email: string; password: string; phone?: string }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  async getCurrentUser() {
    return this.request("/auth/profile")
  }

  async updateProfile(data: any) {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    })
  }

  async verifyResetToken(token: string) {
    return this.request("/auth/verify-reset-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  async resendVerificationEmail() {
    return this.request("/auth/resend-verification", { method: "POST" })
  }

  // Site Settings - NOUVELLE MÉTHODE
  async getSiteSettings() {
    return this.request("/site-settings")
  }

  // Services - MÉTHODES CORRIGÉES
  async getServices() {
    return this.request("/services")
  }

  async getService(slug: string) {
    return this.request(`/services/${slug}`)
  }

  // Projects - MÉTHODES CORRIGÉES
  async getProjects() {
    return this.request("/projects")
  }

  async getProject(slug: string) {
    return this.request(`/projects/${slug}`)
  }

  // Blog - MÉTHODES COMPLÈTES
  async getBlogPosts() {
    return this.request("/blog")
  }

  async getBlogPost(slug: string) {
    return this.request(`/blog/${slug}`)
  }

  async likeBlogPost(slug: string) {
    return this.request(`/blog/${slug}/like`, {
      method: "POST",
    })
  }

  async addBlogComment(slug: string, data: { content: string; parentId?: string }) {
    return this.request(`/blog/${slug}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async likeBlogComment(commentId: string) {
    return this.request(`/blog/comments/${commentId}/like`, {
      method: "POST",
    })
  }

  // Contact
  async submitContact(data: any) {
    return this.request("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Newsletter
  async subscribeNewsletter(email: string) {
    return this.request("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  // FAQ
  async getFAQs() {
    return this.request("/faq")
  }

  // Static Pages
  async getStaticPage(slug: string) {
    return this.request(`/static-pages/${slug}`)
  }

  // Testimonials
  async getTestimonials() {
    return this.request("/testimonials")
  }

  // Home Content
  async getHomeContent() {
    return this.request("/home-content")
  }
}

export const apiService = new ApiService()
