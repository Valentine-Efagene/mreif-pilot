#!/bin/sh
set -e
ROLE="${MOFI_CONTAINER_ROLE:?MOFI_CONTAINER_ROLE is required}"

otel_preload() {
  if [ -n "${OTEL_EXPORTER_OTLP_ENDPOINT:-}" ]; then
    printf '%s' '-r ./dist/libs/observability/src/register.js'
  fi
}

OTEL_REQUIRE="$(otel_preload)"

case "$ROLE" in
  edge) exec node ${OTEL_REQUIRE} dist/apps/edge/src/main.js ;;
  agent) exec node ${OTEL_REQUIRE} dist/domains/agent/src/main.js ;;
  pmb) exec node ${OTEL_REQUIRE} dist/domains/pmb/src/main.js ;;
  rsa) exec node ${OTEL_REQUIRE} dist/domains/rsa/src/main.js ;;
  developer) exec node ${OTEL_REQUIRE} dist/domains/developer/src/main.js ;;
  uploader) exec node ${OTEL_REQUIRE} dist/domains/uploader/src/main.js ;;
  cooperative) exec node ${OTEL_REQUIRE} dist/domains/cooperative/src/main.js ;;
  worker) exec node ${OTEL_REQUIRE} dist/apps/worker/src/main.js ;;
  *)
    echo "Unknown MOFI_CONTAINER_ROLE: $ROLE" >&2
    exit 1
    ;;
esac
