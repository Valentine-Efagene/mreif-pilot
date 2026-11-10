# OpenTelemetry (Grafana Cloud / Tempo)

Tracing is **opt-in**: nothing is exported until `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

## How it works

- `libs/observability/src/register.ts` starts the OpenTelemetry Node SDK (HTTP/Express, outbound HTTP, MySQL, etc.).
- **Service name** defaults to `mofi-<MOFI_CONTAINER_ROLE>` (e.g. `mofi-developer`, `mofi-worker`) unless you set `OTEL_SERVICE_NAME`.
- Production containers load it via `docker/entrypoint.sh` with `node -r ./dist/libs/observability/src/register.js`.

BullMQ/Valkey job processing is not fully traced yet; HTTP paths and worker outbound calls are still traced. Align `MessageEnvelope.correlationId` with `x-request-id` in a follow-up for async flows.

## Grafana Cloud

Create an access policy in Grafana Cloud → OpenTelemetry, then set (never commit the `Authorization` value):

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp-gateway-prod-eu-central-0.grafana.net/otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic <grafana-cloud-token>"
# Optional override per process:
# export OTEL_SERVICE_NAME="mofi-developer"
```

For **local host** dev after `npm run build`:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=...
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ..."
export NODE_OPTIONS='--require ./dist/libs/observability/src/register.js'
MOFI_CONTAINER_ROLE=developer MOFI_RUNTIME=domain PORT=3004 npx ts-node -r tsconfig-paths/register domains/developer/src/main.ts
```

Or put the OTEL variables in `.env` and use `NODE_OPTIONS` as above.

## ECS (CDK)

1. In Secrets Manager, on secret `mofi-platform-api/<stage>/app`, add a key:
   - `OTEL_EXPORTER_OTLP_HEADERS` = `Authorization=Basic <token>` (same format as the env var value, not JSON-quoted).
2. Enable export in `infra/aws/cdk.json` context:

```json
"grafanaOtlpEndpoint": "https://otlp-gateway-prod-eu-central-0.grafana.net/otlp"
```

3. Redeploy. Each container gets the endpoint and protocol; headers come from the secret. Service names remain `mofi-<role>`.

## Local Kubernetes

Tracing is **on by default** for the `dev` Helm profile (`values.yaml`). The `test` profile keeps it off.

Grafana auth (pick one):

```bash
# Option A: env when installing / refreshing
export OTEL_EXPORTER_OTLP_HEADERS='Authorization=Basic ...'
npm run k8s:refresh

# Option B: gitignored file
cp infra/k8s/helm/mofi-local/values-otel.local.yaml.example \
   infra/k8s/helm/mofi-local/values-otel.local.yaml
# edit otlpHeaders, then helm upgrade / k8s:refresh
```

## Security

Grafana OTLP tokens are secrets. Store them in `.env`, Secrets Manager, or Helm secrets — not in git. **Rotate** any token that was pasted into chat or tickets.
