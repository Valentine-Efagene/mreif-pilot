#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="${K8S_CLUSTER_NAME:-mofi}"

if kind get clusters 2>/dev/null | grep -qx "$CLUSTER_NAME"; then
  echo "▶ Deleting kind cluster '$CLUSTER_NAME'"
  kind delete cluster --name "$CLUSTER_NAME"
else
  echo "▶ No kind cluster named '$CLUSTER_NAME'"
fi

echo "✅ Done"
