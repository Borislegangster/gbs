import { API_BASE_URL } from "../config/api";

// Fonction utilitaire pour les requêtes
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Ajouter les headers d'authentification si un token existe
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  // Gérer les erreurs HTTP
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API Services
export const getFAQs = () => request("/faq");

export const getTestimonials = () => request("/testimonials");

export const getHomeContent = () => request("/home-content");

export const getSiteSettings = () => request("/site-settings");

export const getServices = () => request("/services");

export const getService = (slug: string) => request(`/services/${slug}`);

export const getProjects = () => request("/projects");

export const getProject = (slug: string) => request(`/projects/${slug}`);

export const getBlogPosts = () => request("/blog");

export const getBlogPost = (slug: string) => request(`/blog/${slug}`);

export const likeBlogPost = (slug: string) => 
  request(`/blog/${slug}/like`, { method: "POST" });

export const addBlogComment = (slug: string, data: { content: string; parentId?: string }) =>
  request(`/blog/${slug}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const likeBlogComment = (commentId: string) =>
  request(`/blog/comments/${commentId}/like`, { method: "POST" });

export const submitContact = (data: any) =>
  request("/contacts", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const subscribeNewsletter = (email: string) =>
  request("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const getStaticPage = (slug: string) =>
  request(`/static-pages/${slug}`);

// Auth services
export const login = (credentials: { email: string; password: string; rememberMe?: boolean }) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const register = (userData: { name: string; email: string; password: string; phone?: string }) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const logout = () =>
  request("/auth/logout", { method: "POST" });

export const getCurrentUser = () =>
  request("/auth/me");

export const updateProfile = (data: any) =>
  request("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  request("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const forgotPassword = (email: string) =>
  request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token: string, password: string) =>
  request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });

export const verifyResetToken = (token: string) =>
  request("/auth/verify-reset-token", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const resendVerificationEmail = () =>
  request("/auth/resend-verification", { method: "POST" });

export const getUserSessions = () =>
  request("/auth/sessions");