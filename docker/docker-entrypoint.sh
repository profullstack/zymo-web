#!/bin/bash
set -e

echo "=== Docker Entrypoint Starting ==="

# Set NODE_ENV to production
export NODE_ENV="${NODE_ENV:-production}"

# Set default environment variables if not provided
export DB_USER="${DB_USER:-root}"
export DB_PASS="${DB_PASS:-root}"
export DB_PORT="${DB_PORT:-8000}"
export DB_HOST="${DB_HOST:-http://127.0.0.1}"
export DB_NS="${DB_NS:-zymo}"
export DB_DB="${DB_DB:-zymo}"
export PORT="${PORT:-8080}"
export HTTP_HOST="${HTTP_HOST:-0.0.0.0}"

# Update DB connection URLs
export DB_SQL_URL="http://127.0.0.1:${DB_PORT}/sql"
export DB_RPC_URL="http://127.0.0.1:${DB_PORT}/rpc"
export DB_WS_HOST="ws://127.0.0.1"

echo "=== Checking for existing .env files ==="
ls -la /app/.env* 2>/dev/null || echo "No .env files found"

# Remove any existing .env files that might override our settings
# Use glob pattern to catch all .env* files
echo "=== Removing all .env* files ==="
rm -f /app/.env* 2>/dev/null || true

# Also remove any .primate cache that might have old values
echo "=== Removing .primate cache ==="
rm -rf /app/.primate 2>/dev/null || true

echo "=== Verifying .env files removed ==="
ls -la /app/.env* 2>/dev/null || echo "Confirmed: No .env files exist"

# Create .env file for dotenv-flow (primate config uses this)
cat > /app/.env << ENVFILE
PORT=${PORT}
HTTP_HOST=${HTTP_HOST}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_PORT=${DB_PORT}
DB_HOST=${DB_HOST}
DB_NS=${DB_NS}
DB_DB=${DB_DB}
DB_SQL_URL=${DB_SQL_URL}
DB_RPC_URL=${DB_RPC_URL}
DB_WS_HOST=${DB_WS_HOST}
APP_DOMAIN=${APP_DOMAIN:-localhost}
APP_NAME=${APP_NAME:-Zymo}
APP_SHORT_NAME=${APP_SHORT_NAME:-Zymo}
APP_DESCRIPTION=${APP_DESCRIPTION:-Zymo TV Streaming Platform}
GOOGLE_ANALYTICS_ID=${GOOGLE_ANALYTICS_ID:-}
GOOGLE_ADS_ID=${GOOGLE_ADS_ID:-}
PHONE=${PHONE:-}
EMAIL=${EMAIL:-}
HCAPTCHA_SITE_KEY=${HCAPTCHA_SITE_KEY:-}
HCAPTCHA_SECRET_KEY=${HCAPTCHA_SECRET_KEY:-}
USE_CAPTCHA=${USE_CAPTCHA:-false}
AFFILIATE_COMMISSION_PERCENT=${AFFILIATE_COMMISSION_PERCENT:-20}
AFFILIATE_DISCOUNT_PERCENT=${AFFILIATE_DISCOUNT_PERCENT:-10}
MAILGUN_DOMAIN=${MAILGUN_DOMAIN:-}
MAILGUN_API_KEY=${MAILGUN_API_KEY:-}
FROM_EMAIL=${FROM_EMAIL:-}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
STRIPE_SK=${STRIPE_SK:-}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID:-}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN:-}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER:-}
UNSUBSCRIBE_SECRET=${UNSUBSCRIBE_SECRET:-}
ENVFILE

echo "=== Created .env file with configuration ==="
echo "Contents of /app/.env:"
cat /app/.env
echo ""
echo "=== Environment Summary ==="
echo "NODE_ENV=${NODE_ENV}"
echo "PORT=${PORT}"
echo "HTTP_HOST=${HTTP_HOST}"
echo "DB_PORT=${DB_PORT}"
echo "DB_HOST=${DB_HOST}"
echo "=== Starting services ==="
echo "SurrealDB will be available at: http://127.0.0.1:${DB_PORT}"
echo "Node.js app will be available at: http://0.0.0.0:${PORT}"

# Start supervisor which manages both services
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf