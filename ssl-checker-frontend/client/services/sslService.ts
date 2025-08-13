import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import {
  SSLAlert,
  DashboardStats,
  CreateAlertDto,
  AlertQueryDto,
} from "@/types/ssl";
import {
  ApiResponse,
  PaginatedResponse,
  CheckDomainDto,
  DomainCheckResult,
} from "@/types/api";

export class SSLService {
  private static mapRecordFromApi(record: any): SSLAlert {
    return {
      id: record._id || record.id,
      domain: record.domain,
      expiryDate:
        typeof record.expiryDate === "string"
          ? record.expiryDate
          : new Date(record.expiryDate).toISOString(),
      status: record.status === "expiring" ? "expiring_soon" : record.status,
      lastChecked:
        typeof record.lastChecked === "string"
          ? record.lastChecked
          : new Date(record.lastChecked).toISOString(),
      daysUntilExpiry: record.daysRemaining,
      issuer: record.issuer || "",
      certificate: record.certificate || "",
      errorMessage: record.errorMessage,
      serialNumber: record.serialNumber,
      isActive: record.isActive,
      environment: record.environment,
      createdAt: record.createdAt
        ? typeof record.createdAt === "string"
          ? record.createdAt
          : new Date(record.createdAt).toISOString()
        : undefined,
      updatedAt: record.updatedAt
        ? typeof record.updatedAt === "string"
          ? record.updatedAt
          : new Date(record.updatedAt).toISOString()
        : undefined,
    } as SSLAlert;
  }
  /**
   * Create a new SSL record
   */
  static async createSSLRecord(
    createAlertDto: CreateAlertDto,
  ): Promise<SSLAlert> {
    try {
      const response = await api.post<ApiResponse<SSLAlert>>(
        API_ROUTES.ssl.create,
        createAlertDto,
      );
      return this.mapRecordFromApi(response.data.data);
    } catch (error) {
      console.error("Create SSL record error:", error);
      throw error;
    }
  }

  /**
   * Get all SSL records with pagination and filtering
   */
  static async getSSLRecords(
    query?: AlertQueryDto,
  ): Promise<PaginatedResponse<SSLAlert>> {
    try {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get<ApiResponse<PaginatedResponse<any>>>(
        `${API_ROUTES.ssl.list}?${params.toString()}`,
      );
      const raw = response.data.data;
      return {
        ...raw,
        docs: raw.docs.map((r: any) => this.mapRecordFromApi(r)),
      };
    } catch (error) {
      console.error("Get SSL records error:", error);
      throw error;
    }
  }

  /**
   * Get SSL statistics for dashboard
   */
  static async getSSLStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<ApiResponse<DashboardStats>>(
        API_ROUTES.ssl.stats,
      );
      return response.data.data;
    } catch (error) {
      console.error("Get SSL stats error:", error);
      throw error;
    }
  }

  static async getSSLStatsByEnvironment(
    environment?: "development" | "staging" | "production",
  ): Promise<DashboardStats> {
    try {
      const url = environment
        ? `${API_ROUTES.ssl.stats}?environment=${environment}`
        : API_ROUTES.ssl.stats;
      const response = await api.get<ApiResponse<DashboardStats>>(url);
      return response.data.data;
    } catch (error) {
      console.error("Get SSL stats by env error:", error);
      throw error;
    }
  }

  /**
   * Get SSL record by ID
   */
  static async getSSLRecordById(id: string): Promise<SSLAlert> {
    try {
      const response = await api.get<ApiResponse<any>>(API_ROUTES.ssl.byId(id));
      return this.mapRecordFromApi(response.data.data);
    } catch (error) {
      console.error("Get SSL record by ID error:", error);
      throw error;
    }
  }

  /**
   * Update SSL record
   */
  static async updateSSLRecord(
    id: string,
    updateData: Partial<SSLAlert>,
  ): Promise<SSLAlert> {
    try {
      const response = await api.patch<ApiResponse<any>>(
        API_ROUTES.ssl.update(id),
        updateData,
      );
      return this.mapRecordFromApi(response.data.data);
    } catch (error) {
      console.error("Update SSL record error:", error);
      throw error;
    }
  }

  /**
   * Delete SSL record
   */
  static async deleteSSLRecord(id: string): Promise<void> {
    try {
      await api.delete(API_ROUTES.ssl.delete(id));
    } catch (error) {
      console.error("Delete SSL record error:", error);
      throw error;
    }
  }

  /**
   * Check domain SSL certificate
   */
  static async checkDomain(domain: string): Promise<DomainCheckResult> {
    try {
      const response = await api.post<ApiResponse<DomainCheckResult>>(
        API_ROUTES.ssl.checkDomain,
        { domain } as CheckDomainDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Check domain error:", error);
      throw error;
    }
  }

  /**
   * Refresh all SSL records
   */
  static async refreshAllSSLRecords(): Promise<{
    message: string;
    updated: number;
    failed: number;
  }> {
    try {
      const response = await api.post<
        ApiResponse<{ message: string; updated: number; failed: number }>
      >(API_ROUTES.ssl.refreshAll);
      return response.data.data;
    } catch (error) {
      console.error("Refresh all SSL records error:", error);
      throw error;
    }
  }

  /**
   * Refresh single SSL record
   */
  static async refreshSSLRecord(id: string): Promise<SSLAlert> {
    try {
      // Accept both id and raw record for safety; if id is missing, throw early
      if (!id) {
        throw new Error("Missing SSL record id");
      }
      const response = await api.put<ApiResponse<any>>(
        API_ROUTES.ssl.refresh(id),
      );
      return this.mapRecordFromApi(response.data.data);
    } catch (error) {
      console.error("Refresh SSL record error:", error);
      throw error;
    }
  }

  /**
   * Renew SSL certificate
   */
  static async renewSSLCertificate(id: string): Promise<SSLAlert> {
    try {
      const response = await api.post<ApiResponse<any>>(
        API_ROUTES.ssl.renew(id),
      );
      return this.mapRecordFromApi(response.data.data);
    } catch (error) {
      console.error("Renew SSL certificate error:", error);
      throw error;
    }
  }

  /**
   * Get expired SSL records
   */
  static async getExpiredSSLRecords(): Promise<SSLAlert[]> {
    try {
      const response = await this.getSSLRecords({
        status: "expired",
        limit: 100,
      });
      return response.docs;
    } catch (error) {
      console.error("Get expired SSL records error:", error);
      throw error;
    }
  }

  /**
   * Get expiring SSL records (expiring soon)
   */
  static async getExpiringSSLRecords(days: number = 30): Promise<SSLAlert[]> {
    try {
      const response = await this.getSSLRecords({
        status: "expiring_soon",
        daysRemaining: days,
        limit: 100,
      });
      return response.docs;
    } catch (error) {
      console.error("Get expiring SSL records error:", error);
      throw error;
    }
  }

  /**
   * Get valid SSL records
   */
  static async getValidSSLRecords(): Promise<SSLAlert[]> {
    try {
      const response = await this.getSSLRecords({
        status: "valid",
        limit: 100,
      });
      return response.docs;
    } catch (error) {
      console.error("Get valid SSL records error:", error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  static async getAlerts(query?: AlertQueryDto): Promise<SSLAlert[]> {
    const response = await this.getSSLRecords(query);
    return response.docs;
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    return this.getSSLStats();
  }

  static async createAlert(createAlertDto: CreateAlertDto): Promise<SSLAlert> {
    return this.createSSLRecord(createAlertDto);
  }

  static async refreshAllDomains(): Promise<any> {
    return this.refreshAllSSLRecords();
  }

  static async refreshDomain(id: string): Promise<SSLAlert> {
    return this.refreshSSLRecord(id);
  }

  static async deleteAlert(id: string): Promise<void> {
    return this.deleteSSLRecord(id);
  }

  static async getExpiredHistory(): Promise<SSLAlert[]> {
    return this.getExpiredSSLRecords();
  }
}

export const sslService = SSLService;
