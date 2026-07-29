import { PermissionGuard } from './permission.guard';
import { RbacGuardModule } from './rbac-guard.module';
import { JWT_VERIFIER, RBAC_GUARD_MODULE_OPTIONS, SESSION_REVOCATION_CHECKER } from './rbac-guard.tokens';

describe('RbacGuardModule', () => {
  it('forRoot wires the options, JwtVerifier, SessionRevocationChecker, and PermissionGuard as global providers', () => {
    const fakeRedis = { get: jest.fn(), set: jest.fn() };
    const dynamicModule = RbacGuardModule.forRoot({
      jwksUri: 'https://auth.example/.well-known/jwks.json',
      issuer: 'https://auth.example',
      audience: 'api',
      redisClient: fakeRedis,
    });

    expect(dynamicModule.module).toBe(RbacGuardModule);
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.exports).toEqual(expect.arrayContaining([JWT_VERIFIER, SESSION_REVOCATION_CHECKER, PermissionGuard]));

    const providerTokens = (dynamicModule.providers ?? []).map((p) => (typeof p === 'object' && 'provide' in p ? p.provide : p));
    expect(providerTokens).toEqual(
      expect.arrayContaining([RBAC_GUARD_MODULE_OPTIONS, JWT_VERIFIER, SESSION_REVOCATION_CHECKER, PermissionGuard]),
    );
  });

  it('forRootAsync wires an options factory instead of a static value', () => {
    const useFactory = jest.fn().mockReturnValue({
      jwksUri: 'https://auth.example/.well-known/jwks.json',
      issuer: 'https://auth.example',
      audience: 'api',
      redisClient: { get: jest.fn(), set: jest.fn() },
    });

    const dynamicModule = RbacGuardModule.forRootAsync({ useFactory, inject: [] });

    expect(dynamicModule.global).toBe(true);
    const optionsProvider = (dynamicModule.providers ?? []).find(
      (p) => typeof p === 'object' && 'provide' in p && p.provide === RBAC_GUARD_MODULE_OPTIONS,
    );
    expect(optionsProvider).toBeDefined();
     
    expect((optionsProvider as any).useFactory).toBe(useFactory);
  });
});
