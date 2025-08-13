import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsMongoId,
  MinLength,
  Matches,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { RoleName } from "src/schemas/role.schema";

export class CreateAdminDto {
  @ApiProperty({
    example: "John Doe",
    description: "User full name",
  })
  @IsNotEmpty({ message: "Name is required" })
  @IsString()
  name: string;

  @ApiProperty({
    example: "admin@sslmonitor.com",
    description: "User email address",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Please provide a valid email address" })
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "User password (minimum 8 characters)",
  })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password must contain uppercase, lowercase, number and special character",
  })
  password: string;

  @ApiProperty({
    example: "507f1f77bcf86cd799439011",
    description: "Role ID (MongoDB ObjectId)",
  })
  @IsNotEmpty({ message: "Role ID is required" })
  @IsMongoId({ message: "Please provide a valid role ID" })
  roleId: string;
}

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiProperty({
    example: true,
    description: "User active status",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminQueryDto {
  @ApiProperty({
    required: false,
    example: 1,
    description: "Page number (default: 1)",
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    example: 10,
    description: "Items per page (default: 10, max: 50)",
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    example: "admin@example.com",
    description: "Search by email",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    example: "507f1f77bcf86cd799439011",
    description: "Filter by role ID",
  })
  @IsOptional()
  @IsMongoId()
  roleId?: string;

  @ApiProperty({
    required: false,
    example: true,
    description: "Filter by active status",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: "OldPassword123!",
    description: "Current password",
  })
  @IsNotEmpty({ message: "Current password is required" })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: "NewSecurePass123!",
    description: "New password (minimum 8 characters)",
  })
  @IsNotEmpty({ message: "New password is required" })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password must contain uppercase, lowercase, number and special character",
  })
  newPassword: string;
}

export class UserResponseDto {
  @ApiProperty({ example: "507f1f77bcf86cd799439011" })
  id: string;

  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({ example: "admin@sslmonitor.com" })
  email: string;

  @ApiProperty({
    type: "object",
    properties: {
      id: { type: "string", example: "507f1f77bcf86cd799439012" },
      name: {
        type: "string",
        enum: ["SUPER_ADMIN", "ADMIN"],
        example: "ADMIN",
      },
      permissions: {
        type: "array",
        items: { type: "string" },
        example: ["alert:read", "domain:read"],
      },
    },
  })
  role: {
    id: string;
    name: RoleName;
    permissions: string[];
  };

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: "2024-01-15T08:30:00.000Z", nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ example: "2024-01-15T08:30:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  updatedAt: Date;
}
