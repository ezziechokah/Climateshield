# Prompt 03 — User/Role Module (Users, Organizations)

## Objective

Implement the `user-role/` module co-located within `backend/auth-service/` (per [`docs/backend/00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap`](../00_Backend_Architecture_Overview.md#co-located-services-resolving-a-phase-3-gap)): user CRUD, role/permission catalog, and organization/department hierarchy. Read [`docs/backend/02_Identity_and_Access_Service_Architecture.md#users-module`](../02_Identity_and_Access_Service_Architecture.md#users-module) and [`#organizations-module`](../02_Identity_and_Access_Service_Architecture.md#organizations-module) before starting. Assumes [`02_auth_service.md`](02_auth_service.md) is already implemented (depends on its `tokens`/`sessions` modules for auth context).

## Requirements

- User CRUD (`/v1/users`) with soft-delete-only deactivation, `admin_boundary_scope` management as a distinct, higher-permission sub-resource.
- Role CRUD (`/v1/roles`), permission catalog (read-only, `/v1/permissions`), role-permission assignment.
- Agency/organization/department hierarchy CRUD with cycle detection on `parent_organization_id` reassignment.
- Publish `user.role_changed` on any role assignment change (coordinating with the `tokens` module in `auth-service` so token issuance reflects the change on next login/refresh).

## Folder

```
backend/auth-service/src/modules/user-role/
```

## Files

```
backend/auth-service/src/modules/user-role/
├── user-role.module.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   ├── dto/{create-user,update-user,update-boundary-scope}.dto.ts
│   ├── entities/user.entity.ts
│   └── users.service.spec.ts
├── roles/
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   ├── dto/{create-role,update-role-permissions}.dto.ts
│   ├── entities/role.entity.ts
│   └── roles.service.spec.ts
├── permissions/
│   ├── permissions.controller.ts        # Read-only catalog endpoint
│   └── permissions.service.ts
└── organizations/
    ├── organizations.controller.ts
    ├── organizations.service.ts           # Includes cycle-detection logic
    ├── entities/{agency,organization,department}.entity.ts
    └── organizations.service.spec.ts
```

## Acceptance Criteria

- `DELETE /v1/users/{id}` sets `deleted_at`; the row and all FK relationships remain intact; the user cannot authenticate afterward.
- Assigning `admin_boundary_scope` requires `user.manage_scope` permission distinct from basic `user.manage`, and is `Full audit_log coverage` tier.
- Reassigning an organization's `parent_organization_id` to a value that would create a cycle is rejected with a `422` and a clear error message, never silently accepted.
- `/v1/permissions` returns the exact seeded catalog from [`database/seeds/001_permissions.sql`](../../../database/seeds/001_permissions.sql) — no permission is creatable via this API (it's a read-only catalog).
- A role's permission set change publishes `user.role_changed` for every user holding that role.

## Constraints

- No hard-delete endpoint exists anywhere in this module, per [`BR-08`](../../02_Business_Requirements.md#business-rules).
- `identity.agency` rows are not creatable via public API — agency provisioning is a platform bootstrap operation, per [`docs/06_System_Architecture.md#multi-tenancy--modularity`](../../06_System_Architecture.md#multi-tenancy--modularity).
- No direct schema access outside `identity.*`.

## Dependencies

- `02_auth_service.md`'s `tokens`/`sessions` modules (same service, same schema).
- Kafka (`user.role_changed` producer).
- `@climateshield/rbac-guard` (self-referential — this module's own permission checks use the same shared guard every other service uses).

## Testing Requirements

- Unit tests for cycle-detection logic (direct cycle, indirect multi-level cycle, self-parent).
- Integration tests: soft-delete behavior, boundary-scope permission gating, role-change event publication.
- Coverage target: 90% (Identity & Access is foundational to every other service's authorization).

## Definition of Done

- All Acceptance Criteria verified by automated tests.
- OpenAPI spec matches [`docs/12_API_Specification.md#users--roles`](../../12_API_Specification.md#users--roles) with zero diffs.
- Passes [`QUALITY_GATES.md`](../../../QUALITY_GATES.md) and the code review checklist in [`docs/17_Coding_Standards.md#code-review-checklist`](../../17_Coding_Standards.md#code-review-checklist).
