import { createHmac } from 'crypto';

/**
 * RFC 6238 TOTP (the algorithm docs/13_Security_Design.md#authentication-architecture
 * mandates: "MFA: TOTP (RFC 6238) primary, SMS OTP fallback").
 *
 * NOTE on secret storage (documented gap — see README "MFA" section):
 * database/schema/002_identity.sql's `identity."user"` table has
 * `mfa_enabled`/`mfa_method` but no `mfa_secret` column, so there is
 * currently nowhere in the authoritative schema to persist a per-user
 * enrolled TOTP secret. Per this task's constraint ("entities must map
 * exactly onto database/schema/002_identity.sql — do NOT invent columns"),
 * this module does not add one. Instead, `AuthService` derives a
 * per-user secret deterministically as `HMAC-SHA256(pepper, user_id)`
 * (see `deriveUserSecret` below) so the full challenge -> verify flow is
 * real and testable against RFC 6238 test vectors. This is an interim
 * measure: it does not support user-chosen authenticator-app enrollment
 * (the secret is not independently rotatable/revocable per user) and
 * should be replaced by a real stored secret once a schema migration adds
 * `identity."user".mfa_secret`.
 */

const DEFAULT_STEP_SECONDS = 30;
const DEFAULT_DIGITS = 6;

/** Derives a stable, non-reversible per-subject secret from a server-side pepper. Not a substitute for a real stored secret — see module doc comment. */
export function deriveUserSecret(pepper: string, subjectId: string): Buffer {
  return createHmac('sha256', pepper).update(subjectId).digest();
}

function intToBuffer(counter: number): Buffer {
  const buf = Buffer.alloc(8);
  // TOTP counters fit comfortably in the lower 32 bits until the year 2106+; write via two 32-bit halves for portability.
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter % 2 ** 32, 4);
  return buf;
}

/** Computes the RFC 6238 TOTP code for `secret` at `unixSeconds` (defaults to now). */
export function computeTotp(
  secret: Buffer,
  unixSeconds: number = Math.floor(Date.now() / 1000),
  stepSeconds = DEFAULT_STEP_SECONDS,
  digits = DEFAULT_DIGITS,
): string {
  const counter = Math.floor(unixSeconds / stepSeconds);
  const hmac = createHmac('sha1', secret).update(intToBuffer(counter)).digest();
  const lastByte = hmac[hmac.length - 1];
  const offset = lastByte === undefined ? 0 : lastByte & 0x0f;
  const b0 = hmac[offset] ?? 0;
  const b1 = hmac[offset + 1] ?? 0;
  const b2 = hmac[offset + 2] ?? 0;
  const b3 = hmac[offset + 3] ?? 0;
  const binary = ((b0 & 0x7f) << 24) | ((b1 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b3 & 0xff);
  const code = binary % 10 ** digits;
  return code.toString().padStart(digits, '0');
}

/** Verifies `code` against `secret`, tolerating +/- `windowSteps` steps of clock drift (default 1 step = 30s each way). */
export function verifyTotp(
  secret: Buffer,
  code: string,
  windowSteps = 1,
  unixSeconds: number = Math.floor(Date.now() / 1000),
  stepSeconds = DEFAULT_STEP_SECONDS,
): boolean {
  for (let delta = -windowSteps; delta <= windowSteps; delta += 1) {
    const candidate = computeTotp(secret, unixSeconds + delta * stepSeconds, stepSeconds);
    if (candidate === code) {
      return true;
    }
  }
  return false;
}
