import { IsEmail, IsString, MinLength } from 'class-validator';

/** POST /v1/auth/login body, per docs/12_API_Specification.md#authentication. */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
