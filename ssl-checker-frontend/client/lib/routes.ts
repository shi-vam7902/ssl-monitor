// Centralized API route constants for frontend usage
// Ensures the API prefix includes exactly one "/api" segment

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/+$/g,
  "",
);
export const API_PREFIX = RAW_BASE_URL.endsWith("/api")
  ? RAW_BASE_URL
  : `${RAW_BASE_URL}/api`;
console.log("API_PREFIX", API_PREFIX);
export const API_ROUTES = {
  // Authentication routes
  auth: {
    login: `${API_PREFIX}/auth/login`,
    register: `${API_PREFIX}/auth/register`,
    profile: `${API_PREFIX}/auth/profile`,
    logout: `${API_PREFIX}/auth/logout`,
    changePassword: `${API_PREFIX}/auth/change-password`,
    forgotPassword: `${API_PREFIX}/auth/forgot-password`,
    resetPassword: `${API_PREFIX}/auth/reset-password`,
  },

  // User management routes
  users: {
    root: `${API_PREFIX}/users`,
    list: `${API_PREFIX}/users`,
    create: `${API_PREFIX}/users`,
    me: `${API_PREFIX}/users/me`,
    stats: `${API_PREFIX}/users/stats`,
    byId: (id: string) => `${API_PREFIX}/users/${id}`,
    update: (id: string) => `${API_PREFIX}/users/${id}`,
    delete: (id: string) => `${API_PREFIX}/users/${id}`,
    changePassword: `${API_PREFIX}/users/me/change-password`,
  },

  // Role management routes
  roles: {
    root: `${API_PREFIX}/roles`,
    list: `${API_PREFIX}/roles`,
    create: `${API_PREFIX}/roles`,
    byId: (id: string) => `${API_PREFIX}/roles/${id}`,
    update: (id: string) => `${API_PREFIX}/roles/${id}`,
    delete: (id: string) => `${API_PREFIX}/roles/${id}`,
    permissions: (id: string) => `${API_PREFIX}/roles/${id}/permissions`,
  },

  // SSL management routes
  ssl: {
    root: `${API_PREFIX}/ssl`,
    list: `${API_PREFIX}/ssl`,
    create: `${API_PREFIX}/ssl`,
    stats: `${API_PREFIX}/ssl/stats`,
    checkDomain: `${API_PREFIX}/ssl/check-domain`,
    refreshAll: `${API_PREFIX}/ssl/refresh-all`,
    byId: (id: string) => `${API_PREFIX}/ssl/${id}`,
    update: (id: string) => `${API_PREFIX}/ssl/${id}`,
    delete: (id: string) => `${API_PREFIX}/ssl/${id}`,
    renew: (id: string) => `${API_PREFIX}/ssl/${id}/renew`,
    refresh: (id: string) => `${API_PREFIX}/ssl/${id}/refresh`,
  },

  // Alert management routes
  alerts: {
    root: `${API_PREFIX}/alerts`,
    list: `${API_PREFIX}/alerts`,
    create: `${API_PREFIX}/alerts`,
    stats: `${API_PREFIX}/alerts/stats`,
    byId: (id: string) => `${API_PREFIX}/alerts/${id}`,
    update: (id: string) => `${API_PREFIX}/alerts/${id}`,
    delete: (id: string) => `${API_PREFIX}/alerts/${id}`,
    checkDomain: (id: string) => `${API_PREFIX}/alerts/${id}/check-domain`,
    multipleByDomain: `${API_PREFIX}/alerts/multiple-check-domain`,
    refreshAll: `${API_PREFIX}/alerts/refresh-all`,
  },

  // Admin routes
  admin: {
    seed: `${API_PREFIX}/seed`,
  },
};

export type ApiRoutes = typeof API_ROUTES;
