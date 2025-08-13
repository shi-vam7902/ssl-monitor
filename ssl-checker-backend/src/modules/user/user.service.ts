import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from 'src/schemas/user.schema';
import { Role, RoleDocument, RoleName } from 'src/schemas/role.schema';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  /**
   * Create new user
   */
  async create(createUserData: CreateUserData): Promise<User> {
    const { name, email, password, roleId } = createUserData;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Verify role exists
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new BadRequestException('Invalid role ID');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: roleId,
    });

    return await newUser.save();
  }

  /**
   * Get all users with pagination
   */
  async findAll(options: UserQueryOptions = {}): Promise<any> {
    const { page = 1, limit = 10, search, roleId, isActive } = options;

    const filter: any = {};

    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }

    if (roleId) {
      filter.role = roleId;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const paginateOptions = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: 'role',
        select: 'name permissions',
      },
      select: '-password', // Exclude password from results
    };

    return await this.userModel.paginate(filter, paginateOptions);
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('role', 'name permissions')
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel
      .findOne({ email })
      .populate('role', 'name permissions')
      .exec();
  }

  /**
   * Update user
   */
  async update(id: string, updateData: UpdateUserData): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userModel.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Verify role if roleId is being updated
    if (updateData.roleId) {
      const role = await this.roleModel.findById(updateData.roleId);
      if (!role) {
        throw new BadRequestException('Invalid role ID');
      }
    }

    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    Object.assign(user, updateData);
    await user.save();

    return await this.findById(id);
  }

  /**
   * Delete user (soft delete)
   */
  async remove(id: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    await user.save();
  }

  /**
   * Change user password
   */
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
  }

  /**
   * Get user count by role
   */
  async getUserCountByRole(): Promise<any> {
    const pipeline = [
      { $match: { isActive: true } },
              {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'roleData'
          }
        },
      { $unwind: '$roleData' },
      {
        $group: {
          _id: '$roleData.name',
          count: { $sum: 1 }
        }
      }
    ];

    return await this.userModel.aggregate(pipeline);
  }

  /**
   * Get active users count
   */
  async getActiveUsersCount(): Promise<number> {
    return await this.userModel.countDocuments({ isActive: true });
  }

  /**
   * Validate user credentials for authentication
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({ email, isActive: true })
      .populate('role', 'name permissions')
      .exec();

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }

    return null;
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      lastLoginAt: new Date(),
    });
  }
}
