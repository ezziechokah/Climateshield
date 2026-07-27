# 35 — API Guide

## Purpose

Practical, example-driven guide to consuming the ClimateShield Nexus API — complements the formal contract in [`docs/12_API_Specification.md`](12_API_Specification.md) with worked examples for common integration scenarios.

> Version: 1.0 | Author: ClimateShield Nexus Architecture Team | Last Updated: 2026-07-27

## Table of Contents

1. [Getting an API Key](#getting-an-api-key)
2. [Authenticating a Request](#authenticating-a-request)
3. [Example: Fetch Current Risk for a County](#example-fetch-current-risk-for-a-county)
4. [Example: Subscribe to Flood Alerts via Webhook](#example-subscribe-to-flood-alerts-via-webhook)
5. [Example: Export Historical Rainfall Data](#example-export-historical-rainfall-data)
6. [Example: Query the AI Assistant Programmatically](#example-query-the-ai-assistant-programmatically)
7. [Handling Errors](#handling-errors)
8. [Handling Pagination](#handling-pagination)
9. [SDKs & Client Libraries](#sdks--client-libraries)
10. [References](#references)
11. [Revision History](#revision-history)

## Getting an API Key

1. Request access from your agency Administrator via the API Management module.
2. Choose the appropriate tier (public/partner) per [`docs/12_API_Specification.md`](12_API_Specification.md#rate-limiting).
3. Store the key securely — treat it as a secret (see [`docs/13_Security_Design.md`](13_Security_Design.md#secrets-management)).

## Authenticating a Request

```bash
curl -H "X-API-Key: $CSN_API_KEY" \
  https://api.climateshield-nexus.example/v1/risk-assessments?admin_boundary_id=a1c9...
```

## Example: Fetch Current Risk for a County

```bash
curl -H "X-API-Key: $CSN_API_KEY" \
  "https://api.climateshield-nexus.example/v1/risk-assessments?admin_boundary_id=a1c9...&sort=-assessed_at&limit=1"
```

```json
{
  "data": [
    {
      "id": "5b2e1f0a-...",
      "risk_type": "flood",
      "severity": "high",
      "confidence_score": 0.87,
      "assessed_at": "2026-07-27T06:00:00Z"
    }
  ],
  "meta": { "next_cursor": null, "count": 1 }
}
```

## Example: Subscribe to Flood Alerts via Webhook

```bash
curl -X POST -H "X-API-Key: $CSN_API_KEY" -H "Content-Type: application/json" \
  https://api.climateshield-nexus.example/v1/alert-subscriptions \
  -d '{
    "admin_boundary_id": "a1c9...",
    "hazard_type": "flood",
    "channel_preference": "webhook",
    "webhook_url": "https://ngo-system.example/hooks/climateshield"
  }'
```

Verify inbound webhook payloads using the `X-CSN-Signature` HMAC header (see [`docs/12_API_Specification.md`](12_API_Specification.md#webhooks)).

## Example: Export Historical Rainfall Data

```bash
curl -H "X-API-Key: $CSN_API_KEY" \
  "https://api.climateshield-nexus.example/v1/observations?parameter=rainfall&station_id=stn_042&from=2020-01-01&to=2026-01-01" \
  -o rainfall_history.json
```

## Example: Query the AI Assistant Programmatically

```bash
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  https://api.climateshield-nexus.example/v1/ai/query \
  -d '{ "question": "What is the current drought risk in Turkana County?" }'
```

```json
{
  "answer": "Turkana County is currently classified at 'high' drought risk (SPI-3: -1.6) based on rainfall deficits over the past 90 days...",
  "confidence": 0.81,
  "human_review_required": false,
  "citations": [
    { "source": "climate_index", "id": "idx_7712", "time_range": "2026-04-27/2026-07-27" }
  ]
}
```

## Handling Errors

Always check the `error.code` field for programmatic branching, not just the HTTP status — see the full error catalog in [`docs/12_API_Specification.md`](12_API_Specification.md#error-format).

```python
import requests

resp = requests.get(url, headers={"X-API-Key": api_key})
if resp.status_code == 429:
    retry_after = int(resp.headers.get("Retry-After", 5))
    time.sleep(retry_after)
elif not resp.ok:
    err = resp.json()["error"]
    raise RuntimeError(f"{err['code']}: {err['message']}")
```

## Handling Pagination

```python
cursor = None
all_items = []
while True:
    params = {"limit": 100}
    if cursor:
        params["cursor"] = cursor
    resp = requests.get(url, params=params, headers=headers).json()
    all_items.extend(resp["data"])
    cursor = resp["meta"]["next_cursor"]
    if not cursor:
        break
```

## SDKs & Client Libraries

No official SDK is planned for MVP — the API is documented via OpenAPI (`docs/api/openapi.yaml`, authored alongside implementation) so consumers can generate typed clients (openapi-generator, etc.) for their language of choice.

## References

- [`docs/12_API_Specification.md`](12_API_Specification.md)
- [`docs/13_Security_Design.md`](13_Security_Design.md)
- `docs/api/` — OpenAPI specification (to be authored)

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-07-27 | ClimateShield Nexus Architecture Team | Initial version |
