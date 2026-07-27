# Mobile App

## Purpose

Scaffold directory for the ClimateShield Nexus React Native (Expo) mobile app, targeted for Phase 5 GA per [`docs/20_Project_Roadmap.md`](../docs/20_Project_Roadmap.md#phase-5--scale--multi-agency-rollout). **No application code exists yet** — this is pre-coding foundation only.

## Planned Structure

```
mobile/
├── src/
│   ├── screens/           # Mirrors the highest-priority web dashboard flows
│   ├── components/         # Shares design tokens with frontend/ where feasible
│   └── offline/             # Offline-tolerant caching for public/alert views
├── ios/
└── android/
```

## Scope for Phase 5

Mobile prioritizes: alert subscription/receipt, public climate dashboard (read-only), and field-usable GIS view for Disaster Management Officers — not full parity with the web platform. See [`docs/25_Product_Backlog.md`](../docs/25_Product_Backlog.md).

## Before You Start

Read, in order: [`docs/20_Project_Roadmap.md`](../docs/20_Project_Roadmap.md#phase-5--scale--multi-agency-rollout), [`docs/19_UI_Design_System.md`](../docs/19_UI_Design_System.md#responsive-breakpoints), [`docs/05_Non_Functional_Requirements.md`](../docs/05_Non_Functional_Requirements.md#usability--accessibility).

## References

- [`docs/20_Project_Roadmap.md`](../docs/20_Project_Roadmap.md)
- [`docs/19_UI_Design_System.md`](../docs/19_UI_Design_System.md)
