#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Debug mode flag
VERBOSE=0

# Setup logging
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="$(dirname "$0")/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/webhook_test_${TIMESTAMP}.log"

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "$timestamp [$level] $message" | tee -a "$LOG_FILE"
}

# Debug logging function with optional console output
debug() {
    local message=$1
    log "DEBUG" "$message"
    if [ $VERBOSE -eq 1 ]; then
        echo -e "${BLUE}[DEBUG] $message${NC}"
    fi
}

# Error logging function
error() {
    local message=$1
    log "ERROR" "$message"
    echo -e "${RED}$message${NC}"
}

# Info logging function
info() {
    local message=$1
    log "INFO" "$message"
    echo -e "$message"
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -v|--verbose) VERBOSE=1; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
done

# Log script start
info "Starting webhook test setup"
debug "Log file: $LOG_FILE"

# Load environment variables
debug "Loading environment variables..."
source "$(dirname "$0")/../../.env"
source "$(dirname "$0")/../../.env.local"

# Export verbose flag for test script
export TEST_VERBOSE=$VERBOSE

# Base URL
BASE_URL="${TEST_BASE_URL:-http://localhost:${PORT:-3000}}"
debug "Base URL: $BASE_URL"
debug "Environment variables: PORT=$PORT, DB_HOST=$DB_HOST, DB_PORT=$DB_PORT"

info "${YELLOW}Setting up test environment...${NC}"

# Function to wait for server to be ready
wait_for_server() {
    info "Waiting for server to be ready..."
    for i in {1..30}; do
        debug "Attempt $i: Checking server health at $BASE_URL/health"
        local response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
        local status_code=$(echo "$response" | tail -n1)
        local body=$(echo "$response" | sed \$d)
        
        debug "Response code: $status_code"
        debug "Response body: $body"
        
        if [ "$status_code" = "200" ]; then
            info "${GREEN}Server is ready!${NC}"
            return 0
        fi
        info "Waiting... ($i/30)"
        sleep 1
    done
    error "Server did not become ready in time"
    return 1
}

# Function to create test API key
create_test_api_key() {
    info "Creating test API key..."
    local DB_URL="${DB_HOST:-http://127.0.0.1}:${DB_PORT:-9451}"
    debug "Database URL: $DB_URL"
    
    debug "Sending request to create API key..."
    local response=$(curl -s -N \
        -H "Accept: application/json" \
        -H "NS: ${DB_NS}" \
        -H "DB: ${DB_DB}" \
        --user "root:root" \
        --data "
            CREATE apikeys SET 
                name = 'test_webhook_key',
                createdAt = time::now(),
                updatedAt = time::now();
        " \
        "$DB_URL/sql")
    
    debug "Database response: $response"
    
    # Extract the API key ID from the response
    local api_key_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$api_key_id" ]; then
        info "${GREEN}Successfully created test API key: $api_key_id${NC}"
        debug "API Key ID: $api_key_id"
        echo "$api_key_id"
        return 0
    else
        error "Failed to create API key"
        error "Response: $response"
        return 1
    fi
}

# Check if server is running
debug "Checking server status..."
if ! wait_for_server; then
    error "Error: Server is not running. Please start the server first:"
    error "npm run dev"
    exit 1
fi

# Create test API key
debug "Creating test API key..."
TEST_API_KEY=$(create_test_api_key)
if [ $? -ne 0 ]; then
    error "Failed to create test API key"
    exit 1
fi

# Export the API key for the test script
export TEST_API_KEY
debug "Exported TEST_API_KEY=$TEST_API_KEY"

# Run the tests
info "\n${YELLOW}Running webhook tests...${NC}"
debug "Executing test_blog_webhooks.sh"
"$(dirname "$0")/test_blog_webhooks.sh" 2>&1 | tee -a "$LOG_FILE"
TEST_EXIT_CODE=${PIPESTATUS[0]}
debug "Test script exit code: $TEST_EXIT_CODE"

# Cleanup
info "\n${YELLOW}Cleaning up...${NC}"
debug "Removing test API key from database..."
cleanup_response=$(curl -s -N \
    -H "Accept: application/json" \
    -H "NS: ${DB_NS}" \
    -H "DB: ${DB_DB}" \
    --user "root:root" \
    --data "DELETE FROM apikeys WHERE name = 'test_webhook_key';" \
    "${DB_HOST:-http://127.0.0.1}:${DB_PORT:-9451}/sql")
debug "Cleanup response: $cleanup_response"

info "${GREEN}Cleanup complete${NC}"
info "Log file: $LOG_FILE"

# Exit with the test script's exit code
debug "Exiting with code: $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE
