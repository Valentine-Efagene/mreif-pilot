#!/bin/sh
set -e
ROLE="${MOFI_CONTAINER_ROLE:-api}"
case "$ROLE" in
  edge) exec node dist/apps/edge/src/main.js ;;
  agent) exec node dist/apps/agent/src/main.js ;;
  pmb) exec node dist/apps/pmb/src/main.js ;;
  rsa) exec node dist/apps/rsa/src/main.js ;;
  developer) exec node dist/apps/developer/src/main.js ;;
  uploader) exec node dist/apps/uploader/src/main.js ;;
  cooperative) exec node dist/apps/cooperative/src/main.js ;;
  worker) exec node dist/apps/worker/src/main.js ;;
  api|monolith|*) exec node dist/apps/api/src/main.js ;;
esac
