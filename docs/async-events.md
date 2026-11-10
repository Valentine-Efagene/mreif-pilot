# MOFI domain command events

Asynchronous domain work is enqueued on BullMQ queue `mofi.<domain>.commands`.
Messages use the platform envelope from `libs/messaging` (`eventName`, `schemaVersion`, `correlationId`, `payload`).

The job name is the `eventName` (for example `developer.assets.purge`). Each domain that consumes commands runs a **processor** on its queue in that domain’s ECS/k8s container (`DOMAIN_COMMAND_CONSUMER_ROLES` in `libs/messaging`).

### Adding a consumer for a new domain

1. Implement the handler under `domains/<name>/src/async/`.
2. Add `domains/<name>/src/messaging/*` with a Bull `@Processor` and a Nest module (see `DeveloperAsyncConsumerModule`).
3. Import that module in `<name>-app.module.ts`.
4. Add the container role to `DOMAIN_COMMAND_CONSUMER_ROLES` and register queue `mofi.<name>.commands` in `MofiMessagingModule`.

Publishers use `AsyncJobsPublisher`; routing targets the queue derived from the `eventName` prefix.

Valkey durability, retries, and failed-job retention are documented in [valkey-bull.md](./valkey-bull.md).

## `developer.assets.purge`

Purges a developer record and related storage after an async delete is accepted on the HTTP API.

| Field | Type | Required |
|-------|------|----------|
| `jobId` | string (uuid) | yes |
| `developerId` | number | yes |

**Publisher:** developer domain (`DELETE /developer/developers/:id` queues the command via BullMQ).

**Consumer:** developer domain container (`DeveloperAssetsPurgeHandler`, `DeveloperCommandsProcessor`).

## `agent.home_owner.assets.purge`

Reserved for home-owner deletes with S3 cleanup. Payload and handler follow the same job row + stepper pattern as developer purge.
