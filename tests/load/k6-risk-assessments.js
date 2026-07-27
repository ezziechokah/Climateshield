/**
 * k6 load test for GET /risk-assessments — validates the p95 latency and
 * concurrency targets in docs/05_Non_Functional_Requirements.md#performance
 * (NFR-PERF-001: non-GIS API p95 < 300ms) and #scalability
 * (NFR-SCALE-001: 2,000 concurrent users at pilot scale).
 *
 * Run: k6 run tests/load/k6-risk-assessments.js
 *      k6 run -e BASE_URL=https://staging-api.climateshield-nexus.example/v1 tests/load/k6-risk-assessments.js
 */
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000/v1";
const API_KEY = __ENV.CSN_API_KEY || "";

export const options = {
  scenarios: {
    pilot_scale: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 200 },
        { duration: "2m", target: 2000 }, // NFR-SCALE-001 pilot target
        { duration: "1m", target: 2000 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<300"], // NFR-PERF-001
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/risk-assessments?severity=high&limit=50`, {
    headers: { "X-API-Key": API_KEY },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "has data array": (r) => JSON.parse(r.body).data !== undefined,
  });

  sleep(1);
}
