#!/usr/bin/env bash
# Source before host dev or pass to helm-install (OTEL headers for Grafana Cloud).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OTEL_LOCAL="$ROOT/infra/k8s/helm/mofi-local/values-otel.local.yaml"

if [[ -f "$OTEL_LOCAL" ]]; then
  # shellcheck disable=SC1090
  export OTEL_EXPORTER_OTLP_HEADERS="$(
    grep 'otlpHeaders:' "$OTEL_LOCAL" | sed 's/.*otlpHeaders: //' | tr -d '"'
  )"
fi

export OTEL_EXPORTER_OTLP_ENDPOINT="${OTEL_EXPORTER_OTLP_ENDPOINT:-https://otlp-gateway-prod-eu-central-0.grafana.net/otlp}"
export OTEL_EXPORTER_OTLP_PROTOCOL="${OTEL_EXPORTER_OTLP_PROTOCOL:-http/protobuf}"
export DOTENV_CONFIG_PATH="${DOTENV_CONFIG_PATH:-$ROOT/.env}"
