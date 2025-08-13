import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { LoginUserDto, CreateUserDto, ChangePasswordDto } from "./auth.dto";
import { JwtAuthGuard } from "src/middleware/jwtAuth.guard";
import { RolesGuard } from "src/middleware/roles.guard";
import { Roles } from "src/middleware/decorators/roles.decorator";
import { Public } from "src/middleware/decorators/public.decorator";
import { RoleName } from "src/schemas/role.schema";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User login",
    description: "Authenticate user with email and password",
  })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    schema: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            role: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                permissions: { type: "array", items: { type: "string" } },
              },
            },
            lastLoginAt: { type: "string", format: "date-time" },
          },
        },
        accessToken: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiBody({ type: LoginUserDto })
  async login(@Body(ValidationPipe) loginDto: LoginUserDto) {
    return await this.authService.login(loginDto);
  }

  @Post("create-admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Create new user",
    description: "Create new user (SUPER_ADMIN only)",
  })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        roleId: { type: "string" },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "User already exists or invalid role",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - SUPER_ADMIN role required",
  })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const user = await this.authService.createUser(createUserDto);
    return {
      id: (user as any)._id.toString(),
      email: user.email,
      roleId: user.role.toString(),
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Change password",
    description: "Change current user password",
  })
  @ApiResponse({
    status: 200,
    description: "Password changed successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Password changed successfully" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Current password is incorrect" })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Request() req: any,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
  ) {
    await this.authService.changePassword(req.user.sub, changePasswordDto);
    return { message: "Password changed successfully" };
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Get user profile",
    description: "Get current user profile information",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        role: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            permissions: { type: "array", items: { type: "string" } },
          },
        },
        isActive: { type: "boolean" },
        lastLoginAt: { type: "string", format: "date-time" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  })
  async getProfile(@Request() req: any) {
    return await this.authService.getProfile(req.user.sub);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User logout",
    description: "Logout current user",
  })
  @ApiResponse({
    status: 200,
    description: "Logout successful",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Logged out successfully" },
      },
    },
  })
  async logout() {
    // In JWT-based auth, logout is mainly handled on the client side
    // by removing the token. Server-side blacklisting can be implemented
    // if needed for enhanced security
    return { message: "Logged out successfully" };
  }
}
