import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/** POST /v1/organizations body. `agency_id` is never accepted from the client — always the caller's own agency. */
export class CreateOrganizationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  org_type?: string;

  @IsOptional()
  @IsUUID()
  parent_organization_id?: string;
}
