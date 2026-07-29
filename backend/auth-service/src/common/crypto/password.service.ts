import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Password hashing per docs/13_Security_Design.md#authentication-architecture
 * ("Argon2id, fallback bcrypt cost >= 12") and docs/17_Coding_Standards.md
 * ("bcrypt/argon2 — never reversible encryption, never logged"). Argon2id is
 * used here (the preferred option). Never call `hash`/`verify` results
 * anywhere near a logger — callers must not log the returned hash or the
 * plaintext password.
 */
@Injectable()
export class PasswordService {
  async hash(plaintext: string): Promise<string> {
    return argon2.hash(plaintext, { type: argon2.argon2id });
  }

  /** Never throws on a bad password — returns false. Only throws for a malformed hash. */
  async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      return false;
    }
  }
}
