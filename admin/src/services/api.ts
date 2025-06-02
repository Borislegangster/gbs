import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class AdminApiService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("admin_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("admin_token");
          window.location.href = "/login";
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  // Generic request method
  async request(endpoint: string, options = {}) {
    try {
      return await this.api(endpoint, options);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth
  async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return this.request("/admin/auth/login", {
      method: "POST",
      data: credentials,
    });
  }

  async logout() {
    return this.request("/admin/auth/logout", { method: "POST" });
  }

  async getProfile() {
    return this.request("/admin/auth/profile");
  }

  async updateProfile(data: any) {
    return this.request("/admin/auth/profile", {
      method: "PUT",
      data,
    });
  }

  // Services
  async getServices() {
    return this.request("/services/admin/all");
  }

  async createService(data: any) {
    return this.request("/services", {
      method: "POST",
      data,
    });
  }

  async updateService(id: string, data: any) {
    return this.request(`/services/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteService(id: string) {
    return this.request(`/services/${id}`, { method: "DELETE" });
  }

  async toggleServiceStatus(id: string) {
    return this.request(`/services/${id}/toggle-status`, {
      method: "PATCH",
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request("/admin/dashboard/stats");
  }

  async getRecentActivity() {
    return this.request("/admin/dashboard/activity");
  }

  // Users
  async getUsers() {
    return this.request("/admin/users");
  }

  async createUser(data: any) {
    return this.request("/admin/users", {
      method: "POST",
      data,
    });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, { method: "DELETE" });
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/admin/users/${id}/role`, {
      method: "PUT",
      data: { role },
    });
  }

  async updateUserStatus(id: string, status: string) {
    return this.request(`/admin/users/${id}/status`, {
      method: "PUT",
      data: { status },
    });
  }

  async toggleUserAccount(id: string, isActive: boolean) {
    return this.request(`/admin/users/${id}/toggle-account`, {
      method: "PUT",
      data: { is_active: isActive },
    });
  }

  async banUser(id: string, reason?: string) {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
      data: { reason },
    });
  }

  async checkBannedUser(email: string, phone?: string) {
    return this.request("/admin/users/check-banned", {
      method: "POST",
      data: { email, phone },
    });
  }

  // Projects
  async getProjects() {
    return this.request("/projects/admin/all");
  }

  async createProject(data: any) {
    return this.request("/projects", {
      method: "POST",
      data,
    });
  }

  async updateProject(id: string, data: any) {
    return this.request(`/projects/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, { method: "DELETE" });
  }

  async toggleProjectStatus(id: string) {
    return this.request(`/projects/${id}/toggle-status`, {
      method: "PATCH",
    });
  }

  // Blog
  async getBlogPosts() {
    return this.request("/blog/admin/all");
  }

  async createBlogPost(data: any) {
    return this.request("/blog", {
      method: "POST",
      data,
    });
  }

  async updateBlogPost(id: string, data: any) {
    return this.request(`/blog/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteBlogPost(id: string) {
    return this.request(`/blog/${id}`, { method: "DELETE" });
  }

  async toggleBlogPostStatus(id: string) {
    return this.request(`/blog/${id}/toggle-status`, {
      method: "PATCH",
    });
  }

  // Contacts
  async getContacts() {
    return this.request("/admin/contacts");
  }

  async updateContact(id: string, data: any) {
    return this.request(`/admin/contacts/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteContact(id: string) {
    return this.request(`/admin/contacts/${id}`, { method: "DELETE" });
  }

  // Media
  async getMediaFiles(folderId?: string) {
    const params = folderId ? `?folder_id=${folderId}` : "";
    return this.request(`/admin/media/files${params}`);
  }

  async getMediaFolders() {
    return this.request("/admin/media/folders");
  }

  async uploadMediaFiles(formData: FormData) {
    return this.api.post("/admin/media/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async createMediaFolder(data: { name: string; parent_id?: string }) {
    return this.request("/admin/media/folders", {
      method: "POST",
      data,
    });
  }

  async updateMediaFolder(id: string, data: { name: string }) {
    return this.request(`/admin/media/folders/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteMediaFolder(id: string) {
    return this.request(`/admin/media/folders/${id}`, { method: "DELETE" });
  }

  async deleteMediaFile(id: string) {
    return this.request(`/admin/media/files/${id}`, { method: "DELETE" });
  }

  async updateMediaFile(id: string, data: { alt_text?: string; description?: string; name?: string }) {
    return this.request(`/admin/media/files/${id}`, {
      method: "PUT",
      data,
    });
  }

  async moveMediaFile(id: string, folderId: string | null) {
    return this.request(`/admin/media/files/${id}/move`, {
      method: "PUT",
      data: { folder_id: folderId },
    });
  }

  async getMediaStats() {
    return this.request("/admin/media/stats");
  }

  // Testimonials
  async getTestimonials() {
    return this.request("/admin/testimonials");
  }

  async createTestimonial(data: any) {
    return this.request("/admin/testimonials", {
      method: "POST",
      data,
    });
  }

  async updateTestimonial(id: string, data: any) {
    return this.request(`/admin/testimonials/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteTestimonial(id: string) {
    return this.request(`/admin/testimonials/${id}`, { method: "DELETE" });
  }

  // FAQ
  async getFAQItems() {
    return this.request("/admin/faq");
  }

  async createFAQItem(data: any) {
    return this.request("/admin/faq", {
      method: "POST",
      data,
    });
  }

  async updateFAQItem(id: string, data: any) {
    return this.request(`/admin/faq/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteFAQItem(id: string) {
    return this.request(`/admin/faq/${id}`, { method: "DELETE" });
  }

  async reorderFAQItem(id: string, direction: "up" | "down") {
    return this.request(`/admin/faq/${id}/reorder`, {
      method: "POST",
      data: { direction },
    });
  }

  // Newsletter
  async getNewsletterSubscribers() {
    return this.request("/admin/newsletter/subscribers");
  }

  async getNewsletterCampaigns() {
    return this.request("/admin/newsletter/campaigns");
  }

  async createNewsletterCampaign(data: any) {
    return this.request("/admin/newsletter/campaigns", {
      method: "POST",
      data,
    });
  }

  async deleteNewsletterSubscriber(id: string) {
    return this.request(`/admin/newsletter/subscribers/${id}`, { method: "DELETE" });
  }

  async deleteNewsletterCampaign(id: string) {
    return this.request(`/admin/newsletter/campaigns/${id}`, { method: "DELETE" });
  }

  // Home Content
  async getHomeContentAdmin() {
    return this.request("/admin/home-content");
  }

  async createHomeContent(data: any) {
    return this.request("/admin/home-content", {
      method: "POST",
      data,
    });
  }

  async updateHomeContent(id: number, data: any) {
    return this.request(`/admin/home-content/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteHomeContent(id: number) {
    return this.request(`/admin/home-content/${id}`, { method: "DELETE" });
  }

  async reorderHomeContent(data: any[]) {
    return this.request("/admin/home-content/reorder", {
      method: "POST",
      data: { items: data },
    });
  }

  // Settings
  async getSettings() {
    return this.request("/admin/settings");
  }

  async updateSettings(category: string, data: any) {
    return this.request(`/admin/settings/${category}`, {
      method: "PUT",
      data,
    });
  }

  async getSiteSettings() {
    return this.request("/admin/settings/site");
  }

  async updateSiteSettings(data: any) {
    return this.request("/admin/settings/site", {
      method: "PUT",
      data,
    });
  }

  async testEmailSettings(data: any) {
    return this.request("/admin/settings/email/test", {
      method: "POST",
      data,
    });
  }

  async backupDatabase() {
    return this.request("/admin/settings/database/backup", {
      method: "POST",
    });
  }

  async optimizeDatabase() {
    return this.request("/admin/settings/database/optimize", {
      method: "POST",
    });
  }

  async clearCache() {
    return this.request("/admin/settings/cache/clear", {
      method: "POST",
    });
  }

  async resetSettings() {
    return this.request("/admin/settings/reset", {
      method: "POST",
    });
  }

  // Generic method for any endpoint
  async get(endpoint: string, params = {}) {
    return this.request(endpoint, { params });
  }

  async post(endpoint: string, data = {}) {
    return this.request(endpoint, { method: "POST", data });
  }

  async put(endpoint: string, data = {}) {
    return this.request(endpoint, { method: "PUT", data });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export const apiService = new AdminApiService();