#!/usr/bin/env bash
# Build mofi-platform-api image and load into kind.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(cd "$K8S_DIR/../.." && pwd)"
CLUSTER_NAME="${K8S_CLUSTER_NAME:-mofi}"
IMAGE="${MOFI_PLATFORM_IMAGE:-mofi-platform-api:local}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd docker
require_cmd kind

if [[ ! -f "$REPO_ROOT/docker/Dockerfile" ]]; then
  echo "Missing Dockerfile at $REPO_ROOT/docker/Dockerfile" >&2
  exit 1
fi

echo "▶ Building $IMAGE (context: $REPO_ROOT)"
docker build -f "$REPO_ROOT/docker/Dockerfile" -t "$IMAGE" "$REPO_ROOT"

if kind get clusters 2>/dev/null | grep -qx "$CLUSTER_NAME"; then
  echo "▶ Loading image into kind cluster '$CLUSTER_NAME'"
  kind load docker-image "$IMAGE" --name "$CLUSTER_NAME"
else
  echo "▶ Kind cluster '$CLUSTER_NAME' not found — skip image load (run cluster-up first)"
fi

echo "✅ Image ready: $IMAGE"
