const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/admin/login",
  VERIFY_TOKEN: "/auth/verify-token",

  // Dashboard
  DASHBOARD_STATS: "/users/dashboard-stats",

  // Management
  USERS: "/users",
  PROJECTS: "/projects",
  SERVICES: "/services",
  BLOG: "/blog",
  CONTACTS: "/contacts",
  MEDIA: "/media",
  TESTIMONIALS: "/testimonials",
  FAQ: "/faq",
  NEWSLETTER: "/newsletter",
  SETTINGS: "/settings",
  HOME_CONTENT: "/home-content",
  SITE_SETTINGS: "/site-settings",
  STATIC_PAGES: "/static-pages",
}

export { API_BASE_URL }
