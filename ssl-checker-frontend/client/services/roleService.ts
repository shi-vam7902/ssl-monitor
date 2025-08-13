import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/routes";
import {
  ApiResponse,
  PaginatedResponse,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleQueryDto,
  PermissionType,
} from "@/types/api";

export class RoleService {
  /**
   * Create a new role (SUPER_ADMIN only)
   */
  static async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const response = await api.post<ApiResponse<Role>>(
        API_ROUTES.roles.create,
        createRoleDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Create role error:", error);
      throw error;
    }
  }

  /**
   * Get all roles with pagination and filtering
   */
  static async getRoles(
    query?: RoleQueryDto,
  ): Promise<PaginatedResponse<Role>> {
    try {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get<ApiResponse<PaginatedResponse<Role>>>(
        `${API_ROUTES.roles.list}?${params.toString()}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Get roles error:", error);
      throw error;
    }
  }

  /**
   * Get all roles without pagination (for dropdowns)
   */
  static async getAllRoles(): Promise<Role[]> {
    try {
      const response = await this.getRoles({ limit: 100 });
      return response.docs;
    } catch (error) {
      console.error("Get all roles error:", error);
      throw error;
    }
  }

  /**
   * Get role by ID
   */
  static async getRoleById(id: string): Promise<Role> {
    try {
      const response = await api.get<ApiResponse<Role>>(
        API_ROUTES.roles.byId(id),
      );
      return response.data.data;
    } catch (error) {
      console.error("Get role by ID error:", error);
      throw error;
    }
  }

  /**
   * Update role
   */
  static async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    try {
      const response = await api.put<ApiResponse<Role>>(
        API_ROUTES.roles.update(id),
        updateRoleDto,
      );
      return response.data.data;
    } catch (error) {
      console.error("Update role error:", error);
      throw error;
    }
  }

  /**
   * Delete role
   */
  static async deleteRole(id: string): Promise<void> {
    try {
      await api.delete(API_ROUTES.roles.delete(id));
    } catch (error) {
      console.error("Delete role error:", error);
      throw error;
    }
  }

  /**
   * Update role permissions
   */
  static async updateRolePermissions(
    id: string,
    permissions: PermissionType[],
  ): Promise<Role> {
    try {
      const response = await api.put<ApiResponse<Role>>(
        API_ROUTES.roles.permissions(id),
        { permissions },
      );
      return response.data.data;
    } catch (error) {
      console.error("Update role permissions error:", error);
      throw error;
    }
  }

  /**
   * Get all available permissions
   */
  static getAllPermissions(): PermissionType[] {
    return Object.values(PermissionType);
  }

  /**
   * Get permissions grouped by category
   */
  static getPermissionsByCategory(): Record<string, PermissionType[]> {
    const permissions = this.getAllPermissions();
    const grouped: Record<string, PermissionType[]> = {};

    permissions.forEach((permission) => {
      const category = permission.split(":")[0];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });

    return grouped;
  }

  /**
   * Check if permission belongs to category
   */
  static isPermissionInCategory(
    permission: PermissionType,
    category: string,
  ): boolean {
    return permission.startsWith(`${category}:`);
  }

  /**
   * Get permission display name
   */
  static getPermissionDisplayName(permission: PermissionType): string {
    const parts = permission.split(":");
    if (parts.length === 2) {
      const resource = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const action = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${resource} ${action}`;
    }
    return permission;
  }

  /**
   * Get role display name
   */
  static getRoleDisplayName(roleName: string): string {
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}

export const roleService = RoleService;
