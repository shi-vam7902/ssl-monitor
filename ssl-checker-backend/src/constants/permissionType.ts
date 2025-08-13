export const permissionType = {
  NONE: "101",
  ALL: "102",
  OWNED: "103",
  ASSIGNED: "104",
  OWNED_ASSIGNED: "105",
};

export const permissionTypeJson = [
  {
    staticId: "101",
    name: "None",
  },
  {
    staticId: "102",
    name: "All",
  },
  {
    staticId: "103",
    name: "Owned",
  },
  {
    staticId: "104",
    name: "Assigned",
  },
  {
    staticId: "105",
    name: "Owned and Assigned",
  },
];

export enum PermissionType {
  // SSL Management
  SSL_CREATE = "ssl:create",
  SSL_READ = "ssl:read",
  SSL_UPDATE = "ssl:update",
  SSL_DELETE = "ssl:delete",
  SSL_RENEW = "ssl:renew",

  // User Management (SUPER_ADMIN only)
  USER_CREATE = "user:create",
  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",

  // Role Management
  ROLE_CREATE = "role:create",
  ROLE_READ = "role:read",
  ROLE_UPDATE = "role:update",
  ROLE_DELETE = "role:delete",

  // Alert Management
  ALERT_READ = "alert:read",
  ALERT_DELETE = "alert:delete",

  // Settings
  SETTINGS_READ = "settings:read",
  SETTINGS_UPDATE = "settings:update",

  // Dashboard
  DASHBOARD_READ = "dashboard:read",
}
