/**
 * Example reference webhook receiver for ClimateShield Nexus alert webhooks.
 *
 * Demonstrates ONLY signature verification per docs/12_API_Specification.md#webhooks —
 * this is an integration example, not application code. Run with:
 *   node verify-signature.js
 *
 * Requires: express, body-parser (npm install express body-parser) — dev-only,
 * this file is not part of any deployed service.
 */
const crypto = require("crypto");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
// Webhook secret is issued when the subscription is created (docs/12_API_Specification.md#webhooks).
const WEBHOOK_SECRET = process.env.CSN_WEBHOOK_SECRET || "REPLACE_WITH_ISSUED_SECRET";

app.use(bodyParser.raw({ type: "application/json" }));

function verifySignature(rawBody, signatureHeader, secret) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  // Constant-time comparison to avoid timing attacks.
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader || ""));
}

app.post("/hooks/climateshield", (req, res) => {
  const signature = req.get("X-CSN-Signature");

  if (!verifySignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString("utf8"));
  console.log(`Received verified event: ${event.event}`, event.data);

  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3999;
app.listen(PORT, () => console.log(`Example webhook receiver listening on :${PORT}`));
