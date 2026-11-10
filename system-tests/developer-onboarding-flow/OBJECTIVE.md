# Developer onboarding flow

## Goal

Validate that a newly registered user can complete **developer company onboarding** in the developer domain API:

1. A **user** record exists (stand-in for external onboarding/register).
2. A **project manager** user exists (audience for admin notification emails).
3. **POST /developer/developers** creates the developer with POCs, group entities, documents, directors, bank details, and terms acceptance.
4. All **onboarding stages** are marked completed on the persisted developer.
5. The developer can be retrieved **by user id**.
6. (In-process) **Company registration** notifications are published to RabbitMQ, consumed by the platform worker, and delivered over HTTP to **testnotify**.

## Scope

| In scope | Out of scope |
|----------|----------------|
| Developer domain HTTP API (`/developer/*`) | Legacy onboarding Lambda |
| Single-shot create with full payload | Admin approval (`update-status`) |
| MySQL persistence | Real S3 uploads |
| RMQ + platform worker for notifications | Automated Gmail inbox proof |

## Stubs / fixtures

| Dependency | In-process |
|------------|------------|
| User registration | `POST /developer/users` (default email `efagenevalentine@gmail.com`, override `SYSTEM_TEST_DEVELOPER_EMAIL`) |
| Project managers | `POST /developer/users` (`project_manager`; default `SYSTEM_TEST_PM_EMAIL`) |
| Notification HTTP | Qshelter testnotify (`NOTIFICATION_URL`) |
| Lambda ARN paths | `PlatformLambdaInvokeService` mock |
| Document upload | HTTPS URLs in JSON |

## Execution modes

- **http (default)** — kind **`mofi-test`** platform pod (edge + domains + worker), `MOFI_PLATFORM_API_URL=http://localhost:18082`; MySQL/Rabbit on test host ports (`kind/cluster.yaml`); asserts **RMQ consumption** on `mofi.notifications.commands`; manual inbox check in `REPORT.md`.
- **in-process (debug only)** — `SYSTEM_TEST_IN_PROCESS=true`; not Fargate/k8s parity.

Enable with `SYSTEM_TESTS_ENABLED=true` after `npm run test:system:up`.

## Milestone flow (expected)

Each run writes an updated chart to `REPORT.md` (pass/fail per node).

```mermaid
flowchart TD
  start([Start])
  m0[Stub project manager]
  m1[Stub user registration]
  m2[POST /developer/developers]
  m3[GET developer by user]
  m4[All onboarding stages complete]
  m5[RMQ worker consumes notification]
  m6[HTTP to testnotify]
  endNode([End])
  start --> m0 --> m1 --> m2 --> m3 --> m4 --> m5 --> m6 --> endNode
```
