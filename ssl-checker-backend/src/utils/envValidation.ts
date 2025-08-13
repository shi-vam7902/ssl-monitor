import { ServiceUnavailableException, ValidationError } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, validateSync } from 'class-validator';

// import { Validation } from 'src/constants/messages';

export enum Environment {
  Local = '',
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
}

export class EnvVariablesDto {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  APP_URL: string;

  @IsNumber()
  PORT: number;

  @IsNotEmpty()
  CREDENTIALS: boolean;

  @IsNotEmpty()
  ORIGIN: string;

  @IsNotEmpty()
  FORGET_PASSWORD_TOKEN_EXPIRATION: string;

  @IsNotEmpty()
  ACCESS_TOKEN_EXPIRATION: string;

  @IsNotEmpty()
  REACT_APP_URL: string;

  @IsNotEmpty()
  LOG_FORMAT: string;

  @IsNotEmpty()
  LOG_DIR: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVariablesDto, config, {
    enableImplicitConversion: true,
  });

  const errors: ValidationError[] = ([] = validateSync(validatedConfig, {
    skipMissingProperties: false,
  }));
  if (errors.length > 0) {
    throw new ServiceUnavailableException(errors[0]['constraints'][Object.keys(errors[0]['constraints'])[0]]);
  }
  return validatedConfig;
}
