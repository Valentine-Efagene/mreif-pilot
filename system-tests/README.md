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

The worker always POSTs to the Qshelter **testnotify** endpoint (default `https://api.qshelter.ng/testnotify/email`; override with `NOTIFICATION_URL`).

| Check | Automated | Manual |
|-------|-----------|--------|
| RMQ consumption on `mofi.notifications.commands` | ✓ | — |
| Email in inbox | — | ✓ (default PM/developer: `efagenevalentine@gmail.com`) |

Optional overrides:

- `SYSTEM_TEST_DEVELOPER_EMAIL` / `SYSTEM_TEST_PM_EMAIL` — recipients used in stub user registration
- `SYSTEM_TEST_NOTIFICATION_AUTH` — Bearer token if testnotify requires auth

```bash
npm run test:system:deps
export SYSTEM_TESTS_ENABLED=true
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
