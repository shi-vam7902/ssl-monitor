import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { RoleName } from 'src/schemas/role.schema';

export class CreateRoleDto {
  @ApiProperty({
    enum: RoleName,
    example: RoleName.ADMIN,
    description: 'Role name',
  })
  @IsNotEmpty({ message: 'Role name is required' })
  @IsEnum(RoleName, { message: 'Role name must be either SUPER_ADMIN or ADMIN' })
  name: RoleName;

  @ApiProperty({
    example: ['alert:read', 'domain:read'],
    description: 'Array of permissions for this role',
    type: [String],
  })
  @IsNotEmpty({ message: 'Permissions are required' })
  @IsArray({ message: 'Permissions must be an array' })
  @ArrayNotEmpty({ message: 'At least one permission is required' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  permissions: string[];

  @ApiProperty({
    example: 'Administrator with read-only access',
    description: 'Role description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({
    example: true,
    description: 'Role active status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RoleQueryDto {
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Page number (default: 1)',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Items per page (default: 10, max: 50)',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    example: 'admin',
    description: 'Search by role name or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Filter by active status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}

export class AddPermissionDto {
  @ApiProperty({
    example: 'alert:create',
    description: 'Permission to add to the role',
  })
  @IsNotEmpty({ message: 'Permission is required' })
  @IsString()
  permission: string;
}

export class RemovePermissionDto {
  @ApiProperty({
    example: 'alert:create',
    description: 'Permission to remove from the role',
  })
  @IsNotEmpty({ message: 'Permission is required' })
  @IsString()
  permission: string;
}

export class UpdatePermissionsDto {
  @ApiProperty({
    example: ['alert:read', 'domain:read', 'alert:create'],
    description: 'Complete array of permissions for this role',
    type: [String],
  })
  @IsNotEmpty({ message: 'Permissions are required' })
  @IsArray({ message: 'Permissions must be an array' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  permissions: string[];
}

export class RoleResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ enum: RoleName, example: RoleName.ADMIN })
  name: RoleName;

  @ApiProperty({
    example: ['alert:read', 'domain:read'],
    type: [String],
  })
  permissions: string[];

  @ApiProperty({ example: 'Administrator with read-only access' })
  description: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T08:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}