#!/usr/bin/env bash
set -euo pipefail

URL="${1:?usage: wait-for-api.sh URL [label] [attempts]}"
LABEL="${2:-$URL}"
ATTEMPTS="${3:-90}"

for i in $(seq 1 "$ATTEMPTS"); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 8 "$URL" 2>/dev/null || echo "000")
  if [[ "$code" == "200" ]]; then
    echo "✅ $LABEL ready"
    exit 0
  fi
  echo "  waiting for $LABEL ($i/$ATTEMPTS)…"
  sleep 2
done

echo "❌ $LABEL did not become ready at $URL" >&2
exit 1
