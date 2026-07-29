/** Mirrors the Postgres enum `identity.user_status` (database/schema/001_extensions_and_types.sql). */
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
  INVITED = 'invited',
}

/** Mirrors the Postgres enum `identity.mfa_method`. */
export enum MfaMethod {
  TOTP = 'totp',
  SMS = 'sms',
  NONE = 'none',
}
