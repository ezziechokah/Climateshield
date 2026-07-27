#!/usr/bin/env node
/**
 * Validates every file in mock-data/ against its corresponding JSON Schema
 * in shared/schemas/ (where one exists). Pure validation tooling — no
 * ClimateShield business logic. Used by scripts/seed-database.sh and
 * .github/workflows/docs-validate.yml.
 */
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const MOCK_DATA_DIR = path.join(REPO_ROOT, "mock-data");
const SCHEMAS_DIR = path.join(REPO_ROOT, "shared", "schemas");

// Maps a mock-data file to the schema (and the array field, if the mock
// file wraps records in a named array) it should validate against.
const SCHEMA_MAP = {
  "weather-observations.json": { schema: "observation.schema.json", arrayField: "observations" },
  "risk-assessments.json": { schema: "risk-assessment.schema.json", arrayField: "risk_assessments" },
  "alerts.json": { schema: "alert.schema.json", arrayField: "alerts" },
};

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

let hasErrors = false;

for (const [mockFile, { schema, arrayField }] of Object.entries(SCHEMA_MAP)) {
  const mockPath = path.join(MOCK_DATA_DIR, mockFile);
  const schemaPath = path.join(SCHEMAS_DIR, schema);

  if (!fs.existsSync(mockPath)) {
    console.log(`skip: ${mockFile} not present yet`);
    continue;
  }
  if (!fs.existsSync(schemaPath)) {
    console.warn(`warn: no schema found for ${mockFile} at ${schemaPath}`);
    continue;
  }

  const schemaJson = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const validate = ajv.compile(schemaJson);
  const data = JSON.parse(fs.readFileSync(mockPath, "utf8"));
  const records = arrayField ? data[arrayField] : data;

  records.forEach((record, idx) => {
    if (!validate(record)) {
      hasErrors = true;
      console.error(`FAIL: ${mockFile}[${idx}]`);
      console.error(validate.errors);
    }
  });

  console.log(`checked ${records.length} record(s) in ${mockFile} against ${schema}`);
}

if (hasErrors) {
  console.error("\nMock data validation failed.");
  process.exit(1);
}
console.log("\nAll mock data validates against shared/schemas/.");
