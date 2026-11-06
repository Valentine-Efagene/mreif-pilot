# MOFI Platform API (ECS monolith pilot)

NestJS service unifying MOFI pilot domains with the same URL prefixes as API Gateway:

- `/agent`
- `/pmb`
- `/rsa` (includes legacy admin `PUT /rsa/api/approve|decline/*`)
- `/developer`
- `/uploader`
- `/cooperative`

## Runtimes

| Mode | Command / deploy |
|------|------------------|
| **Local k8s (Fargate parity)** | `npm run k8s:setup` → edge + domains + worker in one Pod on `:8080` |
| Monolith (host escape hatch) | `npm run start:dev` → single process on `:8080` |
| Multi-container Fargate | `MOFI_CONTAINER_ROLE` per container (`edge`, domain roles, `worker`); see `docker/entrypoint.sh` |
| Edge only | `npm run start:edge` (requires domain upstream env vars) |
| Queue worker | `npm run start:worker` with `MESSAGING_ENABLED=true` |

CDK defaults to `deploymentMode=multicontainer`; use `-c deploymentMode=monolith` for a single-container task.

## Local development

**Recommended (multicontainer Pod, matches Fargate):**

```bash
npm install
npm run k8s:setup
```

Requires Docker, kind, kubectl, Helm, and sibling `../qshelter-auth`. See [infra/k8s/README.md](infra/k8s/README.md).

Health: `GET http://localhost:8080/health`

**Optional monolith on the host:**

```bash
cp .env.example .env
npm run start:dev
```

Use repo-root `.env` only for host `start:dev`; the k8s stack injects env via Helm ConfigMap/Secrets.

**Auth:** Default `AUTH_ENFORCEMENT=local` enables a dev-only JWT guard that mirrors authorizer **public routes** (`libs/auth/src/authorizer-public-routes.ts`). Production ECS uses `AUTH_ENFORCEMENT=gateway` (CDK); JWT is enforced by the **API Gateway authorizer**—use `@qshelter/nest-auth` for roles in handlers. See [infra/aws/GATEWAY-AUTH.md](infra/aws/GATEWAY-AUTH.md).

Async messaging in k8s dev is enabled by default (`MESSAGING_ENABLED=true`, async notification/verifier modes in the platform ConfigMap).

## Build & run (production container)

```bash
npm run build
MOFI_CONTAINER_ROLE=edge npm run start:prod   # or api / agent / … via entrypoint
```

## Phase 2 auth shadow

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

Amazon MQ for RabbitMQ is provisioned in the stack; populate `mofi-platform-api/{stage}/rabbitmq` after deploy.

See [infra/README.md](infra/README.md) and [infra/aws/README.md](infra/aws/README.md).

## Local dependencies (MySQL, Redis, MinIO, RabbitMQ)

Use **`npm run k8s:setup`** (in-cluster). Legacy compose: `npm run local:dev:up` — see [infra/local/README.md](infra/local/README.md).

## Contract tests

```bash
npm run test:contract
```
