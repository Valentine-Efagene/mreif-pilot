#!/bin/sh
set -eu
MC_ALIAS="${MC_ALIAS:-local}"
MC_ENDPOINT="${MC_ENDPOINT:-http://minio:9000}"
MC_USER="${MINIO_ROOT_USER:-minioadmin}"
MC_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadmin}"
BUCKET="${MINIO_BUCKET:-mofi-test}"

until mc alias set "$MC_ALIAS" "$MC_ENDPOINT" "$MC_USER" "$MC_PASSWORD" 2>/dev/null; do
  echo "waiting for minio..."
  sleep 2
done

mc mb --ignore-existing "$MC_ALIAS/$BUCKET"
echo "bucket $BUCKET ready"
