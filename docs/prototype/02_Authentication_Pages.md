# Prototype: Authentication Pages

## Purpose

Low-fidelity specification for the authentication screen set: Login, Registration, Forgot Password, Reset Password, Email Verification, Two-Factor Authentication. Template defined in [`00_Overview_and_Template.md`](00_Overview_and_Template.md); flow logic defined in [`docs/21_Wireflows.md#wireflow-1-login--role-based-dashboard`](../21_Wireflows.md#wireflow-1-login--role-based-dashboard) and [`docs/22_Sequence_Diagrams.md#sequence-1-user-authentication-with-mfa`](../22_Sequence_Diagrams.md#sequence-1-user-authentication-with-mfa).

> Version: 1.0 | Author: ClimateShield Nexus UI/UX Team | Last Updated: 2026-07-27

## Table of Contents

1. [Login](#login)
2. [Registration](#registration)
3. [Forgot Password](#forgot-password)
4. [Reset Password](#reset-password)
5. [Email Verification](#email-verification)
6. [Two-Factor Authentication](#two-factor-authentication)
7. [References](#references)
8. [Revision History](#revision-history)

## Login

| Field | Detail |
|---|---|
| Purpose | Authenticate a returning user via email/password or government SSO |
| Key Components | Centered auth card (max-width 400px) on branded split-screen background, agency logo, language switcher |
| Widgets / Cards / Tables / Charts | None |
| Filters | None |
| Primary Actions | "Log In" (primary), "Sign in with [Agency SSO]" (secondary) |
| Forms | Email, Password fields; "Remember this device" checkbox |
| Navigation | Entry: Landing Page, direct URL, session-expiry redirect. Exit: → Role Dashboard (success), → 2FA (if enrolled), → Forgot Password, → Registration |
| Permissions | View: unauthenticated (all) |
| Empty State | N/A |
| Loading State | "Log In" button shows inline spinner, fields disabled during submit |
| Error State | Inline banner: "Invalid email or password" (generic, no user-enumeration per [`docs/28_Validation_Rules.md#user--access-validation`](../28_Validation_Rules.md#user--access-validation)); after 5 failures, banner switches to lockout message with countdown ([`SRS-AUTH-005`](../04_Functional_Requirements.md#authentication)) |
| Responsive Behavior | Split-screen background image hidden below `md`; card becomes full-width with 24px margin |
| Accessibility Notes | Form errors announced via `aria-live="polite"`; password field has a visibility-toggle button with `aria-pressed` state |

## Registration

| Field | Detail |
|---|---|
| Purpose | Self-service account creation for public-tier roles (NGO, Researcher, Public User); staff roles are invited by an Administrator, not self-registered ([`SRS-USR-001`](../04_Functional_Requirements.md#user-management)) |
| Key Components | Same auth-card shell as Login |
| Widgets / Cards / Tables / Charts | None |
| Filters | None |
| Primary Actions | "Create Account" (primary) |
| Forms | Full name, email, organization (optional, required for NGO/Researcher tier selection), password, password confirmation, terms acceptance checkbox |
| Navigation | Entry: Landing Page "Create Account" link, Login page cross-link. Exit: → Email Verification |
| Permissions | View: unauthenticated (all); resulting account role limited to NGO/Researcher/Public tier — staff roles cannot be self-selected |
| Empty State | N/A |
| Loading State | "Create Account" button inline spinner |
| Error State | Field-level inline errors (email format, password policy per [`docs/28_Validation_Rules.md#user--access-validation`](../28_Validation_Rules.md#user--access-validation)); duplicate-email error shown without confirming whether the account exists (generic "unable to create account with these details") |
| Responsive Behavior | Same as Login |
| Accessibility Notes | Password policy requirements listed as a visible checklist that updates live (not only in an error message) |

## Forgot Password

| Field | Detail |
|---|---|
| Purpose | Initiate a password reset via email |
| Key Components | Auth-card shell, single field |
| Widgets / Cards / Tables / Charts | None |
| Filters | None |
| Primary Actions | "Send Reset Link" (primary) |
| Forms | Email field only |
| Navigation | Entry: Login page "Forgot password?" link. Exit: → confirmation state (same page) → user checks email → Reset Password |
| Permissions | View: unauthenticated (all) |
| Empty State | N/A |
| Loading State | Button inline spinner |
| Error State | No error shown for "email not found" (prevents user enumeration); always shows the same confirmation message |
| Responsive Behavior | Same as Login |
| Accessibility Notes | Confirmation message announced via `aria-live="polite"` |

## Reset Password

| Field | Detail |
|---|---|
| Purpose | Set a new password using a time-limited emailed link |
| Key Components | Auth-card shell |
| Widgets / Cards / Tables / Charts | None |
| Filters | None |
| Primary Actions | "Reset Password" (primary) |
| Forms | New password, confirm password |
| Navigation | Entry: emailed reset link only (token in URL). Exit: → Login (success) |
| Permissions | View: unauthenticated, valid token holder only |
| Empty State | N/A |
| Loading State | Button inline spinner |
| Error State | Expired/invalid token → full-page message: "This link has expired" + "Request a new link" action (routes to Forgot Password) |
| Responsive Behavior | Same as Login |
| Accessibility Notes | Same live-checklist pattern as Registration for password policy |

## Email Verification

| Field | Detail |
|---|---|
| Purpose | Confirm ownership of the registered email address before first login |
| Key Components | Auth-card shell, status message, resend action |
| Widgets / Cards / Tables / Charts | None |
| Filters | None |
| Primary Actions | "Resend Verification Email" (secondary) |
| Forms | None (verification happens via emailed link, this page shows status) |
| Navigation | Entry: post-Registration redirect, or emailed verification link. Exit: → Login (verified) |
| Permissions | View: the newly-registered, unverified account holder |
| Empty State | N/A |
| Loading State | Spinner while verifying token from URL |
| Error State | Expired link → "Resend Verification Email" action shown prominently |
| Responsive Behavior | Same as Login |
| Accessibility Notes | Status message (verified/pending/expired) is the page's `<h1>` so screen readers announce it immediately |

## Two-Factor Authentication

| Field | Detail |
|---|---|
| Purpose | Complete MFA challenge (TOTP or SMS OTP) after primary credential check, per [`SRS-AUTH-003`](../04_Functional_Requirements.md#authentication) |
| Key Components | Auth-card shell, 6-digit code input (segmented) |
| Widgets / Cards / Tables / Charts | None |
| Filters | None |
| Primary Actions | "Verify" (primary), "Use backup code instead" (ghost), "Resend code" (SMS OTP only, rate-limited) |
| Forms | 6-digit code field |
| Navigation | Entry: immediately after successful Login for MFA-enrolled users. Exit: → Role Dashboard (success), → Login (cancel/back) |
| Permissions | View: user mid-authentication only (short-lived pre-auth session) |
| Empty State | N/A |
| Loading State | "Verify" button inline spinner |
| Error State | "Incorrect code" inline error, code field clears and refocuses; repeated failures apply the same lockout policy as [Login](#login) |
| Responsive Behavior | Segmented code input remains single-row down to `sm`; auto-advances focus per digit |
| Accessibility Notes | Code input group has a single `aria-label` ("6-digit verification code") read as one field, not six, for screen readers |

## References

- [`docs/21_Wireflows.md#wireflow-1-login--role-based-dashboard`](../21_Wireflows.md#wireflow-1-login--role-based-dashboard)
- [`docs/22_Sequence_Diagrams.md#sequence-1-user-authentication-with-mfa`](../22_Sequence_Diagrams.md#sequence-1-user-authentication-with-mfa)
- [`docs/13_Security_Design.md#authentication-architecture`](../13_Security_Design.md#authentication-architecture)
- [`docs/28_Validation_Rules.md#user--access-validation`](../28_Validation_Rules.md#user--access-validation)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus UI/UX Team | Initial version (Phase 2 visual design package) |
