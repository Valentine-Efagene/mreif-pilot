# System tests (e2e)

End-to-end flows against the **kind multicontainer platform** (`mofi-test` namespace), not in-process Nest shortcuts.

| File | Purpose |
|------|---------|
| `OBJECTIVE.md` | What the flow validates and **expected milestone flow chart** |
| `REPORT.md` | Last run: milestone flow chart, checklist, step status |
| `*.spec.ts` | Executable scenario |

## Prerequisites

- kind cluster **`mofi`** with Helm releases **dev + test** (`npm run k8s:test:setup` or `npm run test:system:up`)
- `kubectl` configured for that cluster
- Host ports from `infra/k8s/kind/cluster.yaml` (test edge **:18082**, MySQL **:13308**, Valkey **:16380**)

## Commands

```bash
# First time (or after cluster teardown)
npm run test:system:up

# Confirm test edge is healthy
npm run test:system:deps

# Run scenarios (HTTP → edge :18082, worker in platform pod, Valkey/MySQL in mofi-test)
unset NODE_OPTIONS
SYSTEM_TESTS_ENABLED=true npm run test:system
```

Default API base: `http://localhost:18082` (`MOFI_PLATFORM_API_URL` to override).

Valkey (test): `localhost:16380` (in-cluster service `redis:6379`).

## Notifications

Worker in the **platform pod** POSTs to Qshelter **testnotify** (`NOTIFICATION_URL` / Helm `notificationUrl`).

| Check | Automated | Manual |
|-------|-----------|--------|
| RMQ consumption on `mofi.notifications.commands` | ✓ | — |
| Email in inbox | — | ✓ (default PM/developer: `efagenevalentine@gmail.com`) |

Optional env:

- `SYSTEM_TEST_DEVELOPER_EMAIL` / `SYSTEM_TEST_PM_EMAIL`
- `SYSTEM_TEST_NOTIFICATION_AUTH`

## Legacy in-process mode

Only for debugging: `SYSTEM_TEST_IN_PROCESS=true` boots developer + worker inside Jest (not Fargate parity). Do not use for CI.

## Scenarios

- [`developer-onboarding-flow/`](developer-onboarding-flow/) — developer company onboarding via edge → developer container
