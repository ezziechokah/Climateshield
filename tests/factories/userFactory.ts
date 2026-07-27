/**
 * Test data factory for the User entity (docs/09_Database_Dictionary.md#user).
 * Produces valid-by-default objects that individual tests override via the
 * `overrides` param — the standard factory pattern so tests only specify
 * the fields relevant to what they're checking. No business logic: this
 * file has no awareness of RBAC rules, validation, or any service behavior.
 */
import { randomUUID } from "crypto";

export type UserStatus = "active" | "suspended" | "deactivated";

export interface TestUser {
  id: string;
  agency_id: string;
  email: string;
  full_name: string;
  role_id: string;
  status: UserStatus;
  preferred_language: string;
  mfa_enabled: boolean;
}

let sequence = 0;

export function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  sequence += 1;
  return {
    id: randomUUID(),
    agency_id: "00000000-0000-4000-8000-000000000000",
    email: `test.user.${sequence}@example.test`,
    full_name: `Test User ${sequence}`,
    role_id: "00000000-0000-4000-8000-000000000003", // meteorologist, see mock-data/roles.json
    status: "active",
    preferred_language: "en",
    mfa_enabled: false,
    ...overrides,
  };
}

export function buildUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
  return Array.from({ length: count }, () => buildUser(overrides));
}
