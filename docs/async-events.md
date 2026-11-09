# MOFI domain command events

Asynchronous domain work is published to the RabbitMQ queue `mofi.domain.commands`.
Messages use the platform envelope from `libs/messaging` (`eventName`, `schemaVersion`, `correlationId`, `payload`).

## `developer.assets.purge`

Purges a developer record and related storage after an async delete is accepted on the HTTP API.

| Field | Type | Required |
|-------|------|----------|
| `jobId` | string (uuid) | yes |
| `developerId` | number | yes |

**Publisher:** developer domain (`DELETE /developer/developers/:id` when `MESSAGING_ENABLED=true`).

**Consumer:** platform worker (`DeveloperAssetsPurgeHandler`).

## `agent.home_owner.assets.purge`

Reserved for home-owner deletes with S3 cleanup. Payload and handler follow the same job row + stepper pattern as developer purge.
