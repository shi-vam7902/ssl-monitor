import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";

import { UserService } from "./user.service";
import {
  UpdateAdminDto,
  ChangePasswordDto,
  UserResponseDto,
  CreateAdminDto,
  AdminQueryDto,
} from "./user.dto";
import { JwtAuthGuard } from "src/middleware/jwtAuth.guard";
import { RolesGuard } from "src/middleware/roles.guard";
import { RequirePermissions } from "src/middleware/decorators/requirePermissions.decorator";
import { PermissionType } from "src/constants/permissionType";

@ApiTags("User Management")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard)
  @RequirePermissions(PermissionType.USER_CREATE)
  @ApiOperation({
    summary: "Create new user",
    description: "Create a new user account (SUPER_ADMIN only)",
  })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - SUPER_ADMIN role required",
  })
  @ApiBody({ type: CreateAdminDto })
  async create(@Body(ValidationPipe) createUserDto: CreateAdminDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @RequirePermissions(PermissionType.USER_READ)
  @ApiOperation({
    summary: "Get all users",
    description: "Get paginated list of all users (SUPER_ADMIN only)",
  })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    schema: {
      type: "object",
      properties: {
        docs: {
          type: "array",
          items: { $ref: "#/components/schemas/UserResponseDto" },
        },
        totalDocs: { type: "number" },
        limit: { type: "number" },
        page: { type: "number" },
        totalPages: { type: "number" },
        hasNextPage: { type: "boolean" },
        hasPrevPage: { type: "boolean" },
        nextPage: { type: "number", nullable: true },
        prevPage: { type: "number", nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - SUPER_ADMIN role required",
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiQuery({ name: "search", required: false, example: "admin@example.com" })
  @ApiQuery({
    name: "roleId",
    required: false,
    example: "507f1f77bcf86cd799439011",
  })
  @ApiQuery({ name: "isActive", required: false, example: true })
  async findAll(@Query(ValidationPipe) query: AdminQueryDto) {
    return await this.userService.findAll(query);
  }

  @Get("me")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Get current authenticated user profile information",
  })
  @ApiResponse({
    status: 200,
    description: "Current user profile retrieved successfully",
    type: UserResponseDto,
  })
  async getCurrentUser(@Request() req: any) {
    return await this.userService.findById(req.user.sub);
  }

  @Get("stats")
  @UseGuards(RolesGuard)
  @RequirePermissions(PermissionType.USER_READ)
  @ApiOperation({
    summary: "Get user statistics",
    description:
      "Get user statistics including count by role (SUPER_ADMIN only)",
  })
  @ApiResponse({
    status: 200,
    description: "User statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalUsers: { type: "number" },
        usersByRole: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string" },
              count: { type: "number" },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - SUPER_ADMIN role required",
  })
  async getUserStats() {
    const [totalUsers, usersByRole] = await Promise.all([
      this.userService.getActiveUsersCount(),
      this.userService.getUserCountByRole(),
    ]);

    return {
      totalUsers,
      usersByRole,
    };
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @RequirePermissions(PermissionType.USER_READ)
  @ApiOperation({
    summary: "Get user by ID",
    description: "Get specific user details by ID (SUPER_ADMIN only)",
  })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - SUPER_ADMIN role required",
  })
  @ApiParam({ name: "id", example: "507f1f77bcf86cd799439011" })
  async findOne(@Param("id") id: string) {
    return await this.userService.findById(id);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @RequirePermissions(PermissionType.USER_UPDATE)
  @ApiOperation({
    summary: "Update user",
    description: "Update user information (SUPER_ADMIN only)",
  })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - SUPER_ADMIN role required",
  })
  @ApiParam({ name: "id", example: "507f1f77bcf86cd799439011" })
  @ApiBody({ type: UpdateAdminDto })
  async update(
    @Param("id") id: string,
    @Body(ValidationPipe) updateUserDto: UpdateAdminDto
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  @Put("me/change-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Change current user password",
    description: "Change password for the currently authenticated user",
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
    await this.userService.changePassword(
      req.user.sub,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword
    );

    return { message: "Password changed successfully" };
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @RequirePermissions(PermissionType.USER_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Deactivate user",
    description: "Deactivate user account (soft delete) (SUPER_ADMIN only)",
  })
  @ApiResponse({
    status: 204,
    description: "User deactivated successfully",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - SUPER_ADMIN role required",
  })
  @ApiParam({ name: "id", example: "507f1f77bcf86cd799439011" })
  async remove(@Param("id") id: string) {
    await this.userService.remove(id);
  }
}
