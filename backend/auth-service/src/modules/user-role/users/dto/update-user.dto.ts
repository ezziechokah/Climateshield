import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { MfaMethod, UserStatus } from '../entities/user-status.enum';

/**
 * PATCH /v1/users/{id} body — basic profile/role editing, gated on
 * `user_management:edit`. Does NOT include `admin_boundary_scope`: that
 * field is managed exclusively through the distinct, higher-permission
 * `update-boundary-scope.dto.ts` sub-resource (`user_management:approve`).
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  full_name?: string;

  @IsOptional()
  @IsUUID()
  role_id?: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsIn(['active', 'suspended', 'deactivated', 'invited'])
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  preferred_language?: string;

  @IsOptional()
  @IsBoolean()
  mfa_enabled?: boolean;

  @IsOptional()
  @IsIn(['totp', 'sms', 'none'])
  mfa_method?: MfaMethod;
}
