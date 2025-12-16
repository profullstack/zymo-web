#!/bin/bash
set -e

echo "Waiting for SurrealDB to be ready..."
sleep 15

# Wait for SurrealDB to be accessible
MAX_RETRIES=30
RETRY_COUNT=0
until curl -sf "http://127.0.0.1:${DB_PORT:-8000}/health" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "SurrealDB did not become ready in time"
        exit 1
    fi
    echo "Waiting for SurrealDB... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo "SurrealDB is ready!"
echo "Running migration code..."

cd /app

# Make shell migration scripts executable
chmod 755 ./migrations/*.sh 2>/dev/null || true

# Run shell migrations (commented out by default - uncomment if needed)
# for f in ./migrations/*.sh; do
#     if [ -f "$f" ]; then
#         echo "Running shell migration: $f"
#         ./$f || echo "Warning: $f failed but continuing..."
#     fi
# done

# Run JavaScript migrations
echo "Running JavaScript migrations..."
node ./migrations/scripts/migrate.js up

echo "Migrations complete!"