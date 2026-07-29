import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import { MfaMethod } from '../entities/user-status.enum';

/** POST /v1/users body. `agency_id` is never accepted from the client — it is always the caller's own agency (tenancy). */
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  full_name!: string;

  @IsUUID()
  role_id!: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  /** Optional at creation — an invited user may set their own password later via the password-reset flow; omitting it leaves the account SSO-only until then. */
  @IsOptional()
  @IsString()
  @MinLength(12)
  password?: string;

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
