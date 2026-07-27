/**
 * E2E: Login flow — implements the acceptance criteria in
 * docs/26_Acceptance_Criteria.md#authentication--access and the flow in
 * docs/21_Wireflows.md#wireflow-1-login--role-based-dashboard.
 *
 * Marked test.fixme() until frontend/ and backend/auth-service exist
 * (docs/40_Developer_Assignment.md) — the spec itself is the deliverable
 * for this bootstrap phase; remove .fixme once the Login page is built.
 */
import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test.fixme(
    "a Meteorologist can log in with email/password and lands on the Forecast Dashboard equivalent",
    async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Email").fill("meteorologist.demo@kmd.example");
      await page.getByLabel("Password").fill("REPLACE_WITH_TEST_PASSWORD");
      await page.getByRole("button", { name: "Log In" }).click();

      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByRole("heading", { name: /Forecast Dashboard|Climate Dashboard/ })).toBeVisible();
    },
  );

  test.fixme(
    "shows a generic error on invalid credentials without disclosing whether the account exists",
    async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Email").fill("nonexistent@example.test");
      await page.getByLabel("Password").fill("wrong-password");
      await page.getByRole("button", { name: "Log In" }).click();

      await expect(page.getByRole("alert")).toContainText("Invalid email or password");
    },
  );

  test.fixme("locks the account after 5 failed attempts within 15 minutes", async ({ page }) => {
    await page.goto("/login");
    for (let i = 0; i < 5; i += 1) {
      await page.getByLabel("Email").fill("meteorologist.demo@kmd.example");
      await page.getByLabel("Password").fill(`wrong-password-${i}`);
      await page.getByRole("button", { name: "Log In" }).click();
    }
    await expect(page.getByRole("alert")).toContainText(/locked/i);
  });
});
