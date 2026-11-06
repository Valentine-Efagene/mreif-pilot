#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"
CLUSTER_NAME="${K8S_CLUSTER_NAME:-mofi}"
PROFILE="${1:-dev}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd kind
require_cmd kubectl
require_cmd helm
require_cmd docker

if kind get clusters 2>/dev/null | grep -qx "$CLUSTER_NAME"; then
  echo "▶ Kind cluster '$CLUSTER_NAME' already exists"
else
  echo "▶ Creating kind cluster '$CLUSTER_NAME'"
  kind create cluster --name "$CLUSTER_NAME" --config "$K8S_DIR/kind/cluster.yaml"
fi

echo "▶ Building and loading images"
bash "$SCRIPT_DIR/build-images.sh"

echo "▶ Installing Helm release(s)"
bash "$SCRIPT_DIR/helm-install.sh" "$PROFILE"

echo ""
echo "▶ Waiting for platform edge health"
bash "$SCRIPT_DIR/wait-for-platform.sh" "$PROFILE"

echo ""
echo "✅ MOFI local Kubernetes stack is up"
echo ""
if [[ "$PROFILE" == "dev" || "$PROFILE" == "all" ]]; then
  echo "  Dev API:      http://localhost:8080/health"
  echo "  Dev MySQL:    localhost:3307"
  echo "  Dev MinIO:    http://localhost:9001 (minioadmin / minioadmin)"
  echo "  RabbitMQ UI:  http://localhost:15672 (mofi / mofi)"
fi
if [[ "$PROFILE" == "test" || "$PROFILE" == "all" ]]; then
  echo "  Test API:     http://localhost:8082/health"
fi
echo ""
