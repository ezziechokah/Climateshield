# Templates

## Purpose

Reusable document templates ensuring consistency across ADRs, issue reports, planning artifacts, and meeting notes. Referenced from [CONTRIBUTING.md](../../CONTRIBUTING.md) and [`docs/32_Project_Development_Plan.md`](../32_Project_Development_Plan.md).

> Version: 2.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Contents

| Template | Use |
|---|---|
| [adr_template.md](adr_template.md) | New Architecture Decision Record |
| [bug_report_template.md](bug_report_template.md) | Bug report issue (structured GitHub twin: [`.github/ISSUE_TEMPLATE/bug_report.yml`](../../.github/ISSUE_TEMPLATE/bug_report.yml)) |
| [feature_request_template.md](feature_request_template.md) | New feature/enhancement proposal (structured GitHub twin: [`.github/ISSUE_TEMPLATE/feature_request.yml`](../../.github/ISSUE_TEMPLATE/feature_request.yml)) |
| [epic_template.md](epic_template.md) | New epic (structured GitHub twin: [`.github/ISSUE_TEMPLATE/epic.yml`](../../.github/ISSUE_TEMPLATE/epic.yml)) |
| [sprint_template.md](sprint_template.md) | Sprint planning/review/retrospective record |
| [task_template.md](task_template.md) | Individual implementation task under a story/epic |
| [risk_log_template.md](risk_log_template.md) | Proposing a new entry for [`docs/18_Risk_Assessment.md#risk-register`](../18_Risk_Assessment.md#risk-register) |
| [release_notes_template.md](release_notes_template.md) | Release notes, used by [`.github/workflows/release.yml`](../../.github/workflows/release.yml) |
| [meeting_notes_template.md](meeting_notes_template.md) | Meeting notes, archived under [`docs/meetings/`](../meetings/) |

Pull request template lives at [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md) (GitHub convention requires it outside `docs/`). GitHub issue forms live at [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE/) — the `.md` templates above are their reusable, GitHub-independent equivalents (e.g., for use in Jira or a design doc).

## References

- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [`docs/architecture/README.md`](../architecture/README.md)
- [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE/)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 2.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Added epic, sprint, task, risk log, and release notes templates + GitHub issue forms (bootstrap phase) |
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
