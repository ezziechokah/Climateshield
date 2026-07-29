import { IsString } from 'class-validator';

/** POST /internal/v1/auth/service-token body — client-credential exchange for a service-to-service token. Internal-only, not part of the public v1 surface. */
export class ServiceTokenDto {
  @IsString()
  service_id!: string;

  @IsString()
  client_secret!: string;
}
