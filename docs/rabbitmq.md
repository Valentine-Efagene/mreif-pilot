# RabbitMQ (MOFI platform)

Amazon MQ / local RabbitMQ **3.13+** is required (`x-delivery-limit`).

## Work queues

| Queue | DLQ | Consumer |
|-------|-----|----------|
| `mofi.notifications.commands` | `mofi.notifications.commands.dlq` | Worker |
| `mofi.verifier.lambda.commands` | `mofi.verifier.lambda.commands.dlq` | Worker |
| `mofi.<domain>.commands` | `mofi.<domain>.commands.dlq` | Domain container (e.g. `developer`) |

Domain commands use topic exchange `mofi.domain.commands`; platform queues are direct.

## Production queue policy

Configured in `libs/messaging/src/rmq-queue-policy.ts` and applied via `buildRmqMicroserviceOptions` / work-queue `ClientProxy` declarations:

- **Durable** queues
- **`x-delivery-limit`** — default **5** redeliveries (`MOFI_RMQ_DELIVERY_LIMIT`)
- **Dead-letter** — after limit (or reject), messages route to `*.dlq` via default exchange

On boot, `connectMofiMicroservices` asserts all `*.dlq` queues (`ensureMofiRmqDeadLetterTopology`).

## Consumer behaviour

- **Notifications** — HTTP **4xx** (except 408/429) are logged and **acked** (no retry). **5xx**, timeouts, and network errors **rethrow** for broker redelivery until delivery limit, then **DLQ**.
- **Domain commands** — terminal business errors (e.g. resource missing after `asyncJobs.fail`) **return** so the message is **acked**. Transient failures **rethrow** until limit → **DLQ**; poll `GET /async-jobs/:id` for job status.

## Operations

- **Monitor** depth on `*.dlq` and main queues (Amazon MQ / management UI).
- **Drain DLQ** after fixing root cause: inspect payload, fix, re-publish or purge.
- **Migrations**: changing queue arguments requires **delete and recreate** the primary queue (Nest assert will fail with `406 PRECONDITION_FAILED` otherwise):

  ```bash
  rabbitmqctl delete_queue -p mofi mofi.notifications.commands
  rabbitmqctl delete_queue -p mofi mofi.notifications.commands.dlq
  ```

  Restart consumers so queues are re-declared with policy.

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `AMQP_URL` | — | Broker URL (preferred) |
| `AMQP_HOST` / `AMQP_PORT` / `AMQP_USERNAME` / `AMQP_PASSWORD` / `AMQP_VHOST` | see `.env.example` | Used when `AMQP_URL` unset |
| `MOFI_RMQ_DELIVERY_LIMIT` | `5` | Max redeliveries per message (`0` = omit; use if broker rejects `x-delivery-limit` on classic queues) |
