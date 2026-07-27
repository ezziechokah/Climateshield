#!/usr/bin/env node
/**
 * Generic mock-data loader: reads a JSON file from mock-data/ and inserts
 * its records into the matching Postgres table via a plain parameterized
 * INSERT built from the record's own keys. Deliberately dumb — it has no
 * knowledge of ClimateShield Nexus's domain rules (that lives in each
 * service's own repository/DAO layer once implemented); it only loads
 * fixtures for local development, matching the schema in
 * docs/09_Database_Dictionary.md.
 *
 * Usage: node scripts/lib/seed-entity.js <entity-name> <path/to/file.json>
 */
const fs = require("fs");
const { Client } = require("pg");

const [, , entityName, filePath] = process.argv;
if (!entityName || !filePath) {
  console.error("Usage: seed-entity.js <entity-name> <path/to/file.json>");
  process.exit(1);
}

// mock-data/*.json files wrap their records in a top-level array field
// named after the entity (see mock-data/README.md), e.g. { "users": [...] }.
const camelToSnake = (s) => s.replace(/-/g, "_");
const arrayFieldName = camelToSnake(entityName);

async function main() {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const records = raw[arrayFieldName] ?? raw;

  if (!Array.isArray(records) || records.length === 0) {
    console.log(`No records found for ${entityName} in ${filePath} (expected key "${arrayFieldName}")`);
    return;
  }

  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "climateshield_app",
    password: process.env.DB_PASSWORD || "change-me",
    database: process.env.DB_NAME || "climateshield_nexus",
  });
  await client.connect();

  const tableName = arrayFieldName.endsWith("s") ? arrayFieldName.slice(0, -1) : arrayFieldName;
  let inserted = 0;

  for (const record of records) {
    const columns = Object.keys(record);
    const values = Object.values(record).map((v) =>
      typeof v === "object" && v !== null ? JSON.stringify(v) : v,
    );
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;

    try {
      await client.query(sql, values);
      inserted += 1;
    } catch (err) {
      console.warn(`  skip (table "${tableName}" may not exist yet — run migrations first): ${err.message}`);
      break;
    }
  }

  console.log(`  inserted ${inserted}/${records.length} rows into "${tableName}"`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
