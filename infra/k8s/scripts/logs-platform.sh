#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-mofi-dev}"
CONTAINER="${2:-edge}"

POD="$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/component=platform -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)"
if [[ -z "$POD" ]]; then
  echo "No platform pod in namespace $NAMESPACE" >&2
  exit 1
fi

exec kubectl logs -n "$NAMESPACE" "$POD" -c "$CONTAINER" -f
