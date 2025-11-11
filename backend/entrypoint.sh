#!/bin/sh
set -e

RETRY_COUNT=0
MAX_RETRIES=${DB_MAX_RETRIES:-10}
SLEEP_SECONDS=${DB_RETRY_DELAY:-3}

>&2 echo "Applying database migrations..."
until python manage.py migrate --noinput; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    >&2 echo "Failed to apply migrations after ${MAX_RETRIES} attempts."
    exit 1
  fi
  >&2 echo "Database is unavailable (attempt ${RETRY_COUNT}/${MAX_RETRIES}), retrying in ${SLEEP_SECONDS}s..."
  sleep "$SLEEP_SECONDS"
done

>&2 echo "Collecting static files..."
python manage.py collectstatic --noinput

>&2 echo "Starting ASGI server."
exec "$@"
