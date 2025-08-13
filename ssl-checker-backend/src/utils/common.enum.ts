export enum Status {
  APPROVED = "approved",
  REJECTED = "rejected",
  PENDING = "pending",
  ASSIGN = "assign",
}

export enum DeviceType {
  Ios = "ios",
  Android = "android",
  Web = "web",
}

export enum ROLES {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  EMPLOYEE = "EMPLOYEE",
  SSL_MANAGER = "SSL_MANAGER",
  SSL_VIEWER = "SSL_VIEWER",
}

export enum StaticRole {
  Admin = "Admin",
}

export enum UserType {
  EMPLOYEE = "employee",
  COMPANY_ADMIN = "company_admin",
  ADMIN = "admin",
}

export enum S3BucketFolders {
  PRODUCT = "Documents",
  PROFILE_IMAGE = "Profile Image",
}

export enum Severity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}
export enum CommandCategory {
  UBUNTU = "ubuntu",
  DOCKER = "docker",
  GITHUB = "github",
  NGINX = "nginx",
  DATABASE = "database",
  MONITORING = "monitoring",
  SECURITY = "security",
  NETWORK = "network",
  BACKUP = "backup",
  DEPLOYMENT = "deployment",
  MAINTENANCE = "maintenance",
  CUSTOM = "custom",
}

export enum CommandType {
  SINGLE = "single",
  GROUP = "group",
}

export enum ServerCategory {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
  OTHER = "other",
}

export enum UserTerminalAccess {
  READ = "read",
  WRITE = "write",
}
