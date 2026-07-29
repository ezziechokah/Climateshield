import { createHash, randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';

/**
 * Generates and hashes opaque, random, single-use tokens — refresh tokens
 * (`identity.user_session.refresh_token_hash`), password-reset tokens,
 * email-verification tokens, API keys, and webhook secrets all share this
 * shape per database/schema/002_identity.sql: a high-entropy random value
 * handed to the caller ONCE, stored only as a SHA-256 hash at rest so a
 * database read alone never discloses a usable credential.
 *
 * SHA-256 (not a slow KDF like argon2) is deliberate here: these are
 * high-entropy random tokens (256 bits), not low-entropy human-chosen
 * passwords — a fast hash is safe and lets a single indexed equality lookup
 * (`idx_user_session_token_hash` etc.) find the row in O(1) rather than
 * requiring a full-table argon2 comparison per candidate.
 */
@Injectable()
export class OpaqueTokenService {
  /** Returns a URL-safe, 256-bit-entropy random token. */
  generate(byteLength = 32): string {
    return randomBytes(byteLength).toString('base64url');
  }

  /** Deterministic SHA-256 hash (hex) of a token, for storage/lookup. */
  hash(token: string): string {
    return createHash('sha256').update(token, 'utf-8').digest('hex');
  }
}
