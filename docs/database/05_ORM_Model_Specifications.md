# ORM Model Specifications

## Purpose

Defines the ORM modeling convention and tooling strategy for translating [`database/schema/`](../../database/schema/) into type-safe application code, with fully-worked representative models per domain demonstrating every convention a developer needs to model the remaining entities identically. This document specifies contracts (schema shape), not application/business logic.

> Version: 1.0 | Author: ClimateShield Nexus Database Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Tooling Decision](#tooling-decision)
2. [Generation Strategy — Why Not Hand-Write All 73 Models](#generation-strategy--why-not-hand-write-all-73-models)
3. [Naming Conventions](#naming-conventions)
4. [Representative Model: Identity Domain](#representative-model-identity-domain)
5. [Representative Model: Climate Data Domain (Hypertable)](#representative-model-climate-data-domain-hypertable)
6. [Representative Model: GIS Domain (PostGIS)](#representative-model-gis-domain-postgis)
7. [Representative Model: Risk Domain (Enum + Typed Extension)](#representative-model-risk-domain-enum--typed-extension)
8. [Representative Model: Operations Domain (Append-Only)](#representative-model-operations-domain-append-only)
9. [Python (SQLAlchemy) Equivalent](#python-sqlalchemy-equivalent)
10. [References](#references)
11. [Revision History](#revision-history)

## Tooling Decision

**Prisma** for every Node/NestJS service (`backend/*`) — chosen over TypeORM for its explicit, declarative schema file (`schema.prisma`) that reads as documentation in its own right, matching this project's documentation-first philosophy, and its first-class PostGIS support via the `postgresqlExtensions` preview feature. **SQLAlchemy 2.0 (declarative)** for the Python services (`ai-engine/`, `gis-services/`, `climate-processing/`) using `GeoAlchemy2` for spatial columns.

## Generation Strategy — Why Not Hand-Write All 73 Models

The 73 entities in [`docs/models/`](../models/) are already fully specified as executable SQL DDL in [`database/schema/`](../../database/schema/) — that SQL is the single source of truth. Rather than hand-transcribing all 73 tables into Prisma/SQLAlchemy syntax (introducing transcription-error risk and a second place every future column change must be kept in sync), each service:

1. Runs `prisma db pull` (Node) or `sqlacodegen` (Python) against the already-migrated database to **generate** its ORM model file from the real schema.
2. Hand-edits ONLY the generated relation names/directions where the tool's default inference disagrees with the domain vocabulary in [`docs/models/`](../models/) (e.g., renaming a generated `risk_assessment_risk_model_idTorisk_model` relation to `riskModel`).
3. Commits the generated-then-adjusted file — it is deterministic-from-the-database, not hand-maintained truth.

This document's job is to specify the **conventions** that generation step must produce, verified against representative examples below, so a developer reviewing a generated model knows what "correct" looks like.

## Naming Conventions

| SQL | Prisma | SQLAlchemy |
|---|---|---|
| `snake_case` table/column names | `PascalCase` model name, `camelCase` field name (Prisma `@map`/`@@map` directives preserve the underlying snake_case column) | `PascalCase` class name, `snake_case` attribute name (matches Python convention, no mapping needed) |
| `identity."user"` (schema-qualified, reserved word) | `model User { @@map("user") @@schema("identity") }` | `__tablename__ = "user"`, `__table_args__ = {"schema": "identity"}` |
| ENUM types (`risk.hazard_type`) | Prisma `enum HazardType { flood drought ... }` mapped via `@@schema` | Python `enum.Enum` + SQLAlchemy `Enum` type referencing the same PostgreSQL enum name |
| `JSONB` columns | `Json` type | `JSONB` from `sqlalchemy.dialects.postgresql` |
| `GEOMETRY(Point, 4326)` | `Unsupported("geometry(Point, 4326)")` (Prisma has no native PostGIS type; raw queries or a thin wrapper handle spatial operations) | `Geometry("POINT", srid=4326)` via GeoAlchemy2 |

## Representative Model: Identity Domain

```prisma
// schema.prisma excerpt — generated from database/schema/002_identity.sql,
// relation names adjusted to match docs/models/01_Identity_and_Organization_Entities.md
model User {
  id                 String    @id @default(uuid())
  agencyId           String    @map("agency_id")
  departmentId       String?   @map("department_id")
  email              String
  passwordHash       String?   @map("password_hash")
  fullName           String    @map("full_name")
  roleId             String    @map("role_id")
  status             UserStatus @default(invited)
  preferredLanguage  String    @default("en") @map("preferred_language")
  mfaEnabled         Boolean   @default(false) @map("mfa_enabled")
  failedLoginCount   Int       @default(0) @map("failed_login_count")
  lockedUntil        DateTime? @map("locked_until")
  lastLoginAt        DateTime? @map("last_login_at")
  deletedAt          DateTime? @map("deleted_at")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  agency             Agency    @relation(fields: [agencyId], references: [id])
  department         Department? @relation(fields: [departmentId], references: [id])
  role               Role      @relation(fields: [roleId], references: [id])
  sessions           UserSession[]
  apiKeysCreated     ApiKey[]

  @@unique([agencyId, email])
  @@map("user")
  @@schema("identity")
}

enum UserStatus {
  active
  suspended
  deactivated
  invited

  @@schema("identity")
}
```

## Representative Model: Climate Data Domain (Hypertable)

```prisma
// TimescaleDB hypertables map to Prisma as a normal model — Prisma has no
// native hypertable concept, so the composite PK and hypertable conversion
// (create_hypertable, compression policy) remain in database/schema/005_climate_data.sql
// and are NOT re-expressed here; Prisma only needs to know the table shape.
model Observation {
  id               String    @default(uuid())
  stationId        String?   @map("station_id")
  dataSourceId     String    @map("data_source_id")
  parameter        String
  value            Decimal   @db.Decimal(12, 4)
  unit             String
  observedAt       DateTime  @map("observed_at")
  version          Int       @default(1)
  isCorrected      Boolean   @default(false) @map("is_corrected")
  correctionReason String?   @map("correction_reason")
  supersededBy     String?   @map("superseded_by")
  createdAt        DateTime  @default(now()) @map("created_at")

  station          Station?  @relation(fields: [stationId], references: [id])
  dataSource       DataSource @relation(fields: [dataSourceId], references: [id])

  @@id([id, observedAt])
  @@map("observation")
  @@schema("climate")
}
```

## Representative Model: GIS Domain (PostGIS)

```prisma
// Prisma cannot natively type PostGIS geometry columns — modeled as
// Unsupported(), meaning reads/writes to `boundary` go through raw SQL
// (Prisma.$queryRaw) in the GIS Service, never through Prisma's generated
// client methods for this one field.
model AdminBoundary {
  id            String    @id @default(uuid())
  agencyId      String?   @map("agency_id")
  name          String
  code          String?
  level         String
  parentId      String?   @map("parent_id")
  boundary      Unsupported("geometry(MultiPolygon, 4326)")
  isActive      Boolean   @default(true) @map("is_active")
  effectiveFrom DateTime  @default(now()) @map("effective_from") @db.Date
  effectiveTo   DateTime? @map("effective_to") @db.Date
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  parent        AdminBoundary?  @relation("BoundaryHierarchy", fields: [parentId], references: [id])
  children      AdminBoundary[] @relation("BoundaryHierarchy")

  @@unique([agencyId, level, code])
  @@map("admin_boundary")
  @@schema("spatial")
}
```

Python/GeoAlchemy2 handles this natively instead (see [Python (SQLAlchemy) Equivalent](#python-sqlalchemy-equivalent)) — the GIS Service (Python/FastAPI) is the primary owner of spatial queries, so it uses the ORM with full geometry-type support rather than raw SQL escape hatches.

## Representative Model: Risk Domain (Enum + Typed Extension)

```prisma
model RiskAssessment {
  id                 String       @id @default(uuid())
  riskModelId        String       @map("risk_model_id")
  adminBoundaryId    String       @map("admin_boundary_id")
  riskType           HazardType   @map("risk_type")
  severity           SeverityLevel
  confidenceScore    Decimal      @db.Decimal(4, 3) @map("confidence_score")
  assessedAt         DateTime     @default(now()) @map("assessed_at")
  validUntil         DateTime     @map("valid_until")
  supersededBy       String?      @map("superseded_by")

  riskModel          RiskModel      @relation(fields: [riskModelId], references: [id])
  adminBoundary      AdminBoundary  @relation(fields: [adminBoundaryId], references: [id])
  contributingSources RiskContributingSource[]
  exposureAnalyses    ExposureAnalysis[]

  @@map("risk_assessment")
  @@schema("risk")
}

// 1:1 typed extension pattern — every hazard-specific parameter table
// follows this shape (FloodModelParameters, DroughtModelParameters,
// HeatwaveModelParameters all identical in structure, differing only in
// field names/counts per docs/models/05_Risk_and_Hazard_Entities.md).
model FloodModelParameters {
  riskModelId              String  @id @map("risk_model_id")
  rainfallModerateMm       Decimal @db.Decimal(6, 1) @map("rainfall_moderate_mm")
  rainfallHighMm           Decimal @db.Decimal(6, 1) @map("rainfall_high_mm")
  rainfallSevereMm         Decimal @db.Decimal(6, 1) @map("rainfall_severe_mm")
  rainfallExtremeMm        Decimal @db.Decimal(6, 1) @map("rainfall_extreme_mm")
  accumulationWindowHours  Int     @default(72) @map("accumulation_window_hours")

  riskModel                RiskModel @relation(fields: [riskModelId], references: [id])

  @@map("flood_model_parameters")
  @@schema("risk")
}
```

## Representative Model: Operations Domain (Append-Only)

```prisma
// The append-only guarantee (no UPDATE/DELETE) is enforced by a database
// trigger (ops.deny_mutation) — Prisma has no first-class "immutable model"
// concept, so this is a comment-documented convention: the AuditLog model's
// generated client MUST only ever be called with `.create()`, never
// `.update()`/`.delete()`/`.upsert()` — a lint rule or code-review checklist
// item enforces this at the application layer, backstopped by the DB trigger.
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?  @map("user_id")
  action      String
  entityType  String   @map("entity_type")
  entityId    String?  @map("entity_id")
  beforeState Json?    @map("before_state")
  afterState  Json?    @map("after_state")
  prevHash    String   @map("prev_hash")
  recordHash  String   @map("record_hash")
  occurredAt  DateTime @default(now()) @map("occurred_at")

  user        User?    @relation(fields: [userId], references: [id])

  @@map("audit_log")
  @@schema("ops")
}
```

## Python (SQLAlchemy) Equivalent

```python
# Representative SQLAlchemy 2.0 declarative model for the GIS Service —
# full native PostGIS support via GeoAlchemy2, unlike the Prisma Unsupported()
# escape hatch above.
from geoalchemy2 import Geometry
from sqlalchemy import String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date, datetime
import uuid

class AdminBoundary(Base):
    __tablename__ = "admin_boundary"
    __table_args__ = {"schema": "spatial"}

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    agency_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("identity.agency.id"))
    name: Mapped[str] = mapped_column(String(150))
    code: Mapped[str | None] = mapped_column(String(20))
    level: Mapped[str] = mapped_column(String(30))
    parent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("spatial.admin_boundary.id"))
    boundary: Mapped[str] = mapped_column(Geometry("MULTIPOLYGON", srid=4326))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    effective_from: Mapped[date] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    parent: Mapped["AdminBoundary | None"] = relationship(remote_side=[id])
```

## References

- [`database/schema/`](../../database/schema/)
- [`docs/models/`](../models/)
- [`docs/17_Coding_Standards.md`](../17_Coding_Standards.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Database Architecture Team | Initial version (Phase 4 data layer) |
