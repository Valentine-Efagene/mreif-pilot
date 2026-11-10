# Valkey + BullMQ (MOFI platform)

One shared **Valkey** cluster backs BullMQ job queues for notifications, verifier Lambda invokes, and per-domain async commands. Future agent cache should use a different key prefix (e.g. `mofi:agent:`); Bull uses `mofi:bull:`.

## Work queues

| Queue | Consumer |
|-------|----------|
| `mofi.notifications.commands` | Worker (`NotificationQueueProcessor`) |
| `mofi.verifier.lambda.commands` | Worker (`LambdaInvokeQueueProcessor`) |
| `mofi.<domain>.commands` | Domain container (e.g. `developer` → `DeveloperCommandsProcessor`) |

Domain publishes route by `eventName` prefix (`developer.assets.purge` → `mofi.developer.commands`).

## Job policy

Configured in `libs/messaging/src/job-defaults.ts`:

- **`attempts`** — default **5** (`MOFI_JOB_ATTEMPTS`)
- **Exponential backoff** — 1s base delay
- **Failed / completed** — retained up to configured counts (`removeOnFail` / `removeOnComplete`)

## Consumer behaviour

- **Notifications** — HTTP **4xx** (except 408/429) complete without retry. **5xx**, timeouts, and network errors **throw** for Bull retries until attempts exhaust.
- **Domain commands** — terminal business errors (e.g. resource missing after `asyncJobs.fail`) **return** without throw. Transient failures **throw** until attempts exhaust; poll `GET /async-jobs/:id` for job status.

## Operations

- **Monitor** waiting/active/failed via Bull Board or Redis CLI (`KEYS` under `mofi:bull:` prefix).
- **Drain failed jobs** after fixing root cause: inspect payload in Redis, re-enqueue, or remove.
- **Purge a queue in dev/test:** `queue.obliterate()` in tests or flush keys with prefix (destructive).

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `VALKEY_URL` | — | Full URL (preferred in prod; use `rediss://` with TLS) |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | see `.env.example` | Used when `VALKEY_URL` unset |
| `REDIS_TLS` | `false` | Enable TLS for ElastiCache in-transit encryption |
| `MOFI_JOB_ATTEMPTS` | `5` | Max Bull attempts per job |
