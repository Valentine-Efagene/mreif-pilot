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
npm run test:system:deps   # MySQL :3308 + RabbitMQ :5673 (+ optional Mailpit :8025)
SYSTEM_TESTS_ENABLED=true npm run test:system
```

Uses `AUTH_ENFORCEMENT=gateway`, RabbitMQ (`mofi.notifications.commands`), and in-process **developer API + worker**.

Rabbit management UI (local test compose): http://localhost:15673 (`mofi` / `mofi`, vhost `mofi`)

## Notifications (in-process)

| Mode | Env | Behaviour |
|------|-----|-----------|
| **Shim (default)** | — | Worker POSTs to local HTTP shim; assert `/admin/developer-company-registration` |
| **Real testnotify** | `SYSTEM_TEST_NOTIFICATION_TARGET=real` + `SYSTEM_TEST_ALLOW_REAL_NOTIFICATIONS=true` | Worker POSTs to `https://api.qshelter.ng/testnotify/email` (override with `NOTIFICATION_URL`); assert **Rabbit queue consumed/acked**; **manual** inbox check (default PM/developer email `efagenevalentine@gmail.com`) |
| **Mailpit (shim only)** | `SYSTEM_TEST_MAILPIT=true` | Optional relay from shim into Mailpit API; not used with real testnotify |

Real testnotify example:

```bash
npm run test:system:deps
export SYSTEM_TESTS_ENABLED=true
export SYSTEM_TEST_NOTIFICATION_TARGET=real
export SYSTEM_TEST_ALLOW_REAL_NOTIFICATIONS=true
# optional: export SYSTEM_TEST_NOTIFICATION_AUTH='Bearer …'
npm run test:system
```

## HTTP (optional)

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
