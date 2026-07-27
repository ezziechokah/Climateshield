#!/usr/bin/env node
/**
 * Extracts every ```mermaid fenced code block from a Markdown file and
 * renders each with @mermaid-js/mermaid-cli to verify it is syntactically
 * valid (and, with --out, exports it as an image). Used by
 * .github/workflows/docs-validate.yml and scripts/generate-docs.sh /
 * generate-erd.sh — see docs/diagrams/README.md#local-render-validation.
 *
 * Usage:
 *   node scripts/lib/extract-and-render-mermaid.js <file.md> [--out DIR] [--format svg|png]
 *
 * This is a tooling script, not application code — it contains no business
 * logic about ClimateShield Nexus's domain, only Markdown parsing and a
 * shell-out to mmdc (mermaid-cli).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const [, , inputFile, ...rest] = process.argv;
if (!inputFile) {
  console.error("Usage: extract-and-render-mermaid.js <file.md> [--out DIR] [--format svg|png]");
  process.exit(1);
}

const outFlagIdx = rest.indexOf("--out");
const formatFlagIdx = rest.indexOf("--format");
const outDir = outFlagIdx >= 0 ? rest[outFlagIdx + 1] : null;
const format = formatFlagIdx >= 0 ? rest[formatFlagIdx + 1] : "svg";

const content = fs.readFileSync(inputFile, "utf8");
const blocks = [...content.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);

if (blocks.length === 0) {
  console.log(`No mermaid blocks found in ${inputFile}`);
  process.exit(0);
}

let failures = 0;
const baseName = path.basename(inputFile, ".md");

blocks.forEach((block, i) => {
  const tmpIn = path.join(os.tmpdir(), `${baseName}-${i}.mmd`);
  fs.writeFileSync(tmpIn, block);

  const tmpOut = outDir
    ? path.join(outDir, `${baseName}-${i}.${format}`)
    : path.join(os.tmpdir(), `${baseName}-${i}.${format}`);

  try {
    execSync(`npx --yes @mermaid-js/mermaid-cli -i "${tmpIn}" -o "${tmpOut}"`, {
      stdio: "pipe",
    });
    console.log(`  ok: ${inputFile} block ${i + 1}/${blocks.length}`);
  } catch (err) {
    failures += 1;
    console.error(`  FAILED: ${inputFile} block ${i + 1}/${blocks.length}`);
    console.error(err.stdout?.toString() || err.message);
  }
});

if (failures > 0) {
  console.error(`${failures} mermaid block(s) failed to render in ${inputFile}`);
  process.exit(1);
}
