import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import {
  ApiResponse,
  PaginatedResponse,
  Alert,
  CreateAlertDto,
  UpdateAlertDto,
  AlertQueryDto,
  AlertStats,
  CheckDomainDto,
  DomainCheckResult,
  MultipleCheckDomainDto,
} from "@/types/api";

export class AlertService {
  /**
   * Create a new alert
   */
  static async createAlert(createAlertDto: CreateAlertDto): Promise<Alert> {
    try {
      const response = await api.post<ApiResponse<Alert>>(
        API_ROUTES.alerts.create,
        createAlertDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Create alert error:", error);
      throw error;
    }
  }

  /**
   * Get all alerts with pagination and filtering
   */
  static async getAlerts(
    query?: AlertQueryDto,
  ): Promise<PaginatedResponse<Alert>> {
    try {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get<ApiResponse<PaginatedResponse<Alert>>>(
        `${API_ROUTES.alerts.list}?${params.toString()}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Get alerts error:", error);
      throw error;
    }
  }

  /**
   * Get alert statistics
   */
  static async getAlertStats(): Promise<AlertStats> {
    try {
      const response = await api.get<ApiResponse<AlertStats>>(
        API_ROUTES.alerts.stats,
      );
      return response.data.data;
    } catch (error) {
      console.error("Get alert stats error:", error);
      throw error;
    }
  }

  /**
   * Get alert by ID
   */
  static async getAlertById(id: string): Promise<Alert> {
    try {
      const response = await api.get<ApiResponse<Alert>>(
        API_ROUTES.alerts.byId(id),
      );
      return response.data.data;
    } catch (error) {
      console.error("Get alert by ID error:", error);
      throw error;
    }
  }

  /**
   * Update alert
   */
  static async updateAlert(
    id: string,
    updateAlertDto: UpdateAlertDto,
  ): Promise<Alert> {
    try {
      const response = await api.put<ApiResponse<Alert>>(
        API_ROUTES.alerts.update(id),
        updateAlertDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Update alert error:", error);
      throw error;
    }
  }

  /**
   * Delete alert
   */
  static async deleteAlert(id: string): Promise<void> {
    try {
      await api.delete(API_ROUTES.alerts.delete(id));
    } catch (error) {
      console.error("Delete alert error:", error);
      throw error;
    }
  }

  /**
   * Check domain SSL certificate for specific alert
   */
  static async checkDomain(
    id: string,
    checkDomainDto: CheckDomainDto,
  ): Promise<DomainCheckResult> {
    try {
      const response = await api.post<ApiResponse<DomainCheckResult>>(
        API_ROUTES.alerts.checkDomain(id),
        checkDomainDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Check domain error:", error);
      throw error;
    }
  }

  /**
   * Check multiple domains SSL certificates
   */
  static async checkMultipleDomains(
    multipleCheckDto: MultipleCheckDomainDto,
  ): Promise<DomainCheckResult[]> {
    try {
      const response = await api.post<ApiResponse<DomainCheckResult[]>>(
        API_ROUTES.alerts.multipleByDomain,
        multipleCheckDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Check multiple domains error:", error);
      throw error;
    }
  }

  /**
   * Refresh all alerts
   */
  static async refreshAllAlerts(): Promise<{
    message: string;
    updated: number;
    failed: number;
  }> {
    try {
      const response = await api.post<
        ApiResponse<{ message: string; updated: number; failed: number }>
      >(API_ROUTES.alerts.refreshAll);
      return response.data.data;
    } catch (error) {
      console.error("Refresh all alerts error:", error);
      throw error;
    }
  }

  /**
   * Get expired alerts
   */
  static async getExpiredAlerts(): Promise<Alert[]> {
    try {
      const response = await this.getAlerts({ status: "expired", limit: 100 });
      return response.docs;
    } catch (error) {
      console.error("Get expired alerts error:", error);
      throw error;
    }
  }

  /**
   * Get expiring alerts (expiring soon)
   */
  static async getExpiringAlerts(days: number = 30): Promise<Alert[]> {
    try {
      const response = await this.getAlerts({
        status: "expiring",
        daysRemaining: days,
        limit: 100,
      });
      return response.docs;
    } catch (error) {
      console.error("Get expiring alerts error:", error);
      throw error;
    }
  }

  /**
   * Get valid alerts
   */
  static async getValidAlerts(): Promise<Alert[]> {
    try {
      const response = await this.getAlerts({ status: "valid", limit: 100 });
      return response.docs;
    } catch (error) {
      console.error("Get valid alerts error:", error);
      throw error;
    }
  }

  /**
   * Get alert status color
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case "valid":
        return "green";
      case "expiring":
        return "yellow";
      case "expired":
        return "red";
      default:
        return "gray";
    }
  }

  /**
   * Get alert status badge variant
   */
  static getStatusVariant(
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case "valid":
        return "default";
      case "expiring":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  }

  /**
   * Format days remaining text
   */
  static formatDaysRemaining(daysRemaining: number): string {
    if (daysRemaining < 0) {
      return `Expired ${Math.abs(daysRemaining)} days ago`;
    } else if (daysRemaining === 0) {
      return "Expires today";
    } else if (daysRemaining === 1) {
      return "Expires tomorrow";
    } else {
      return `Expires in ${daysRemaining} days`;
    }
  }
}

export const alertService = AlertService;
