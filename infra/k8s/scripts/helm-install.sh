#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"
CHART_DIR="$K8S_DIR/helm/mofi-local"

PROFILE="${1:-dev}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd helm
require_cmd kubectl

install_release() {
  local profile="$1"
  local release="mofi-${profile}"
  local values_file="$CHART_DIR/values-${profile}.yaml"
  local namespace

  if [[ ! -f "$values_file" ]]; then
    echo "Unknown profile: $profile (expected values-${profile}.yaml)" >&2
    exit 1
  fi

  namespace="$(grep '^namespace:' "$values_file" | awk '{print $2}')"

  local helm_args=(
    upgrade --install "$release" "$CHART_DIR"
    -f "$CHART_DIR/values.yaml"
    -f "$values_file"
    --namespace "$namespace"
    --create-namespace
  )

  local otel_local="$CHART_DIR/values-otel.local.yaml"
  if [[ -f "$otel_local" ]]; then
    echo "▶ Merging values-otel.local.yaml (Grafana OTLP auth)"
    helm_args+=( -f "$otel_local" )
    if [[ -z "${OTEL_EXPORTER_OTLP_HEADERS:-}" ]]; then
      export OTEL_EXPORTER_OTLP_HEADERS="$(
        grep 'otlpHeaders:' "$otel_local" | sed 's/.*otlpHeaders: //' | tr -d '"'
      )" || true
    fi
  fi

  if [[ -n "${OTEL_EXPORTER_OTLP_HEADERS:-}" && ! -f "$otel_local" ]]; then
    helm_args+=( --set "observability.otlpHeaders=${OTEL_EXPORTER_OTLP_HEADERS}" )
  fi

  echo "▶ helm ${helm_args[*]}"
  helm "${helm_args[@]}"

  echo "▶ Waiting for MySQL in $namespace"
  kubectl wait --for=condition=ready pod/mysql-0 -n "$namespace" --timeout=8m

  echo "▶ Waiting for platform pod in $namespace"
  kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/component=platform \
    -n "$namespace" \
    --timeout=10m
}

case "$PROFILE" in
  dev|test|all)
    if [[ "$PROFILE" == "all" ]]; then
      install_release dev
      install_release test
    else
      install_release "$PROFILE"
    fi
    ;;
  *)
    echo "Usage: $0 [dev|test|all]" >&2
    exit 1
    ;;
esac

echo "✅ Helm release(s) ready"
