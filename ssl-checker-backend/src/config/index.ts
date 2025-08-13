import { EnvVariablesDto } from './validation';

export const ENV = process.env as unknown as EnvVariablesDto;
