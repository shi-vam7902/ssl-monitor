// Common API response types
export interface ApiResponse<T = any> {
  status: boolean;
  statusCode: number;
  message: string;
  count?: number;
  filePath?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

// Role and Permission types
export enum ROLES {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  EMPLOYEE = "EMPLOYEE",
  SSL_MANAGER = "SSL_MANAGER",
  SSL_VIEWER = "SSL_VIEWER",
}

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

export interface Role {
  id: string;
  name: ROLES;
  permissions: PermissionType[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: ROLES;
    permissions: PermissionType[];
  };
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserStats {
  totalUsers: number;
  usersByRole: {
    _id: string;
    count: number;
  }[];
}

// Authentication types
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  password: string;
  token: string;
}

// Role management types
export interface CreateRoleDto {
  name: ROLES;
  permissions: PermissionType[];
  description?: string;
}

export interface UpdateRoleDto {
  name?: ROLES;
  permissions?: PermissionType[];
  description?: string;
  isActive?: boolean;
}

export interface RoleQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// Alert specific types (separate from SSL)
export interface Alert {
  id: string;
  domain: string;
  expiryDate: string;
  daysRemaining: number;
  status: "valid" | "expiring" | "expired";
  lastChecked: string;
  errorMessage?: string;
  alertSentAt: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertDto {
  domain: string;
}

export interface UpdateAlertDto {
  domain?: string;
  isActive?: boolean;
}

export interface AlertQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: "valid" | "expiring" | "expired";
  daysRemaining?: number;
}

export interface AlertStats {
  totalAlerts: number;
  validAlerts: number;
  expiringAlerts: number;
  expiredAlerts: number;
}

// Domain check types
export interface CheckDomainDto {
  domain: string;
}

export interface DomainCheckResult {
  domain: string;
  expiryDate: string;
  daysRemaining: number;
  status: "valid" | "expiring" | "expired";
  isValid: boolean;
  issuer?: string;
  serialNumber?: string;
  errorMessage?: string;
}

export interface MultipleCheckDomainDto {
  domains: string[];
}

// Admin types
export interface SeedResponse {
  message: string;
}

// Common query parameters
export interface BaseQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}
