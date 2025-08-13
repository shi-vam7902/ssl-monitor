import { ServiceUnavailableException, ValidationError } from "@nestjs/common";

import { ApiProperty } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";

export enum Environment {
  Development = "development",
  Production = "production",
  Staging = "staging",
}

export class EnvVariablesDto {
  @IsEnum(Environment)
  @IsNotEmpty()
  @ApiProperty({ enum: Environment, example: Environment.Development })
  NODE_ENV: Environment;

  @IsNotEmpty()
  @IsString()
  APP_URL: string;

  @IsNumber()
  @ApiProperty()
  PORT: number;

  @IsNotEmpty()
  CREDENTIALS: boolean;

  @IsNotEmpty()
  @IsString()
  ORIGIN: string;

  @IsNotEmpty()
  @IsString()
  MONGO_DB_URL: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_EXPIRES_IN: string;

  @IsNotEmpty()
  @IsString()
  SMTP_MAIL_HOST: string;

  @IsNumber()
  EMAIL_PORT: number;

  @IsNotEmpty()
  @IsString()
  SMTP_USERNAME: string;

  @IsNotEmpty()
  @IsString()
  SMTP_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  EMAIL_FROM: string;

  @IsNotEmpty()
  @IsString()
  LOG_DIR: string;

  @IsNumber()
  SSL_CHECK_INTERVAL_HOURS: number;

  @IsNumber()
  SSL_ALERT_THRESHOLD_DAYS: number;

  @IsString()
  @IsOptional()
  SUPER_ADMIN_EMAIL: string;

  @IsString()
  @IsOptional()
  SUPER_ADMIN_PASSWORD: string;

  @IsString()
  @IsOptional()
  SUPER_ADMIN_NAME: string;

  @IsString()
  @IsOptional()
  CRON_EXPRESSION: string;

  @IsString()
  @IsOptional()
  ACME_ENABLED: string;

  @IsString()
  @IsOptional()
  ACME_PROVIDER: string;

  @IsString()
  @IsOptional()
  RENEWAL_WEBHOOK_URL: string;

  @IsString()
  @IsOptional()
  RENEWAL_WEBHOOK_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVariablesDto, config, {
    enableImplicitConversion: true,
  });

  const errors: ValidationError[] = ([] = validateSync(validatedConfig, {
    skipMissingProperties: false,
  }));
  if (errors.length > 0) {
    throw new ServiceUnavailableException(
      errors[0]["constraints"][Object.keys(errors[0]["constraints"])[0]]
    );
  }
  return validatedConfig;
}
