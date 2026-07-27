# Mock API Responses

Canned API responses for tests that need to stub the network layer (e.g., frontend component tests that shouldn't hit a real backend). These are the SAME payloads as [`docs/api/examples/`](../../docs/api/examples/) — imported directly from there rather than duplicated, so a contract change can't silently desync the two.

## Usage (MSW example)

```ts
import { http, HttpResponse } from "msw";
import riskAssessmentExample from "../../docs/api/examples/risk-assessment-response.json";

export const handlers = [
  http.get("/v1/risk-assessments/:id", () => HttpResponse.json(riskAssessmentExample)),
];
```

## References

- [`docs/api/examples/`](../../docs/api/examples/)
- [`docs/14_Testing_Strategy.md`](../../docs/14_Testing_Strategy.md)
