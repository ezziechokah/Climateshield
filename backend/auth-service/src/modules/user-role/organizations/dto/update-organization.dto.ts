import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * PATCH /v1/organizations/{id} body. `parent_organization_id` may be an
 * explicit `null` to clear the parent (top-level) — `@IsOptional()`
 * treats both `undefined` (field omitted) and `null` as "skip validation",
 * so a real value is still checked as a UUID while `null` passes through
 * to `OrganizationsService`, which rejects reassignments that would
 * introduce a cycle (direct, indirect, or self-parent) with 422
 * `ORGANIZATION_CYCLE_DETECTED`.
 */
export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  org_type?: string;

  @IsOptional()
  @IsUUID()
  parent_organization_id?: string | null;
}
