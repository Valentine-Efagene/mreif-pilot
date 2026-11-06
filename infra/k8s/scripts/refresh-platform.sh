#!/usr/bin/env bash
# Rebuild platform image and restart the multicontainer platform pod (dev).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE="${1:-mofi-dev}"

bash "$SCRIPT_DIR/build-images.sh"

kubectl rollout restart deployment/platform -n "$NAMESPACE"
kubectl rollout status deployment/platform -n "$NAMESPACE" --timeout=10m

bash "$SCRIPT_DIR/wait-for-platform.sh" dev
