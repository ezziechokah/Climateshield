# Security Diagrams

## Purpose

Visualizes the security mechanisms defined narratively in [`docs/13_Security_Design.md`](../13_Security_Design.md): authentication, authorization/RBAC, encryption, token lifecycle, API security, audit integrity, backup, and disaster recovery.

> Version: 1.0 | Author: ClimateShield Nexus Security Engineering | Last Updated: 2026-07-27

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Authorization Flow](#authorization-flow)
3. [RBAC Model](#rbac-model)
4. [Encryption Flow](#encryption-flow)
5. [Token Lifecycle](#token-lifecycle)
6. [API Security Flow](#api-security-flow)
7. [Audit Flow](#audit-flow)
8. [Backup Flow](#backup-flow)
9. [Disaster Recovery Flow](#disaster-recovery-flow)
10. [References](#references)
11. [Revision History](#revision-history)

## Authentication Flow

```mermaid
flowchart TD
    A[Credentials Submitted] --> B{Valid?}
    B -- No --> C[Increment failure counter] --> D{5 failures / 15 min?}
    D -- Yes --> E[Lock account 15 min]
    D -- No --> F[Generic error]
    B -- Yes --> G{MFA Enrolled?}
    G -- Yes --> H[TOTP/SMS Challenge] --> I{Valid Code?}
    I -- No --> H
    I -- Yes --> J[Issue Tokens]
    G -- No --> J
    J --> K[Create user_session record]
    K --> L[Log auth.login_succeeded to Audit]
```

Full sequence: [`docs/22_Sequence_Diagrams.md#sequence-1-user-authentication-with-mfa`](../22_Sequence_Diagrams.md#sequence-1-user-authentication-with-mfa).

## Authorization Flow

```mermaid
flowchart TD
    A[Incoming API Request + Bearer Token] --> B[Verify JWT Signature + Expiry]
    B -->|invalid/expired| C[401 Unauthorized]
    B -->|valid| D[Resolve user role + permissions]
    D --> E{Permission Grant Exists for module+action+scope?}
    E -- No --> F[403 Forbidden + Log authz.access_denied]
    E -- Yes --> G{Scope Matches Requested Boundary?}
    G -- No --> F
    G -- Yes --> H[Request Proceeds to Service Logic]
```

Re-evaluated on **every** request — no client-trusted permission cache ([`SRS-AUTHZ-005`](../04_Functional_Requirements.md#authorization)).

## RBAC Model

```mermaid
flowchart TB
    AGENCY[Agency] -->|scopes| ROLE[Role]
    ROLE -->|composed of| PERM[Permission = Module + Action]
    ROLE -->|assigned to| USER[User]
    USER -->|inherits| PERM
    PERM -->|optionally scoped by| BOUNDARY[Admin Boundary]

    subgraph "14 Seed Roles"
        R1[Super Administrator]
        R2[KMD Administrator]
        R3[Meteorologist]
        R4[Climate Scientist]
        R5[GIS Analyst]
        R6[Disaster Mgmt Officer]
        R7[Government Planner]
        R8[Agriculture Officer]
        R9[Aviation Officer]
        R10[Water Resources Officer]
        R11[Health Sector Officer]
        R12[NGO]
        R13[Researcher]
        R14[Public User]
    end
```

Full permission grid: [`docs/13_Security_Design.md#rbac-matrix`](../13_Security_Design.md#rbac-matrix).

## Encryption Flow

```mermaid
flowchart LR
    subgraph "In Transit"
        CLIENT[Client] -->|TLS 1.2+| GW[API Gateway]
        GW -->|mTLS| SVC[Internal Services]
        SVC -->|mTLS| DB[(Database)]
    end
    subgraph "At Rest"
        DB -->|AES-256, cloud KMS or LUKS| DISK[(Encrypted Volume)]
        OBJ[Object Storage] -->|AES-256, server-side encryption| OBJDISK[(Encrypted Bucket)]
    end
    subgraph "Secrets"
        SVC -->|fetch at runtime| VAULT[Vault / Cloud Secrets Manager]
        VAULT -->|never written to source control| SVC
    end
```

## Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Issued: Login success
    Issued --> Active: Used within TTL (15 min access token)
    Active --> Refreshed: Refresh token exchanged before expiry
    Refreshed --> Active
    Active --> Expired: TTL elapsed, no refresh
    Active --> Revoked: User logout / "log out all devices" / Admin session revoke
    Expired --> [*]
    Revoked --> [*]
```

Access token TTL 15 min, refresh token TTL 30 days, per [`SRS-AUTH-004`](../04_Functional_Requirements.md#authentication) and [`docs/31_Environment_Variables.md#authentication--authorization`](../31_Environment_Variables.md#authentication--authorization).

## API Security Flow

```mermaid
flowchart TD
    A[Inbound Request] --> B[WAF - filter known attack patterns]
    B --> C[Rate Limiter - per docs/12_API_Specification.md#rate-limiting]
    C -->|over limit| D[429 + Retry-After]
    C -->|within limit| E{Auth Method}
    E -- Bearer JWT --> F[User Session Auth Flow]
    E -- X-API-Key --> G[API Key Validation - scope + tier check]
    F & G --> H[Authorization Flow]
    H --> I[Business Logic]
    I --> J[Response]
    J --> K[Usage Logged - api_key_usage / access logs]
```

## Audit Flow

```mermaid
flowchart TD
    A[Privileged Action Occurs] --> B[Service emits audit event]
    B --> C[Admin/Audit Service]
    C --> D[Fetch prev_hash of latest audit_log row]
    D --> E[Compute record_hash = SHA256(prev_hash + event)]
    E --> F[(INSERT audit_log - append-only, UPDATE/DELETE denied by trigger)]
    F --> G[Daily Integrity Job: Re-walk Chain]
    G --> H{Chain Intact?}
    H -- Yes --> I[Checkpoint hash written to WORM storage]
    H -- No --> J[Critical Incident - docs/13_Security_Design.md#incident-response]
```

## Backup Flow

```mermaid
flowchart LR
    A[(Production Database)] -->|continuous| B[WAL Archiving]
    A -->|nightly| C[Full Snapshot]
    B & C --> D[(Encrypted Backup Storage - cross-region)]
    E[(Object Storage)] -->|versioned + replicated| D
    D --> F[Weekly Automated Restore Test]
    F --> G{Restore Verifies?}
    G -- Yes --> H[Backup Confirmed Valid]
    G -- No --> I[Alert DevOps Immediately]
```

Retention detail: [`docs/30_Backup_and_Recovery.md#retention-policy`](../30_Backup_and_Recovery.md#retention-policy).

## Disaster Recovery Flow

```mermaid
flowchart TD
    A[Incident Declared - Primary Unavailable] --> B{Scope}
    B -- Database Only --> C[Point-in-Time Recovery]
    B -- Full Region/Site --> D[Promote DR Standby]
    C --> E[Restore Snapshot + Replay WAL]
    D --> F[Redirect Object Storage Endpoint]
    D --> G[Update DNS / Service Discovery]
    E --> H[Validate Audit-Chain Integrity]
    F & G --> H
    H --> I[Smoke Test: Auth, Dashboard, Alert-Path Dry Run]
    I --> J{Pass?}
    J -- Yes --> K[Cut Over Traffic - Declare Resolved]
    J -- No --> H
    K --> L[Post-Incident Review within 5 business days]
```

RPO ≤15 min, RTO ≤1h (alert path) / ≤4h (full platform) per [`docs/05_Non_Functional_Requirements.md#availability--reliability`](../05_Non_Functional_Requirements.md#availability--reliability).

## References

- [`docs/13_Security_Design.md`](../13_Security_Design.md)
- [`docs/security/threat-model.md`](../security/threat-model.md)
- [`docs/30_Backup_and_Recovery.md`](../30_Backup_and_Recovery.md)
- [`docs/09_Database_Dictionary.md`](../09_Database_Dictionary.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Security Engineering | Initial version (Phase 2 visual design package) |
