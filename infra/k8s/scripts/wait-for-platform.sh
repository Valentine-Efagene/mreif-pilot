#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE="${1:-dev}"

case "$PROFILE" in
  dev)
    URL="http://localhost:8080/health"
    ;;
  test)
    URL="http://localhost:8082/health"
    ;;
  all)
    bash "$SCRIPT_DIR/wait-for-platform.sh" dev
    bash "$SCRIPT_DIR/wait-for-platform.sh" test
    exit 0
    ;;
  *)
    echo "Usage: $0 [dev|test|all]" >&2
    exit 1
    ;;
esac

bash "$SCRIPT_DIR/wait-for-api.sh" "$URL" "platform edge"
