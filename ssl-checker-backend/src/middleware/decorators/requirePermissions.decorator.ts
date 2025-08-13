import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const PERMISSION_CHECKER_KEY = 'permissionId';

export const RequirePermissions = (params: string): CustomDecorator<string> => SetMetadata(PERMISSION_CHECKER_KEY, params);
