/**
 * Test data factory for the RiskAssessment entity
 * (docs/09_Database_Dictionary.md#risk_assessment, shared/schemas/risk-assessment.schema.json).
 * Defaults to a valid, mid-severity flood assessment; override any field
 * per test. No scoring logic lives here — this only builds fixture data.
 */
import { randomUUID } from "crypto";

export type HazardType =
  | "flood"
  | "drought"
  | "heatwave"
  | "agriculture"
  | "infrastructure"
  | "population_exposure";
export type Severity = "low" | "moderate" | "high" | "severe" | "extreme";

export interface TestRiskAssessment {
  id: string;
  risk_model_id: string;
  admin_boundary_id: string;
  risk_type: HazardType;
  severity: Severity;
  confidence_score: number;
  assessed_at: string;
  valid_until: string;
  contributing_sources: Array<{ source_type: string; source_ref_id: string }>;
}

export function buildRiskAssessment(
  overrides: Partial<TestRiskAssessment> = {},
): TestRiskAssessment {
  const assessedAt = new Date();
  const validUntil = new Date(assessedAt.getTime() + 12 * 60 * 60 * 1000);

  return {
    id: randomUUID(),
    risk_model_id: randomUUID(),
    admin_boundary_id: "20000000-0000-4000-8000-000000000003", // Kilifi County, see mock-data/counties.json
    risk_type: "flood",
    severity: "moderate",
    confidence_score: 0.75,
    assessed_at: assessedAt.toISOString(),
    valid_until: validUntil.toISOString(),
    contributing_sources: [{ source_type: "observation", source_ref_id: randomUUID() }],
    ...overrides,
  };
}

/** Convenience builder for testing the alert-generation threshold boundary. */
export function buildHighSeverityRiskAssessment(
  overrides: Partial<TestRiskAssessment> = {},
): TestRiskAssessment {
  return buildRiskAssessment({ severity: "high", confidence_score: 0.9, ...overrides });
}
