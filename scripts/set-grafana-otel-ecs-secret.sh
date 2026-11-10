#!/usr/bin/env bash
# Merge OTLP headers into mofi-platform-api/<stage>/app (run once per AWS account/stage).
set -euo pipefail

STAGE="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OTEL_LOCAL="$ROOT/infra/k8s/helm/mofi-local/values-otel.local.yaml"

if [[ ! -f "$OTEL_LOCAL" ]]; then
  echo "Missing $OTEL_LOCAL" >&2
  exit 1
fi

HEADERS="$(grep 'otlpHeaders:' "$OTEL_LOCAL" | sed 's/.*otlpHeaders: //' | tr -d '"')"
SECRET_ID="mofi-platform-api/${STAGE}/app"

CURRENT="$(aws secretsmanager get-secret-value --secret-id "$SECRET_ID" --region "$REGION" --query SecretString --output text)"
UPDATED="$(echo "$CURRENT" | jq --arg h "$HEADERS" '. + {OTEL_EXPORTER_OTLP_HEADERS: $h}')"

aws secretsmanager put-secret-value \
  --secret-id "$SECRET_ID" \
  --region "$REGION" \
  --secret-string "$UPDATED"

echo "✅ Updated $SECRET_ID with OTEL_EXPORTER_OTLP_HEADERS"
echo "Redeploy ECS (cdk deploy -c stage=$STAGE) if not already using grafanaOtlpEndpoint in cdk.json"
