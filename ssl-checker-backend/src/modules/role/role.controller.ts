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
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleQueryDto,
  AddPermissionDto,
  RemovePermissionDto,
  UpdatePermissionsDto,
  RoleResponseDto,
} from './role.dto';
import { JwtAuthGuard } from 'src/middleware/jwtAuth.guard';
import { RolesGuard } from 'src/middleware/roles.guard';
import { Roles } from 'src/middleware/decorators/roles.decorator';
import { RoleName } from 'src/schemas/role.schema';

@ApiTags('Role Management')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create new role',
    description: 'Create a new role with permissions (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiBody({ type: CreateRoleDto })
  async create(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
    return await this.roleService.create(createRoleDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Get paginated list of all roles (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        docs: {
          type: 'array',
          items: { $ref: '#/components/schemas/RoleResponseDto' },
        },
        totalDocs: { type: 'number' },
        limit: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPrevPage: { type: 'boolean' },
        nextPage: { type: 'number', nullable: true },
        prevPage: { type: 'number', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'admin' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  async findAll(@Query(ValidationPipe) query: RoleQueryDto) {
    return await this.roleService.findAll(query);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active roles',
    description: 'Get list of all active roles (for dropdown/selection)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active roles retrieved successfully',
    type: [RoleResponseDto],
  })
  async getActiveRoles() {
    return await this.roleService.getActiveRoles();
  }

  @Get('permissions')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get available permissions',
    description: 'Get list of all available permissions (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Available permissions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: ['alert:read', 'domain:create', 'user:update'],
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  async getAvailablePermissions() {
    return {
      permissions: this.roleService.getAvailablePermissions(),
    };
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get role statistics',
    description: 'Get role statistics (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Role statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalRoles: { type: 'number' },
        activeRoles: { type: 'number' },
        inactiveRoles: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  async getRoleStats() {
    return await this.roleService.getRoleStats();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Get specific role details by ID (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  async findOne(@Param('id') id: string) {
    return await this.roleService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update role',
    description: 'Update role information (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateRoleDto })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto,
  ) {
    return await this.roleService.update(id, updateRoleDto);
  }

  @Patch(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update role permissions',
    description: 'Update complete list of permissions for a role (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Role permissions updated successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdatePermissionsDto })
  async updatePermissions(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePermissionsDto: UpdatePermissionsDto,
  ) {
    return await this.roleService.updatePermissions(id, updatePermissionsDto.permissions);
  }

  @Patch(':id/permissions/add')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Add permission to role',
    description: 'Add a single permission to a role (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission added successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: AddPermissionDto })
  async addPermission(
    @Param('id') id: string,
    @Body(ValidationPipe) addPermissionDto: AddPermissionDto,
  ) {
    return await this.roleService.addPermission(id, addPermissionDto.permission);
  }

  @Patch(':id/permissions/remove')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Remove permission from role',
    description: 'Remove a single permission from a role (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission removed successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: RemovePermissionDto })
  async removePermission(
    @Param('id') id: string,
    @Body(ValidationPipe) removePermissionDto: RemovePermissionDto,
  ) {
    return await this.roleService.removePermission(id, removePermissionDto.permission);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate role',
    description: 'Deactivate role (soft delete) (SUPER_ADMIN only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Role deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete system roles' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id);
  }
}