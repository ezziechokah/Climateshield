import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * POST /v1/auth/password-reset body. `docs/12_API_Specification.md`'s
 * Authentication catalog lists exactly one `password-reset` route (no
 * separate "confirm" route), so this single DTO serves both phases of the
 * flow, dispatched in `AuthService.passwordReset` by which fields are
 * present:
 *  - Request phase: `{ email }` — always responds with the same generic
 *    message regardless of whether the email exists (no enumeration).
 *  - Confirm phase: `{ token, new_password }` — consumes the single-use
 *    token from `identity.password_reset_token` and sets the new password.
 */
export class PasswordResetDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  @MinLength(12)
  new_password?: string;
}
