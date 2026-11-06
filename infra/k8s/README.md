# MOFI — Local Kubernetes (kind)

Single local path for **Fargate multicontainer parity**: one Pod with **edge + six domain runtimes + worker**, plus MySQL, Redis, MinIO, and RabbitMQ in-cluster.

Production remains **ECS on Fargate** — this stack is for local dev and contract tests only.

## Prerequisites

- Docker Desktop (engine only — disable Docker Desktop’s built-in Kubernetes)
- [kind](https://kind.sigs.k8s.io/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)
- Sibling repo **`../qshelter-auth`** (from `mreif/`) for the platform image build

```bash
brew install kind kubectl helm
```

## Quick start (dev)

From `mofi-platform-api` repo root:

```bash
npm run k8s:setup
```

**Smoke check:**

```bash
curl http://localhost:8080/health
curl http://localhost:8080/agent/health
```

## npm scripts

| Script | Action |
| ------ | ------ |
| `k8s:setup` | Create kind cluster, build/load image, Helm `mofi-dev`, wait for edge |
| `k8s:down` | Delete kind cluster `mofi` |
| `k8s:logs` | Tail edge container logs (`k8s:logs -- agent` for a domain) |
| `k8s:test:setup` | Cluster + dev and test Helm releases |
| `k8s:refresh` | Rebuild image, reload into kind, restart platform pod (dev) |

## Port map (dev)

| Service | Host port |
| ------- | --------- |
| Platform API (edge) | 8080 |
| MySQL | 3307 |
| Redis | 6379 |
| MinIO API / console | 9000 / 9001 |
| RabbitMQ AMQP / UI | 5672 / 15672 |

Test namespace (`mofi-test`) uses **8082**, **3308**, **6380**, **9100/9101**, **5673/15673** when installed via `k8s:test:setup`.

## Layout

```
infra/k8s/
├── kind/cluster.yaml
├── helm/mofi-local/
├── scripts/
└── README.md
```

## Monolith escape hatch

Host `npm run start:dev` still runs the unified `apps/api` process; use repo-root `.env` (see `.env.example`). Kubernetes injects env via Helm ConfigMap/Secrets instead.

## Legacy docker compose

`infra/local/*/docker-compose.yml` is **deprecated** for the primary workflow; use `k8s:setup` instead.

## Verification

After `k8s:setup`:

```bash
curl -s http://localhost:8080/health
curl -s http://localhost:8080/agent/health
npm run test:contract
# Optional live HTTP contract probes:
# MOFI_PLATFORM_API_URL=http://127.0.0.1:8080 npm run test:contract
```

Rebuild and restart platform after code changes:

```bash
npm run k8s:refresh
```

Domain logs: `bash infra/k8s/scripts/logs-platform.sh mofi-dev agent`
