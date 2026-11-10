# MOFI — Local Kubernetes (kind)

Single local path for **Fargate multicontainer parity**: one Pod with **edge + six domain runtimes + worker**, plus MySQL, Valkey, and MinIO in-cluster.

Production remains **ECS on Fargate** — this stack is for local dev and contract tests only.

## Prerequisites

- Docker Desktop (engine only — disable Docker Desktop’s built-in Kubernetes)
- [kind](https://kind.sigs.k8s.io/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)
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
curl http://localhost:18080/health
curl http://localhost:18080/agent/health
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
| Platform API (edge) | 18080 |
| MySQL | 13307 |
| Redis | 16379 |
| MinIO API / console | 19000 / 19001 |
| Valkey | 16379 / 16380 (dev / test) |

Test namespace (`mofi-test`) uses **18082**, **13308**, **16380**, **19100/19101**, **25673/21673** (host ports; see `kind/cluster.yaml`).

These ports avoid the default **`qshelter`** kind mappings on 8080, 9000, 6380, etc.

## Layout

```
infra/k8s/
├── kind/cluster.yaml
├── helm/mofi-local/
├── scripts/
└── README.md
```

## Monolith escape hatch

Host `npm run start:dev` runs the **edge** process only; for full multicontainer parity use this Helm setup. Use repo-root `.env` (see `.env.example`) when running a single process on the host. Kubernetes injects env via Helm ConfigMap/Secrets instead.

## Legacy docker compose

`infra/local/*/docker-compose.yml` is **deprecated** for the primary workflow; use `k8s:setup` instead.

## Verification

After `k8s:setup`:

```bash
curl -s http://localhost:18080/health
curl -s http://localhost:18080/agent/health
npm run test:contract
# Optional live HTTP contract probes:
# MOFI_PLATFORM_API_URL=http://127.0.0.1:18080 npm run test:contract
```

Rebuild and restart platform after code changes:

```bash
npm run k8s:refresh
```

Domain logs: `bash infra/k8s/scripts/logs-platform.sh mofi-dev agent`
