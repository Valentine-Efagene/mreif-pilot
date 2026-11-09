# System tests (e2e)

End-to-end flows against a real domain process or the full platform URL. Each scenario lives in its own folder:

| File | Purpose |
|------|---------|
| `OBJECTIVE.md` | What the flow validates, stubs, and **expected milestone flow chart** |
| `REPORT.md` | Last run: **milestone flow chart**, checklist table, and per-step status (updated each run) |
| `*.spec.ts` | Executable scenario |

Every `REPORT.md` includes a Mermaid **milestone flow** so failures show exactly which step stopped the run.

## Prerequisites

**In-process (default when enabled):**

```bash
npm run test:system:deps   # MySQL :3308 + Mailpit :8025
SYSTEM_TESTS_ENABLED=true npm run test:system
```

Uses `AUTH_ENFORCEMENT=gateway`, sync notifications, and **stubbed** `PlatformNotificationService` by default.

**Notifications**

| Mode | Env | Behaviour |
|------|-----|-----------|
| Stub (default) | — | In-memory capture; asserts `/admin/developer-company-registration` |
| HTTP shim | `SYSTEM_TEST_NOTIFICATIONS=http` | Real `PlatformNotificationService` → local shim |
| Mailpit | `SYSTEM_TEST_NOTIFICATIONS=http` + `SYSTEM_TEST_MAILPIT=true` | Shim relays to Mailpit API; asserts inbox |

Mailpit UI: http://localhost:8025

**HTTP (optional):**

```bash
export MOFI_PLATFORM_API_URL=http://localhost:8080
export SYSTEM_TESTS_ENABLED=true
npm run test:system
```

## Commands

- `npm run test:system` — all scenarios under `system-tests/`
- `npm run test:system -- developer-onboarding-flow` — single folder

## Scenarios

- [`developer-onboarding-flow/`](developer-onboarding-flow/) — full developer company onboarding via `POST /developer/developers`
