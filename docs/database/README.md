# Database Design Artifacts

## Purpose

Complete data-architecture governance layer — normalization review, schema diagrams, ORM specifications, performance strategy, and data governance — sitting alongside the core [`docs/09_Database_Dictionary.md`](../09_Database_Dictionary.md)/[`docs/07_ERD.md`](../07_ERD.md) and the Phase 4 entity specifications in [`docs/models/`](../models/). The actual SQL implementation lives in [`database/`](../../database/) at the repository root.

> Version: 2.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Contents

| Document | Covers |
|---|---|
| [`01_Normalization_Review.md`](01_Normalization_Review.md) | 1NF/2NF/3NF/BCNF verification + every deliberate denormalization decision, justified |
| [`02_Performance_Strategy.md`](02_Performance_Strategy.md) | Index plan, caching strategy, partition strategy, materialized views, read replicas, scaling |
| [`03_Data_Governance.md`](03_Data_Governance.md) | Data classification, retention, personal-data inventory, Kenya DPA/GDPR/government compliance, audit coverage |
| [`04_Schema_Diagrams.md`](04_Schema_Diagrams.md) | ER diagrams for every Phase 4-introduced entity group |
| [`05_ORM_Model_Specifications.md`](05_ORM_Model_Specifications.md) | Prisma/SQLAlchemy modeling conventions + representative fully-worked models |

## References

- [`docs/07_ERD.md`](../07_ERD.md), [`docs/diagrams/06_Complete_ERD.md`](../diagrams/06_Complete_ERD.md)
- [`docs/09_Database_Dictionary.md`](../09_Database_Dictionary.md)
- [`docs/models/`](../models/), [`docs/validation/`](../validation/), [`docs/migrations/`](../migrations/)
- [`database/`](../../database/) (repository root — SQL schema/migrations/seeds)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 2.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Added normalization review, performance strategy, data governance, schema diagrams, and ORM specifications (Phase 4 data layer) |
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version |
