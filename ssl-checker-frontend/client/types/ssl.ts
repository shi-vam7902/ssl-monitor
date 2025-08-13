export interface SSLAlert {
  id: string;
  domain: string;
  expiryDate: string;
  status: "valid" | "expiring_soon" | "expired";
  lastChecked: string;
  daysUntilExpiry: number;
  issuer: string;
  certificate: string;
  errorMessage?: string;
  serialNumber?: string;
  isActive?: boolean;
  environment?: "development" | "staging" | "production";
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalDomains: number;
  validCertificates: number;
  expiringSoon: number;
  expired: number;
  recentlyChecked?: number;
  byEnvironment?: {
    development: number;
    staging: number;
    production: number;
  };
}

export type DashboardLayout = "classic" | "professional";

export interface CreateAlertDto {
  domain: string;
  environment?: "development" | "staging" | "production";
}

export interface AlertQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: "valid" | "expiring" | "expired";
  daysRemaining?: number;
  environment?: "development" | "staging" | "production";
}

export interface DomainCheckResult {
  domain: string;
  expiryDate: string;
  daysRemaining: number;
  status: "valid" | "expiring" | "expired";
  isValid: boolean;
  issuer: string;
  serialNumber: string;
  errorMessage?: string;
}

export interface RefreshResult {
  message: string;
  updated: number;
  failed: number;
}
