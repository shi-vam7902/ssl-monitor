import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
  Matches,
} from "class-validator";
import { SSLStatus } from "src/schemas/alert.schema";

export class CreateAlertDto {
  @ApiProperty({
    example: "example.com",
    description: "Domain name to monitor (without protocol)",
  })
  @IsNotEmpty({ message: "Domain is required" })
  @IsString()
  @Transform(({ value }: { value: string }) =>
    value
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
  )
  // Accept multi-level TLDs (.co.in) and common ccTLDs; strict RFC labels
  @Matches(
    /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$/,
    {
      message: "Please provide a valid domain name",
    }
  )
  domain: string;

  @ApiProperty({
    required: false,
    enum: ["development", "staging", "production"],
    description: "Environment tag for the SSL record",
  })
  @IsOptional()
  @IsString()
  environment?: "development" | "staging" | "production";
}

export class UpdateAlertDto extends PartialType(CreateAlertDto) {}

export class AlertQueryDto {
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
    description: "Items per page (default: 10, max: 100)",
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    example: "example.com",
    description: "Search by domain name",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: SSLStatus,
    example: SSLStatus.EXPIRING,
    description: "Filter by alert status",
  })
  @IsOptional()
  @IsEnum(SSLStatus)
  status?: SSLStatus;

  @ApiProperty({
    required: false,
    example: "30",
    description:
      "Filter alerts with days remaining less than or equal to this value",
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  daysRemaining?: number;

  @ApiProperty({
    required: false,
    enum: ["development", "staging", "production"],
    description: "Filter by environment",
  })
  @IsOptional()
  @IsString()
  environment?: "development" | "staging" | "production";
}

export class CheckDomainDto {
  @ApiProperty({
    example: "example.com",
    description: "Domain name to check SSL certificate",
  })
  @IsNotEmpty({ message: "Domain is required" })
  @IsString()
  @Transform(({ value }: { value: string }) =>
    value
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
  )
  @Matches(/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, {
    message: "Please provide a valid domain name",
  })
  domain: string;
}

export class BulkCheckDomainsDto {
  @ApiProperty({
    example: ["example.com", "google.com", "github.com"],
    description: "Array of domain names to check",
    type: [String],
  })
  @IsNotEmpty({ message: "Domains array is required" })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((domain: string) =>
          domain
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "")
        )
      : [
          value
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, ""),
        ]
  )
  domains: string[];
}

export class AlertResponseDto {
  @ApiProperty({ example: "507f1f77bcf86cd799439011" })
  id: string;

  @ApiProperty({ example: "example.com" })
  domain: string;

  @ApiProperty({ example: "2024-12-31T23:59:59.000Z" })
  expiryDate: Date;

  @ApiProperty({ example: 95 })
  daysRemaining: number;

  @ApiProperty({ enum: SSLStatus, example: SSLStatus.VALID })
  status: SSLStatus;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  lastChecked: Date;

  @ApiProperty({
    example: ["2024-01-10T09:00:00.000Z"],
    type: [Date],
    description: "Array of dates when alerts were sent",
  })
  alertSentAt: Date[];

  @ApiProperty({ example: "507f1f77bcf86cd799439012" })
  createdBy: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: "Let's Encrypt Authority X3", required: false })
  issuer?: string;

  @ApiProperty({ example: "03:A7:B2:F4:...", required: false })
  serialNumber?: string;

  @ApiProperty({ example: "2024-01-15T08:30:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  updatedAt: Date;
}
