const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

class AdminApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("admin_token")
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
  async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return this.request("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async logout() {
    return this.request("/admin/auth/logout", { method: "POST" })
  }

  async getProfile() {
    return this.request("/admin/auth/profile")
  }

  async updateProfile(data: any) {
    return this.request("/admin/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Services - MÉTHODES COMPLÈTES
  async getServices() {
    return this.request("/services/admin/all")
  }

  async createService(data: any) {
    return this.request("/services", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateService(id: string, data: any) {
    return this.request(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteService(id: string) {
    return this.request(`/services/${id}`, { method: "DELETE" })
  }

  async toggleServiceStatus(id: string) {
    return this.request(`/services/${id}/toggle-status`, {
      method: "PATCH",
    })
  }

  // Dashboard
  async getDashboardStats() {
    return this.request("/admin/dashboard/stats")
  }

  async getRecentActivity() {
    return this.request("/admin/dashboard/activity")
  }

  // Users
  async getUsers() {
    return this.request("/admin/users")
  }

  async createUser(data: any) {
    return this.request("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: any) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, { method: "DELETE" })
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  }

  async updateUserStatus(id: string, status: string) {
    return this.request(`/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  async toggleUserAccount(id: string, isActive: boolean) {
    return this.request(`/admin/users/${id}/toggle-account`, {
      method: "PUT",
      body: JSON.stringify({ is_active: isActive }),
    })
  }

  async banUser(id: string, reason?: string) {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    })
  }

  async checkBannedUser(email: string, phone?: string) {
    return this.request("/admin/users/check-banned", {
      method: "POST",
      body: JSON.stringify({ email, phone }),
    })
  }

  // Projects
  async getProjects() {
    return this.request("/projects/admin/all")
  }

  async createProject(data: any) {
    return this.request("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: any) {
    return this.request(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, { method: "DELETE" })
  }

  async toggleProjectStatus(id: string) {
    return this.request(`/projects/${id}/toggle-status`, {
      method: "PATCH",
    })
  }

  // Blog - MÉTHODES COMPLÈTES
  async getBlogPosts() {
    return this.request("/blog/admin/all")
  }

  async createBlogPost(data: any) {
    return this.request("/blog", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateBlogPost(id: string, data: any) {
    return this.request(`/blog/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteBlogPost(id: string) {
    return this.request(`/blog/${id}`, { method: "DELETE" })
  }

  async toggleBlogPostStatus(id: string) {
    return this.request(`/blog/${id}/toggle-status`, {
      method: "PATCH",
    })
  }

  // Contacts
  async getContacts() {
    return this.request("/admin/contacts")
  }

  async updateContact(id: string, data: any) {
    return this.request(`/admin/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteContact(id: string) {
    return this.request(`/admin/contacts/${id}`, { method: "DELETE" })
  }

  // Media
  async getMediaFiles(folderId?: string) {
    const params = folderId ? `?folder_id=${folderId}` : ""
    return this.request(`/admin/media/files${params}`)
  }

  async getMediaFolders() {
    return this.request("/admin/media/folders")
  }

  async uploadMediaFiles(formData: FormData) {
    const token = localStorage.getItem("admin_token")
    return fetch(`${API_BASE_URL}/admin/media/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`)
      }
      return res.json()
    })
  }

  async createMediaFolder(data: { name: string; parent_id?: string }) {
    return this.request("/admin/media/folders", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateMediaFolder(id: string, data: { name: string }) {
    return this.request(`/admin/media/folders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteMediaFolder(id: string) {
    return this.request(`/admin/media/folders/${id}`, { method: "DELETE" })
  }

  async deleteMediaFile(id: string) {
    return this.request(`/admin/media/files/${id}`, { method: "DELETE" })
  }

  async updateMediaFile(id: string, data: { alt_text?: string; description?: string; name?: string }) {
    return this.request(`/admin/media/files/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async moveMediaFile(id: string, folderId: string | null) {
    return this.request(`/admin/media/files/${id}/move`, {
      method: "PUT",
      body: JSON.stringify({ folder_id: folderId }),
    })
  }

  async getMediaStats() {
    return this.request("/admin/media/stats")
  }

  // Testimonials
  async getTestimonials() {
    return this.request("/admin/testimonials")
  }

  async createTestimonial(data: any) {
    return this.request("/admin/testimonials", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTestimonial(id: string, data: any) {
    return this.request(`/admin/testimonials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteTestimonial(id: string) {
    return this.request(`/admin/testimonials/${id}`, { method: "DELETE" })
  }

  // FAQ
  async getFAQItems() {
    return this.request("/admin/faq")
  }

  async createFAQItem(data: any) {
    return this.request("/admin/faq", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateFAQItem(id: string, data: any) {
    return this.request(`/admin/faq/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteFAQItem(id: string) {
    return this.request(`/admin/faq/${id}`, { method: "DELETE" })
  }

  async reorderFAQItem(id: string, direction: "up" | "down") {
    return this.request(`/admin/faq/${id}/reorder`, {
      method: "POST",
      body: JSON.stringify({ direction }),
    })
  }

  // Newsletter
  async getNewsletterSubscribers() {
    return this.request("/admin/newsletter/subscribers")
  }

  async getNewsletterCampaigns() {
    return this.request("/admin/newsletter/campaigns")
  }

  async createNewsletterCampaign(data: any) {
    return this.request("/admin/newsletter/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteNewsletterSubscriber(id: string) {
    return this.request(`/admin/newsletter/subscribers/${id}`, { method: "DELETE" })
  }

  async deleteNewsletterCampaign(id: string) {
    return this.request(`/admin/newsletter/campaigns/${id}`, { method: "DELETE" })
  }

  // Home Content
  async getHomeContentAdmin() {
    return this.request("/admin/home-content")
  }

  async createHomeContent(data: any) {
    return this.request("/admin/home-content", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateHomeContent(id: number, data: any) {
    return this.request(`/admin/home-content/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteHomeContent(id: number) {
    return this.request(`/admin/home-content/${id}`, { method: "DELETE" })
  }

  async reorderHomeContent(data: any[]) {
    return this.request("/admin/home-content/reorder", {
      method: "POST",
      body: JSON.stringify({ items: data }),
    })
  }

  // Settings
  async getSettings() {
    return this.request("/admin/settings")
  }

  async updateSettings(category: string, data: any) {
    return this.request(`/admin/settings/${category}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async getSiteSettings() {
    return this.request("/admin/settings/site")
  }

  async updateSiteSettings(data: any) {
    return this.request("/admin/settings/site", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async testEmailSettings(data: any) {
    return this.request("/admin/settings/email/test", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async backupDatabase() {
    return this.request("/admin/settings/database/backup", {
      method: "POST",
    })
  }

  async optimizeDatabase() {
    return this.request("/admin/settings/database/optimize", {
      method: "POST",
    })
  }

  async clearCache() {
    return this.request("/admin/settings/cache/clear", {
      method: "POST",
    })
  }

  async resetSettings() {
    return this.request("/admin/settings/reset", {
      method: "POST",
    })
  }
}

export const apiService = new AdminApiService()
