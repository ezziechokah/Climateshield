/**
 * Playwright configuration for end-to-end tests against the running full
 * stack (docker-compose.dev.yml or a Staging deployment). See
 * docs/14_Testing_Strategy.md#test-types--tooling.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } }, // exercises the mobile-web breakpoints (docs/design/02_High_Fidelity_Design_Specification.md#responsive-breakpoints)
  ],
});
