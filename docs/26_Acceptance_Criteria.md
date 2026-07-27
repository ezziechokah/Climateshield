# 26 — Acceptance Criteria

## Purpose

Provides Gherkin-style (Given/When/Then) acceptance criteria for representative high-priority stories, and maintains the requirement-to-test traceability matrix binding [`docs/03_Software_Requirements_Specification.md`](03_Software_Requirements_Specification.md) → [`docs/10_User_Stories.md`](10_User_Stories.md) → test cases.

> Version: 1.0 | Author: ClimateShield Nexus QA Engineering | Last Updated: 2026-07-27

## Table of Contents

1. [Format](#format)
2. [Authentication & Access](#authentication--access)
3. [Risk Assessment](#risk-assessment)
4. [Alerts](#alerts)
5. [GIS](#gis)
6. [AI Assistant](#ai-assistant)
7. [Reporting](#reporting)
8. [Traceability Matrix](#traceability-matrix)
9. [References](#references)
10. [Revision History](#revision-history)

## Format

```gherkin
Feature: <name>
  Scenario: <scenario>
    Given <precondition>
    When <action>
    Then <expected result>
```

## Authentication & Access

```gherkin
Feature: MFA Enforcement (US-AUTH-01)
  Scenario: Meteorologist logs in with correct password but no MFA yet configured
    Given a user with role "Meteorologist" and valid credentials
    When they submit a successful password login
    Then the system shall require MFA enrollment before granting a session

  Scenario: Account lockout after repeated failures
    Given a user has failed login 4 times in the last 15 minutes
    When they submit a 5th incorrect password
    Then the account shall be locked for 15 minutes
    And an audit log entry shall be recorded
```

## Risk Assessment

```gherkin
Feature: Automatic Flood Risk Recompute (US-RISK-01)
  Scenario: New qualifying rainfall observation ingested
    Given a validated rainfall observation is ingested for a county with an active flood risk model
    When the observation exceeds the model's recompute trigger condition
    Then a new flood risk_assessment record shall be created within 2 minutes
    And it shall reference the contributing observation(s)
    And the previous assessment for that boundary/hazard shall transition to "Superseded"

  Scenario: Risk assessment includes confidence and severity
    Given a completed risk_assessment record
    Then it shall include a severity value from {low, moderate, high, severe, extreme}
    And a confidence_score between 0 and 1
```

## Alerts

```gherkin
Feature: Alert Approval Workflow (US-ALT-01)
  Scenario: High-severity alert requires officer approval before dispatch
    Given a risk_assessment with severity "High" or above has been computed
    When the Alerting Service drafts a CAP alert
    Then the alert status shall be "PendingApproval"
    And no dispatch shall occur until a Disaster Management Officer approves it

  Scenario: Approved alert dispatches on all channels in parallel
    Given a PendingApproval alert is approved by an authorized officer
    When the approval is submitted
    Then the system shall initiate SMS, email, push, and webhook dispatch concurrently
    And each channel's delivery status shall be tracked independently
    And total time from approval to first successful delivery shall be under 5 minutes
```

## GIS

```gherkin
Feature: Spatial Point Query (US-GIS-02)
  Scenario: User queries flood risk at a map point
    Given the GIS Dashboard is loaded with the flood hazard layer active
    When a user clicks a point within a county boundary
    Then the system shall return the current flood risk_assessment for that boundary within 1.5 seconds (p95)
    And display severity, confidence, and last-updated timestamp
```

## AI Assistant

```gherkin
Feature: Human Review Gate on High-Stakes AI Output (US-AI-02)
  Scenario: AI Assistant asked about evacuation guidance
    Given a user asks a question classified as "high-stakes" (e.g., evacuation, casualty estimate)
    When the AI Assistant generates a response
    Then the response shall be flagged "Human review required"
    And the response shall not be distributed externally (e.g., via API webhook) until reviewed

  Scenario: AI Assistant response always cites sources
    Given any AI Assistant response referencing platform data
    Then the response shall include at least one explicit data source citation with a time range
```

## Reporting

```gherkin
Feature: Automated Daily Bulletin (US-RPT-01)
  Scenario: Scheduled bulletin generation
    Given a report_template configured for daily cadence
    When the scheduled trigger fires
    Then a report_instance shall be generated within 10 seconds
    And it shall be emailed to the configured recipient list
    And it shall display the data sources and model versions used
```

## Traceability Matrix

| Requirement (SRS ID) | User Story | Acceptance Criteria | Test Case Ref |
|---|---|---|---|
| SRS-AUTH-003 | US-AUTH-01 | MFA Enforcement scenarios above | `tests/auth/mfa.spec` |
| SRS-AUTH-005 | US-AUTH-01 | Account lockout scenario | `tests/auth/lockout.spec` |
| SRS-RISK-001, SRS-RISK-008 | US-RISK-01 | Automatic Flood Risk Recompute | `tests/risk/flood-recompute.spec` |
| SRS-RISK-007 | US-RISK-01 | Confidence/severity inclusion | `tests/risk/risk-schema.spec` |
| SRS-ALT-004 | US-ALT-01 | Alert Approval Workflow | `tests/alerts/approval.spec` |
| SRS-ALT-003, NFR-PERF-005 | US-ALT-01 | Parallel multi-channel dispatch | `tests/alerts/dispatch.spec` |
| SRS-GIS-005, NFR-PERF-003 | US-GIS-02 | Spatial Point Query | `tests/gis/point-query.spec` |
| SRS-AI-005 | US-AI-02 | Human Review Gate | `tests/ai/review-gate.spec` |
| SRS-AI-002 | US-AI-01 | Citation requirement | `tests/ai/citations.spec` |
| SRS-RPT-001, NFR-PERF-006 | US-RPT-01 | Automated Daily Bulletin | `tests/reports/scheduled-bulletin.spec` |

Full matrix expands as implementation proceeds; every merged PR touching a Must-have requirement must add/update the corresponding row.

## References

- [`docs/03_Software_Requirements_Specification.md`](03_Software_Requirements_Specification.md)
- [`docs/04_Functional_Requirements.md`](04_Functional_Requirements.md)
- [`docs/10_User_Stories.md`](10_User_Stories.md)
- [`docs/14_Testing_Strategy.md`](14_Testing_Strategy.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus QA Engineering | Initial version |
