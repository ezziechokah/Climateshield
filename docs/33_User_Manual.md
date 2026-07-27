# 33 — User Manual

## Purpose

End-user operating guide for ClimateShield Nexus. Written for the platform's non-technical and technical personas alike; will be expanded with real screenshots once implementation ships.

> Version: 1.0 | Author: ClimateShield Nexus Product Team | Last Updated: 2026-07-27

## Table of Contents

1. [Getting Started](#getting-started)
2. [Logging In](#logging-in)
3. [Navigating Your Dashboard](#navigating-your-dashboard)
4. [Guide: Meteorologist](#guide-meteorologist)
5. [Guide: Disaster Management Officer](#guide-disaster-management-officer)
6. [Guide: GIS Analyst](#guide-gis-analyst)
7. [Guide: Agriculture Officer](#guide-agriculture-officer)
8. [Guide: Public User](#guide-public-user)
9. [Using the AI Climate Assistant](#using-the-ai-climate-assistant)
10. [Generating Reports](#generating-reports)
11. [Managing Alert Subscriptions](#managing-alert-subscriptions)
12. [Troubleshooting](#troubleshooting)
13. [Glossary](#glossary)
14. [References](#references)
15. [Revision History](#revision-history)

## Getting Started

1. Obtain your account from your agency Administrator (KMD Administrator for KMD staff).
2. Navigate to your agency's ClimateShield Nexus URL.
3. Log in with your credentials or government SSO.
4. If prompted, complete MFA setup (required for Administrator, Meteorologist, and Disaster Management Officer roles).

## Logging In

- **Email/Password**: enter credentials, complete MFA challenge if enrolled.
- **Government SSO**: click "Sign in with [Agency SSO]" and authenticate via your existing government identity.
- **Forgot password**: use the "Reset Password" link; a time-limited reset email is sent.

See [`docs/21_Wireflows.md`](21_Wireflows.md#wireflow-1-login--role-based-dashboard) for the visual flow.

## Navigating Your Dashboard

Upon login you land on the dashboard matching your role (see [`docs/02_Business_Requirements.md`](02_Business_Requirements.md#role-to-module-value-map)). The left navigation exposes only the modules your role has access to. The top bar shows: active alerts banner (if any), notification bell, language switcher, and profile menu.

## Guide: Meteorologist

- **Forecast Dashboard**: view 0-72h, 3-10d, and seasonal outlooks; compare model runs.
- **Climate Data Management**: browse/correct observations; flagged records appear in your "Review Queue."
- **Issuing an advisory**: from Forecast Dashboard, select "Publish Advisory" — this feeds the Risk Assessment and Reports modules.

## Guide: Disaster Management Officer

- **GIS Dashboard**: your primary situational-awareness view; toggle hazard layers relevant to the current situation.
- **Alert Approval**: pending alerts appear in "Alerts → Pending Approval." Review contributing data sources, then Approve or Reject with a reason. See [`docs/11_Use_Cases.md`](11_Use_Cases.md#uc-01-issue-severe-weather-alert).
- **Escalations**: if you don't act within the SLA window, the alert escalates automatically to on-call — this is a safety net, not a substitute for timely review.

## Guide: GIS Analyst

- **Interactive GIS**: use the Layer Panel to compose boundary, hazard, and satellite layers.
- **Spatial Query**: click any point/polygon to see the current risk summary at that location.
- **Publishing a new layer**: contact your Administrator for `gis_layer` creation permissions; layer versions are tracked automatically.

## Guide: Agriculture Officer

- **Agriculture Analysis**: view drought/rainfall-driven crop-stage risk per region.
- **AI Recommendations**: the AI Dashboard surfaces irrigation/planting-window suggestions — always check the confidence score and citation before advising farmers.

## Guide: Public User

- **Climate Dashboard (public view)**: check current conditions, forecast summary, and active alerts for your county.
- **Subscribing to alerts**: see [Managing Alert Subscriptions](#managing-alert-subscriptions).

## Using the AI Climate Assistant

1. Open the AI Dashboard and type your question in natural language.
2. Review the response, its cited data sources, and confidence score.
3. If flagged "Human review required," treat the response as a draft, not a final answer — escalate to the relevant specialist role.
4. Follow-up questions continue the same conversation context.

## Generating Reports

1. Navigate to Climate Reports.
2. Select an existing template or request a custom export from any dashboard view ("Export → PDF/Excel").
3. Scheduled bulletins are configured by Administrators; you can also request an on-demand report at any time.

## Managing Alert Subscriptions

1. Go to Alerts → Subscriptions.
2. Choose your region(s) of interest (down to county/sub-county level).
3. Choose hazard types (flood, drought, heatwave, etc.).
4. Choose delivery channel (SMS, email, or both).
5. Save — you'll receive a confirmation and can edit preferences anytime.

## Troubleshooting

| Issue | Resolution |
|---|---|
| Can't log in | Check caps lock, use "Forgot Password"; contact your Administrator if account is locked |
| Dashboard shows stale data | Check the data-source freshness indicator; if a source is flagged "stale," data is being refreshed |
| Map layers not loading | Check your connection; the platform degrades gracefully on slow connections but very low bandwidth may delay tile loading |
| Not receiving alerts | Verify subscription settings and that your contact info is current in your Profile |

## Glossary

See [`docs/09_Database_Dictionary.md`](09_Database_Dictionary.md#glossary) for technical terms (SPI, SPEI, CAP, etc.).

## References

- [`docs/21_Wireflows.md`](21_Wireflows.md)
- [`docs/19_UI_Design_System.md`](19_UI_Design_System.md)
- [`docs/02_Business_Requirements.md`](02_Business_Requirements.md)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Product Team | Initial version |
