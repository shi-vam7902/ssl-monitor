import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PaginateModel } from "mongoose";

import { Role, RoleDocument, RoleName } from "src/schemas/role.schema";

export interface CreateRoleData {
  name: RoleName;
  permissions: string[];
  description?: string;
}

export interface UpdateRoleData {
  name?: RoleName;
  permissions?: string[];
  description?: string;
  isActive?: boolean;
}

export interface RoleQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: PaginateModel<RoleDocument>
  ) {}

  /**
   * Create new role
   */
  async create(createRoleData: CreateRoleData): Promise<Role> {
    const { name, permissions, description } = createRoleData;

    // Check if role already exists
    const existingRole = await this.roleModel.findOne({ name });
    if (existingRole) {
      throw new BadRequestException(`Role ${name} already exists`);
    }

    const newRole = new this.roleModel({
      name,
      permissions,
      description,
    });

    return await newRole.save();
  }

  /**
   * Get all roles with pagination
   */
  async findAll(options: RoleQueryOptions = {}): Promise<any> {
    const { page = 1, limit = 10, search, isActive } = options;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const paginateOptions = {
      page,
      limit,
      sort: { createdAt: -1 },
    };

    return await this.roleModel.paginate(filter, paginateOptions);
  }

  /**
   * Get role by ID
   */
  async findById(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException("Role not found");
    }
    return role;
  }

  /**
   * Get role by name
   */
  async findByName(name: RoleName): Promise<Role | null> {
    return await this.roleModel.findOne({ name }).exec();
  }

  /**
   * Update role
   */
  async update(id: string, updateData: UpdateRoleData): Promise<Role> {
    const role = await this.findById(id);

    // Check name uniqueness if name is being updated
    if (updateData.name && updateData.name !== role.name) {
      const existingRole = await this.roleModel.findOne({
        name: updateData.name,
        _id: { $ne: id },
      });
      if (existingRole) {
        throw new BadRequestException(`Role ${updateData.name} already exists`);
      }
    }

    Object.assign(role, updateData);
    return await (role as any).save();
  }

  /**
   * Delete role (soft delete)
   */
  async remove(id: string): Promise<void> {
    const role = await this.findById(id);

    // Prevent deletion of system roles
    if (role.name === RoleName.SUPER_ADMIN || role.name === RoleName.ADMIN) {
      throw new BadRequestException("Cannot delete system roles");
    }

    role.isActive = false;
    await (role as any).save();
  }

  /**
   * Get all active roles (for dropdown/selection)
   */
  async getActiveRoles(): Promise<Role[]> {
    return await this.roleModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  /**
   * Add permission to role
   */
  async addPermission(id: string, permission: string): Promise<Role> {
    const role = await this.findById(id);

    if (!role.permissions.includes(permission)) {
      role.permissions.push(permission);
      await (role as any).save();
    }

    return role;
  }

  /**
   * Remove permission from role
   */
  async removePermission(id: string, permission: string): Promise<Role> {
    const role = await this.findById(id);

    role.permissions = role.permissions.filter((p) => p !== permission);
    await (role as any).save();

    return role;
  }

  /**
   * Update role permissions
   */
  async updatePermissions(id: string, permissions: string[]): Promise<Role> {
    const role = await this.findById(id);
    role.permissions = permissions;
    return await (role as any).save();
  }

  /**
   * Get available permissions list
   */
  getAvailablePermissions(): string[] {
    return [
      // Domain permissions
      "domain:create",
      "domain:read",
      "domain:update",
      "domain:delete",

      // User permissions
      "user:create",
      "user:read",
      "user:update",
      "user:delete",

      // Alert permissions
      "alert:read",
      "alert:create",
      "alert:delete",

      // Role permissions
      "role:create",
      "role:read",
      "role:update",
      "role:delete",

      // System permissions
      "system:admin",
      "system:settings",
      "system:logs",
    ];
  }

  /**
   * Check if role has specific permission
   */
  async hasPermission(roleId: string, permission: string): Promise<boolean> {
    const role = await this.findById(roleId);
    return (
      role.permissions.includes(permission) ||
      role.permissions.includes("system:admin")
    );
  }

  /**
   * Get role statistics
   */
  async getRoleStats(): Promise<any> {
    const [totalRoles, activeRoles, inactiveRoles] = await Promise.all([
      this.roleModel.countDocuments({}),
      this.roleModel.countDocuments({ isActive: true }),
      this.roleModel.countDocuments({ isActive: false }),
    ]);

    return {
      totalRoles,
      activeRoles,
      inactiveRoles,
    };
  }

  /**
   * Initialize default roles (used in seeding)
   */
  async initializeDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: RoleName.SUPER_ADMIN,
        permissions: this.getAvailablePermissions(),
        description: "Super administrator with full system access",
      },
      {
        name: RoleName.ADMIN,
        permissions: ["alert:read", "domain:read"],
        description:
          "Administrator with read-only access to alerts and domains",
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.roleModel.findOne({
        name: roleData.name,
      });
      if (!existingRole) {
        const role = new this.roleModel(roleData);
        await role.save();
      } else {
        // Update permissions for existing roles
        existingRole.permissions = roleData.permissions;
        existingRole.description = roleData.description;
        await existingRole.save();
      }
    }
  }
}
