#!/usr/bin/env node
/**
 * Generates synthetic (non-real) station observation data at arbitrary
 * volume for load testing — see tests/fixtures/synthetic-data/README.md.
 * Values are randomly generated within plausible ranges; this is a data
 * VOLUME generator, not a climate model — it has no domain logic beyond
 * "pick a number in a plausible range."
 */
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { stations: 100, days: 30, out: "tests/fixtures/synthetic-data/generated" };
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    opts[key] = key === "out" ? args[i + 1] : Number(args[i + 1]);
  }
  return opts;
}

function randomInRange(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function main() {
  const { stations, days, out } = parseArgs();
  fs.mkdirSync(out, { recursive: true });

  const stationIds = Array.from({ length: stations }, () => randomUUID());
  const observations = [];

  for (const stationId of stationIds) {
    for (let d = 0; d < days; d += 1) {
      const observedAt = new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
      observations.push({
        id: randomUUID(),
        station_id: stationId,
        parameter: "temperature",
        value: randomInRange(15, 35),
        unit: "celsius",
        observed_at: observedAt,
      });
      observations.push({
        id: randomUUID(),
        station_id: stationId,
        parameter: "rainfall",
        value: randomInRange(0, 100),
        unit: "mm",
        observed_at: observedAt,
      });
    }
  }

  const outFile = path.join(out, `observations-${stations}stations-${days}days.json`);
  fs.writeFileSync(outFile, JSON.stringify({ observations }, null, 2));
  console.log(`Generated ${observations.length} synthetic observations -> ${outFile}`);
}

main();
