#!/bin/sh
set -e
ROLE="${MOFI_CONTAINER_ROLE:?MOFI_CONTAINER_ROLE is required}"
case "$ROLE" in
  edge) exec node dist/apps/edge/src/main.js ;;
  agent) exec node dist/domains/agent/src/main.js ;;
  pmb) exec node dist/domains/pmb/src/main.js ;;
  rsa) exec node dist/domains/rsa/src/main.js ;;
  developer) exec node dist/domains/developer/src/main.js ;;
  uploader) exec node dist/domains/uploader/src/main.js ;;
  cooperative) exec node dist/domains/cooperative/src/main.js ;;
  worker) exec node dist/apps/worker/src/main.js ;;
  *)
    echo "Unknown MOFI_CONTAINER_ROLE: $ROLE" >&2
    exit 1
    ;;
esac
