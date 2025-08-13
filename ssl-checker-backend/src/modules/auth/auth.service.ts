import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { User, UserDocument } from "src/schemas/user.schema";
import { Role, RoleDocument, RoleName } from "src/schemas/role.schema";
import {
  LoginUserDto,
  CreateUserDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./auth.dto";
import { ENV } from "src/config";

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: RoleName;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: RoleName;
      permissions: string[];
    };
    lastLoginAt: Date;
  };
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private jwtService: JwtService
  ) {}

  /**
   * Authenticate user with email and password
   */
  async login(loginDto: LoginUserDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user with role populated
    const user = await this.userModel
      .findOne({ email, isActive: true })
      .populate("role", "name permissions")
      .exec();

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      roleId: (user.role as any)._id.toString(),
      roleName: (user.role as any).name,
      permissions: (user.role as any).permissions,
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: {
          id: (user.role as any)._id.toString(),
          name: (user.role as any).name,
          permissions: (user.role as any).permissions,
        },
        lastLoginAt: new Date(),
      },
      token,
    };
  }

  /**
   * Create new user (SUPER_ADMIN only)
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // Find role
    const roleDoc = await this.roleModel.findOne({ name: role });
    if (!roleDoc) {
      throw new BadRequestException(`Role ${role} not found`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: roleDoc._id,
    });

    return await newUser.save();
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userModel
      .findById(payload.sub)
      .populate("role", "name permissions")
      .exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return user;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate("role", "name permissions")
      .select("-password")
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: {
        id: (user.role as any)._id.toString(),
        name: (user.role as any).name,
        permissions: (user.role as any).permissions,
      },
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Generate JWT token
   */
  generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: ENV.JWT_SECRET,
      expiresIn: ENV.JWT_EXPIRES_IN,
    });
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Compare password
   */
  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
