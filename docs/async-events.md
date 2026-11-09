# MOFI domain command events

Asynchronous domain work is published to the RabbitMQ **topic exchange** `mofi.domain.commands`.
Messages use the platform envelope from `libs/messaging` (`eventName`, `schemaVersion`, `correlationId`, `payload`).

Routing keys are the `eventName` (for example `developer.assets.purge`). Each domain that consumes commands uses a **dedicated queue** bound with `domain.#` (Nest RMQ `wildcards: true`), for example queue `mofi.developer.commands` with binding `developer.#`.

Consumers live in the owning domain (`domains/<name>/src/messaging/`) and run in that domain’s ECS/k8s container (`DOMAIN_COMMAND_CONSUMER_ROLES` in `libs/messaging`).

### Adding a consumer for a new domain

1. Implement the handler under `domains/<name>/src/async/`.
2. Add `domains/<name>/src/messaging/*` with `@EventPattern` handlers and a Nest module (see `DeveloperAsyncConsumerModule`).
3. Import that module in `<name>-app.module.ts`.
4. Add the container role to `DOMAIN_COMMAND_CONSUMER_ROLES` so `connectMofiMicroservices` binds queue `mofi.<name>.commands` with `wildcards: true`.

Publishers use `AsyncJobsPublisher` unchanged; routing keys remain the `eventName`.

## `developer.assets.purge`

Purges a developer record and related storage after an async delete is accepted on the HTTP API.

| Field | Type | Required |
|-------|------|----------|
| `jobId` | string (uuid) | yes |
| `developerId` | number | yes |

**Publisher:** developer domain (`DELETE /developer/developers/:id` queues the command via RabbitMQ).

**Consumer:** developer domain container (`DeveloperAssetsPurgeHandler`, `@EventPattern` in `DeveloperCommandsController`).

## `agent.home_owner.assets.purge`

Reserved for home-owner deletes with S3 cleanup. Payload and handler follow the same job row + stepper pattern as developer purge.
