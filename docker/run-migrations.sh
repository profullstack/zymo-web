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

# Create empty .env.local if it doesn't exist (shell migrations source both .env and .env.local)
touch .env.local

# Make shell migration scripts executable
chmod 755 ./migrations/*.sh 2>/dev/null || true

# Run shell migrations in a specific order (core tables first)
echo "Running shell migrations..."

# Define the order of shell migrations (core tables first)
SHELL_MIGRATIONS=(
    "users.sh"
    "apikeys.sh"
    "affiliates.sh"
    "appointments.sh"
    "blogposts.sh"
    "crawl_status.sh"
    "files.sh"
    "library.sh"
    "links.sh"
    "m3u.sh"
    "media_files.sh"
    "nostrusers.sh"
    "payouts.sh"
    "products.sh"
    "stream_providers.sh"
    "torrent_client.sh"
    "waitlist.sh"
)

for migration in "${SHELL_MIGRATIONS[@]}"; do
    if [ -f "./migrations/$migration" ]; then
        echo "Running shell migration: $migration"
        ./migrations/$migration || echo "Warning: $migration failed but continuing..."
    fi
done

# Run JavaScript migrations (for incremental schema changes)
echo "Running JavaScript migrations..."
node ./migrations/scripts/migrate.js up

echo "Migrations complete!"