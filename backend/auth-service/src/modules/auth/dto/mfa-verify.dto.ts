import { IsString, Length } from 'class-validator';

/** POST /v1/auth/mfa/verify body — completes a login that returned an `mfa_challenge_token`. */
export class MfaVerifyDto {
  @IsString()
  challenge_token!: string;

  @IsString()
  @Length(6, 8)
  code!: string;
}
