import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import { ApiResponse, SeedResponse } from "@/types/api";

export class AdminService {
  /**
   * Seed the database with initial roles and super admin
   * This is a public endpoint that doesn't require authentication
   */
  static async seedDatabase(): Promise<SeedResponse> {
    try {
      const response = await api.post<ApiResponse<SeedResponse>>(
        API_ROUTES.admin.seed,
      );
      return response.data.data;
    } catch (error) {
      console.error("Seed database error:", error);
      throw error;
    }
  }

  /**
   * Check if the database is seeded (has any users)
   * This can help determine if initial setup is needed
   */
  static async isDatabaseSeeded(): Promise<boolean> {
    try {
      // Try to get user stats to see if any users exist
      const response = await api.get(API_ROUTES.users.stats);
      const stats = response.data.data;
      return stats.totalUsers > 0;
    } catch (error) {
      // If we get an error, assume database is not seeded
      return false;
    }
  }

  /**
   * Get system health information
   * This could be extended to check various system components
   */
  static async getSystemHealth(): Promise<{
    database: boolean;
    api: boolean;
    timestamp: string;
  }> {
    try {
      // Check if we can access users endpoint (indicates auth system is working)
      await api.get(API_ROUTES.users.stats);

      return {
        database: true,
        api: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        database: false,
        api: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Initialize application (seed if needed)
   */
  static async initializeApp(): Promise<{
    seeded: boolean;
    message: string;
  }> {
    try {
      const isSeeded = await this.isDatabaseSeeded();

      if (!isSeeded) {
        const seedResult = await this.seedDatabase();
        return {
          seeded: true,
          message: seedResult.message,
        };
      }

      return {
        seeded: false,
        message: "Database already initialized",
      };
    } catch (error) {
      console.error("Initialize app error:", error);
      throw error;
    }
  }

  /**
   * Get application configuration info
   * This can be useful for debugging and system information
   */
  static getAppInfo(): {
    version: string;
    environment: string;
    buildTime: string;
  } {
    return {
      version: "1.0.0", // This could come from package.json
      environment: import.meta.env.MODE || "development",
      buildTime: new Date().toISOString(),
    };
  }

  /**
   * Test API connectivity
   */
  static async testApiConnection(): Promise<boolean> {
    try {
      // Make a simple request to test connectivity
      await api.get("/");
      return true;
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  }
}

export const adminService = AdminService;
