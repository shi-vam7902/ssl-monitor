import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SSLStatus } from "../../schemas/alert.schema";

export class CreateSSLDto {
  @ApiProperty({
    example: "example.com",
    description: "Domain name to monitor",
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value
      ?.toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "")
      .replace(/\/.*$/, "")
      .replace(/:\\d+$/, "")
  )
  domain: string;

  @ApiPropertyOptional({
    enum: ["development", "staging", "production"],
    description: "Environment tag for the SSL record",
  })
  @IsOptional()
  @IsString()
  environment?: "development" | "staging" | "production";
}

export class UpdateSSLDto {
  @ApiPropertyOptional({
    example: "example.com",
    description: "Domain name to monitor",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value
      ?.toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
  )
  domain?: string;

  @ApiPropertyOptional({
    enum: ["development", "staging", "production"],
    description: "Environment tag for the SSL record",
  })
  @IsOptional()
  @IsString()
  environment?: "development" | "staging" | "production";

  @ApiPropertyOptional({
    example: "2025-12-31T23:59:59.000Z",
    description: "SSL certificate expiry date",
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiPropertyOptional({
    example: 30,
    description: "Days remaining until expiry",
  })
  @IsOptional()
  @IsNumber()
  daysRemaining?: number;

  @ApiPropertyOptional({
    enum: SSLStatus,
    description: "SSL certificate status",
  })
  @IsOptional()
  @IsEnum(SSLStatus)
  status?: SSLStatus;

  @ApiPropertyOptional({
    enum: ["development", "staging", "production"],
    description: "Filter by environment",
  })
  @ApiPropertyOptional({
    example: "Let's Encrypt",
    description: "Certificate issuer",
  })
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiPropertyOptional({
    example: "12345678901234567890",
    description: "Certificate serial number",
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: "example.com",
    description: "Certificate common name",
  })
  @IsOptional()
  @IsString()
  commonName?: string;

  @ApiPropertyOptional({
    example: "Example Organization",
    description: "Certificate organization",
  })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional({
    example: "SSL certificate error message",
    description: "Error message if SSL check failed",
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class SSLQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Page number for pagination",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: "Number of items per page" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: SSLStatus, description: "Filter by SSL status" })
  @IsOptional()
  @IsEnum(SSLStatus)
  status?: SSLStatus;

  @ApiPropertyOptional({
    example: "example.com",
    description: "Search by domain name",
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({
    example: 30,
    description: "Filter by days remaining (less than or equal to)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  daysRemaining?: number;

  @ApiPropertyOptional({
    example: "asc",
    description: "Sort order",
    enum: ["asc", "desc"],
  })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";

  @ApiPropertyOptional({
    example: "expiryDate",
    description: "Sort by field",
    enum: ["domain", "expiryDate", "daysRemaining", "status", "createdAt"],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = "expiryDate";
}

export class RenewSSLDto {
  @ApiPropertyOptional({
    example: false,
    description: "Force renewal even if certificate is valid",
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean = false;
}

export class SSLResponseDto {
  @ApiProperty({
    example: "507f1f77bcf86cd799439011",
    description: "SSL record ID",
  })
  _id: string;

  @ApiProperty({ example: "example.com", description: "Domain name" })
  domain: string;

  @ApiProperty({
    example: "2025-12-31T23:59:59.000Z",
    description: "SSL certificate expiry date",
  })
  expiryDate: Date;

  @ApiProperty({ example: 30, description: "Days remaining until expiry" })
  daysRemaining: number;

  @ApiProperty({ enum: SSLStatus, description: "SSL certificate status" })
  status: SSLStatus;

  @ApiProperty({
    example: "2025-01-15T10:30:00.000Z",
    description: "Last time SSL was checked",
  })
  lastChecked: Date;

  @ApiProperty({
    example: ["2025-01-01T00:00:00.000Z"],
    description: "Timestamps when alerts were sent",
  })
  alertSentAt: Date[];

  @ApiProperty({
    example: "507f1f77bcf86cd799439012",
    description: "User who created this record",
  })
  createdBy: string;

  @ApiPropertyOptional({
    example: "Let's Encrypt",
    description: "Certificate issuer",
  })
  issuer?: string;

  @ApiPropertyOptional({
    example: "12345678901234567890",
    description: "Certificate serial number",
  })
  serialNumber?: string;

  @ApiPropertyOptional({
    example: "example.com",
    description: "Certificate common name",
  })
  commonName?: string;

  @ApiPropertyOptional({
    example: "Example Organization",
    description: "Certificate organization",
  })
  organization?: string;

  @ApiPropertyOptional({
    example: "rechecked",
    description: "Last renewal status",
  })
  renewalStatus?: string;

  @ApiPropertyOptional({
    example: "SSL certificate error message",
    description: "Error message if SSL check failed",
  })
  errorMessage?: string;

  @ApiProperty({
    example: "2025-01-15T10:30:00.000Z",
    description: "Record creation date",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2025-01-15T10:30:00.000Z",
    description: "Record last update date",
  })
  updatedAt: Date;
}

export class RenewSSLResponseDto extends SSLResponseDto {
  @ApiProperty({
    example: "rechecked",
    description: "Renewal action performed",
    enum: ["rechecked", "renewal_requested", "failed"],
  })
  renewalStatus: string;

  @ApiProperty({
    example: "SSL certificate information updated successfully",
    description: "Renewal message",
  })
  message: string;
}
