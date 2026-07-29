import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

/**
 * PATCH /v1/users/{id}/boundary-scope body. A distinct sub-resource gated on
 * `user_management:approve` (NOT plain `user_management:edit`) — see
 * docs/backend/02_Identity_and_Access_Service_Architecture.md#users-module
 * ("scope changes are a security-sensitive action audited at Full
 * audit_log coverage tier") and database/seeds/001_permissions.sql's
 * `user_management:approve` row.
 */
export class UpdateBoundaryScopeDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  admin_boundary_scope!: string[];
}
