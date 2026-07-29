import { ArrayUnique, IsArray, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * PATCH /v1/roles/{id} body. `permission_ids` (when present) REPLACES the
 * role's entire permission set — a role's permission-set change publishes
 * `user.role_changed` for every user currently holding that role, per
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#authorization-and-rbac-architecture.
 */
export class UpdateRolePermissionsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  permission_ids?: string[];
}
