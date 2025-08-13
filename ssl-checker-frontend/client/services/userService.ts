import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import {
  ApiResponse,
  PaginatedResponse,
  User,
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserStats,
  ChangePasswordDto,
} from "@/types/api";

export class UserService {
  /**
   * Create a new user (SUPER_ADMIN only)
   */
  static async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const response = await api.post<ApiResponse<User>>(
        API_ROUTES.users.create,
        createUserDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(
    query?: UserQueryDto,
  ): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
        `${API_ROUTES.users.list}?${params.toString()}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Get users error:", error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(API_ROUTES.users.me);
      return response.data.data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get<ApiResponse<UserStats>>(
        API_ROUTES.users.stats,
      );
      return response.data.data;
    } catch (error) {
      console.error("Get user stats error:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(
        API_ROUTES.users.byId(id),
      );
      return response.data.data;
    } catch (error) {
      console.error("Get user by ID error:", error);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>(
        API_ROUTES.users.update(id),
        updateUserDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    try {
      await api.put<ApiResponse<{ message: string }>>(
        API_ROUTES.users.changePassword,
        changePasswordDto,
      );
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  static async deactivateUser(id: string): Promise<void> {
    try {
      await api.delete(API_ROUTES.users.delete(id));
    } catch (error) {
      console.error("Deactivate user error:", error);
      throw error;
    }
  }

  /**
   * Get active users count
   */
  static async getActiveUsersCount(): Promise<number> {
    try {
      const stats = await this.getUserStats();
      return stats.totalUsers;
    } catch (error) {
      console.error("Get active users count error:", error);
      throw error;
    }
  }

  /**
   * Check if current user has permission
   */
  static hasPermission(user: User | null, permission: string): boolean {
    if (!user || !user.role) return false;
    return user.role.permissions.includes(permission as any);
  }

  /**
   * Check if current user has any of the permissions
   */
  static hasAnyPermission(user: User | null, permissions: string[]): boolean {
    if (!user || !user.role) return false;
    return permissions.some((permission) =>
      user.role.permissions.includes(permission as any),
    );
  }

  /**
   * Check if current user has role
   */
  static hasRole(user: User | null, roleName: string): boolean {
    if (!user || !user.role) return false;
    return user.role.name === roleName;
  }
}

export const userService = UserService;
