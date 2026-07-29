import { ForbiddenError } from '@climateshield/http-errors';
import { PermissionGuard, REQUIRE_PERMISSION_METADATA_KEY, type AccessTokenClaims } from '@climateshield/rbac-guard';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UsersController } from './users.controller';

/**
 * Pins the acceptance criterion "Assigning admin_boundary_scope requires
 * user_management:approve, distinct from plain user_management:edit" at
 * the actual enforcement point — the real `@climateshield/rbac-guard`
 * `PermissionGuard` reading the real `@RequirePermission` metadata off
 * `UsersController`, not a re-implementation of guard logic.
 */
function buildClaims(permissions: string[]): AccessTokenClaims {
  return {
    sub: 'user-1',
    iss: 'issuer',
    aud: 'audience',
    exp: Math.floor(Date.now() / 1000) + 900,
    iat: Math.floor(Date.now() / 1000),
    role: 'kmd_admin',
    permissions,
    agency_id: 'agency-1',
  };
}

// `never[]` rather than `unknown[]`: parameter types are contravariant, so a handler
// taking concrete args is assignable here, whereas `unknown[]` rejects every real
// controller method. The handler is only ever used as an opaque reference for
// getHandler() — it is never invoked — so its parameter types are irrelevant.
function buildContext(handler: (...args: never[]) => unknown, _claims: AccessTokenClaims): ExecutionContext {
  const request: { headers: Record<string, string>; user?: AccessTokenClaims } = {
    headers: { authorization: 'Bearer fake-token-value' },
  };
  return {
    getHandler: () => handler,
    getClass: () => UsersController,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function buildGuard(claims: AccessTokenClaims): PermissionGuard {
  const jwtVerifier = { verify: jest.fn(async () => claims) };
  const revocationChecker = { isRevoked: jest.fn(async () => false) };
   
  return new PermissionGuard(new Reflector(), jwtVerifier as any, revocationChecker as any);
}

describe('UsersController RBAC wiring (admin_boundary_scope permission distinction)', () => {
  it('declares different required permissions for update() and updateBoundaryScope()', () => {
    const updatePermissions = Reflect.getMetadata(REQUIRE_PERMISSION_METADATA_KEY, UsersController.prototype.update);
    const scopePermissions = Reflect.getMetadata(
      REQUIRE_PERMISSION_METADATA_KEY,
      UsersController.prototype.updateBoundaryScope,
    );

    expect(updatePermissions).toEqual(['user_management:edit']);
    expect(scopePermissions).toEqual(['user_management:approve']);
    expect(scopePermissions).not.toEqual(updatePermissions);
  });

  it('denies boundary-scope access (403) to a caller holding only user_management:edit', async () => {
    const claims = buildClaims(['user_management:edit']);
    const guard = buildGuard(claims);
    const context = buildContext(UsersController.prototype.updateBoundaryScope, claims);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows boundary-scope access to a caller holding user_management:approve', async () => {
    const claims = buildClaims(['user_management:approve']);
    const guard = buildGuard(claims);
    const context = buildContext(UsersController.prototype.updateBoundaryScope, claims);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('user_management:approve alone does NOT grant access to the plain update() route (permissions are not hierarchical by accident)', async () => {
    const claims = buildClaims(['user_management:approve']);
    const guard = buildGuard(claims);
    const context = buildContext(UsersController.prototype.update, claims);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenError);
  });
});
