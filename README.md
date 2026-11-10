# MOFI Platform API

NestJS domain services behind a shared edge proxy, using the same URL prefixes as API Gateway:

- `/agent`
- `/pmb`
- `/rsa` (includes legacy admin `PUT /rsa/api/approve|decline/*`)
- `/developer`
- `/uploader`
- `/cooperative`

## Runtimes

| Mode | Command / deploy |
|------|------------------|
| **Local k8s (Fargate parity)** | `npm run k8s:setup` → edge + domains + worker in one Pod on `:18080` |
| **Single process (host)** | `npm run start:dev` → edge on `:8080` (or `start:dev:developer` for one domain) |
| **Multi-container Fargate** | `MOFI_CONTAINER_ROLE` per container (`edge`, domain roles, `worker`); see `docker/entrypoint.sh` |
| **Edge only** | `npm run start:edge` (requires domain upstream env vars) |
| **Platform queue worker** | `npm run start:worker` (notifications + verifier; domain commands run in domain containers) |

ECS always runs **eight containers** per task (edge, six domains, worker). See [infra/aws/README.md](infra/aws/README.md).

## Local development

**Recommended (multicontainer Pod, matches Fargate):**

```bash
npm install
npm run k8s:setup
```

Requires Docker, kind, kubectl, and Helm (`@qshelter/nest-auth` from npm). See [infra/k8s/README.md](infra/k8s/README.md).

Health (k8s dev): `GET http://localhost:18080/health` and `GET http://localhost:18080/{domain}/health`.

OpenAPI (Swagger UI) per domain: `GET http://localhost:18080/{domain}/docs` (via edge). Host-only edge (`npm run start:dev`) still uses `:8080`. On by default (including prod for now); set `SWAGGER_ENABLED=false` to disable.

Use repo-root `.env` for host single-process dev; the k8s stack injects env via Helm ConfigMap/Secrets.

**Auth:** Default `AUTH_ENFORCEMENT=local` enables a dev-only JWT guard that mirrors authorizer **public routes** (`libs/auth/src/authorizer-public-routes.ts`). Production ECS uses `AUTH_ENFORCEMENT=gateway` (CDK); JWT is enforced by the **API Gateway authorizer**. See [infra/aws/GATEWAY-AUTH.md](infra/aws/GATEWAY-AUTH.md).

Notifications and verifier lambdas publish to BullMQ on shared Valkey; the worker process delivers HTTP notifications and invokes lambdas. Queue policy (attempts, backoff): [docs/valkey-bull.md](docs/valkey-bull.md).

**System e2e:** [`system-tests/`](system-tests/) — run `npm run test:system:deps` (MySQL + Valkey) then `SYSTEM_TESTS_ENABLED=true npm run test:system` (in-process developer API + worker → Qshelter testnotify).

## Build & run (production container)

```bash
npm run build
MOFI_CONTAINER_ROLE=edge npm run start:prod   # or agent / developer / … via entrypoint
```

## Auth shadow (staging)

```bash
export MOFI_LAMBDA_API_URL=...
export MOFI_PLATFORM_API_URL=...
npm run auth:shadow
```

See [infra/aws/CUTOVER.md](infra/aws/CUTOVER.md).

## CDK

```bash
cd infra/aws && npm install && npx cdk synth -c stage=dev
```

ElastiCache Valkey is provisioned in the stack; auth token in `mofi-platform-api/{stage}/valkey`.

See [infra/README.md](infra/README.md) and [infra/aws/README.md](infra/aws/README.md).

## Async jobs

Long-running deletes return `202` with `jobId` and `statusUrl`; clients poll `GET /{domain}/async-jobs/:jobId`. Event catalog: [docs/async-events.md](docs/async-events.md).

## Local dependencies (MySQL, Valkey, MinIO)

Use **`npm run k8s:setup`** (in-cluster). Legacy compose: `npm run local:dev:up` — see [infra/local/README.md](infra/local/README.md).
