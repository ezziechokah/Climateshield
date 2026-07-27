/**
 * Test data factory for the Alert entity (docs/09_Database_Dictionary.md#alert,
 * shared/schemas/alert.schema.json). No dispatch/approval logic here — this
 * only builds fixture data for tests exercising that logic elsewhere.
 */
import { randomUUID } from "crypto";

export type AlertStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "issued"
  | "expired"
  | "cancelled";

export interface TestAlert {
  id: string;
  cap_identifier: string;
  hazard_type: string;
  severity: string;
  status: AlertStatus;
  admin_boundary_id: string;
  approved_by: string | null;
  headline: string;
  expires_at: string;
}

let sequence = 0;

export function buildAlert(overrides: Partial<TestAlert> = {}): TestAlert {
  sequence += 1;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    id: randomUUID(),
    cap_identifier: `urn:oid:2.49.0.1.test.${sequence}`,
    hazard_type: "flood",
    severity: "high",
    status: "pending_approval",
    admin_boundary_id: "20000000-0000-4000-8000-000000000003",
    approved_by: null,
    headline: `Test Alert ${sequence}`,
    expires_at: expiresAt.toISOString(),
    ...overrides,
  };
}

export function buildApprovedAlert(overrides: Partial<TestAlert> = {}): TestAlert {
  return buildAlert({
    status: "issued",
    approved_by: "10000000-0000-4000-8000-000000000006", // disaster mgmt officer, see mock-data/users.json
    ...overrides,
  });
}
