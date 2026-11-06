# Local infrastructure

**Primary path:** local Kubernetes (kind + Helm) with a **multicontainer platform Pod** (edge + domains + worker) — see [../k8s/README.md](../k8s/README.md).

```bash
npm run k8s:setup
curl http://localhost:8080/health
```

## Legacy docker compose (deprecated)

The compose files under `dev/` and `test/` remain for reference only. Prefer `npm run k8s:setup` and `npm run k8s:test:setup`.

| Profile | Legacy compose command |
|---------|-------------------------|
| Dev | `npm run local:dev:up` |
| Test | `npm run local:test:up` |

## Port map (k8s dev — same host ports as former compose)

| Service | Host port |
|---------|-----------|
| Platform API | 8080 |
| MySQL | 3307 |
| Redis | 6379 |
| MinIO API / console | 9000 / 9001 |
| RabbitMQ AMQP / UI | 5672 / 15672 |

## Monolith on the host

Optional escape hatch: merge `dev/.env.example` into repo-root `.env` and run `npm run start:dev` (single process, no edge split).
