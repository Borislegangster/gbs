const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_TOKEN: "/auth/verify-token",

  // User
  PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",

  // Public content
  PROJECTS: "/projects",
  SERVICES: "/services",
  BLOG: "/blog",
  TESTIMONIALS: "/testimonials",
  FAQ: "/faq",
  CONTACT: "/contacts",
  NEWSLETTER: "/newsletter/subscribe",
  HOME_CONTENT: "/home-content",
  SITE_SETTINGS: "/site-settings",
  STATIC_PAGES: "/static-pages/public",
}

export { API_BASE_URL }