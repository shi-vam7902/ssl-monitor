import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsString,
  IsEnum,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { RoleName } from "src/schemas/role.schema";

export class LoginUserDto {
  @ApiProperty({
    example: "admin@sslmonitor.com",
    description: "User email address",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsString()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "User password",
  })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  password: string;
}

export class CreateUserDto {
  @ApiProperty({
    example: "John Doe",
    description: "User full name",
  })
  @IsNotEmpty({ message: "Name is required" })
  @IsString()
  name: string;

  @ApiProperty({
    example: "user@sslmonitor.com",
    description: "User email address",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsString()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    description:
      "User password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)",
  })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password must contain uppercase, lowercase, number and special character",
  })
  password: string;

  @ApiProperty({
    enum: RoleName,
    example: RoleName.ADMIN,
    description: "User role",
  })
  @IsNotEmpty({ message: "Role is required" })
  @IsEnum(RoleName, { message: "Role must be either SUPER_ADMIN or ADMIN" })
  role: RoleName;
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
    description:
      "New password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)",
  })
  @IsNotEmpty({ message: "New password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password must contain uppercase, lowercase, number and special character",
  })
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: "user@sslmonitor.com",
    description: "Email address to reset password for",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsString()
  @IsEmail({}, { message: "Please provide a valid email address" })
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: "NewSecurePass123!",
    description: "New password",
  })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Password must contain uppercase, lowercase, number and special character",
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: "reset-token-here",
    description: "Password reset token",
  })
  @IsNotEmpty({ message: "Reset token is required" })
  @IsString()
  token: string;
}
