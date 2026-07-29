import { readFileSync } from 'fs';
import { join } from 'path';

import { ValidationError } from '@climateshield/http-errors';
import Ajv from 'ajv';
import type { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import { TOPIC_SCHEMA_FILE } from '../topics';
import type { TopicName } from '../topics';

/**
 * Root of the monorepo's schema source of truth. `event-bus` is a private
 * workspace package consumed only from within this repo (never published
 * to an external registry), so resolving shared/schemas/ relative to this
 * package at runtime is safe and — unlike copying the JSON files into this
 * package at build time — keeps exactly one copy of each schema, per
 * docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-schema-governance's
 * "a schema change is a one-file edit, not a per-language re-implementation."
 */
const SHARED_SCHEMAS_DIR = join(__dirname, '..', '..', '..', '..', '..', '..', 'shared', 'schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validatorCache = new Map<string, ValidateFunction>();

function loadValidatorByFile(fileName: string): ValidateFunction {
  const cached = validatorCache.get(fileName);
  if (cached) {
    return cached;
  }

  const schemaPath = join(SHARED_SCHEMAS_DIR, fileName);
  let schema: object;
  try {
    schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  } catch (err) {
    throw new Error(
      `event-bus: failed to load JSON Schema "${fileName}" from ${schemaPath}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  // Ajv caches compiled schemas by $id; reusing the same $id across the
  // process for the same file is intentional (single source of schema truth).
  const validate = ajv.getSchema(schemaPath) ?? ajv.compile({ ...schema, $id: schemaPath });
  validatorCache.set(fileName, validate);
  return validate;
}

function assertValid(label: string, fileName: string, payload: unknown): void {
  const validate = loadValidatorByFile(fileName);
  const valid = validate(payload);
  if (!valid) {
    throw new ValidationError(`Event payload for "${label}" failed schema validation.`, {
      schema: fileName,
      errors: validate.errors,
    });
  }
}

/**
 * Validates `payload` against the JSON Schema backing `topic`
 * (shared/schemas/*.json). Throws `ValidationError` (never returns a
 * partially-validated result) — used by both `EventProducer` (before
 * publish) and `EventConsumer` (before handing the payload to a consumer
 * handler), per the "producer validates before publish, and shape is never
 * left for a consumer to discover at parse time" rule in
 * docs/backend/01_Microservice_Architecture_and_Module_Boundaries.md#event-schema-governance.
 */
export function validateEventPayload(topic: TopicName, payload: unknown): void {
  assertValid(topic, TOPIC_SCHEMA_FILE[topic], payload);
}

/** Validates a dead-letter payload (`dead-letter.<original-topic>`, whose original topic is dynamic and so not itself a `TopicName`). */
export function validateDeadLetterPayload(payload: unknown): void {
  assertValid('dead-letter', 'dead-letter-event.schema.json', payload);
}
