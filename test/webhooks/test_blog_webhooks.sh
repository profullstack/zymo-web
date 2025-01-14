#!/bin/bash

# Load environment variables
source "$(dirname "$0")/../../.env"
source "$(dirname "$0")/../../.env.local"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Inherit verbose mode from setup script
VERBOSE=${TEST_VERBOSE:-0}

# Debug logging function
debug() {
    if [ $VERBOSE -eq 1 ]; then
        echo -e "${BLUE}[DEBUG] $1${NC}"
    fi
}

# Test counter
TESTS_RUN=0
TESTS_PASSED=0

# Helper function to make HTTP requests and check responses
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=$5
    local expected_content=$6

    echo -e "\n${YELLOW}Running test: ${name}${NC}"
    debug "URL: $url"
    debug "Method: $method"
    debug "Request data: $data"
    TESTS_RUN=$((TESTS_RUN + 1))

    # Make the request and capture both headers and body
    debug "Sending request..."
    local response=$(curl -s -w "\n%{http_code}" \
        -X "$method" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$url")

    # Extract status code (last line) and body (everything else)
    local status_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed \$d)

    debug "Response status: $status_code"
    debug "Response body: $body"

    # Check status code
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ Status code matches: $status_code${NC}"
    else
        echo -e "${RED}✗ Status code mismatch. Expected: $expected_status, Got: $status_code${NC}"
        return 1
    fi

    # Check response content if specified
    if [ ! -z "$expected_content" ]; then
        debug "Checking for expected content: $expected_content"
        if echo "$body" | grep -q "$expected_content"; then
            echo -e "${GREEN}✓ Response content matches${NC}"
        else
            echo -e "${RED}✗ Response content mismatch${NC}"
            echo -e "Expected to contain: $expected_content"
            echo -e "Got: $body"
            return 1
        fi
    fi

    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
}

# Base URL and API Key
BASE_URL="${TEST_BASE_URL:-http://localhost:${PORT:-3000}}"
API_KEY="${TEST_API_KEY:-test_api_key}"  # Will be overridden by TEST_API_KEY env var

# Check required environment variables
if [ -z "$TEST_API_KEY" ]; then
    echo -e "${RED}Error: TEST_API_KEY environment variable is required${NC}"
    echo "Please set it before running the tests:"
    echo "export TEST_API_KEY=your_api_key"
    exit 1
fi

echo -e "${YELLOW}Using API Key: $API_KEY${NC}"
echo -e "${YELLOW}Using Base URL: $BASE_URL${NC}"

echo "Starting webhook tests..."

# Test 1: Publish a blog post
test_endpoint "Publish blog post" "POST" \
    "$BASE_URL/webhooks/publish/articles/$API_KEY" \
    '{
        "title": "Test Blog Post",
        "markdown": "# Test Content\n\nThis is a test blog post.",
        "tags": ["test", "automation"],
        "excerpt": "This is a test blog post"
    }' \
    200 '"success":true'

# Capture the post ID from the response for the notification test
if [ $? -eq 0 ]; then
    POST_ID=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    # Test 2: Send notification about the new post
    test_endpoint "Notify about blog post" "POST" \
        "$BASE_URL/webhooks/notify/$API_KEY" \
        "{
            \"postId\": \"$POST_ID\",
            \"customMessage\": \"Check out our new test blog post!\"
        }" \
        200 '"success":true'
fi

# Test 3: Try to publish with invalid API key
test_endpoint "Publish with invalid API key" "POST" \
    "$BASE_URL/webhooks/publish/articles/invalid_key" \
    '{
        "title": "Test Blog Post",
        "markdown": "# Test Content\n\nThis is a test blog post."
    }' \
    401 '"error":"Invalid API key"'

# Test 4: Try to publish without required fields
test_endpoint "Publish without required fields" "POST" \
    "$BASE_URL/webhooks/publish/articles/$API_KEY" \
    '{
        "title": "Test Blog Post"
    }' \
    400 '"error":"Title and content are required"'

# Test 5: Try to notify with non-existent post ID
test_endpoint "Notify with invalid post ID" "POST" \
    "$BASE_URL/webhooks/notify/$API_KEY" \
    '{
        "postId": "non_existent_post_id"
    }' \
    404 '"error":"Blog post not found"'

# Additional notification tests
# Test 6: Notify without post ID
test_endpoint "Notify without post ID" "POST" \
    "$BASE_URL/webhooks/notify/$API_KEY" \
    '{
        "customMessage": "This should fail without a post ID"
    }' \
    400 '"error":"Post ID is required"'

# Test 7: Notify with invalid API key
test_endpoint "Notify with invalid API key" "POST" \
    "$BASE_URL/webhooks/notify/invalid_key" \
    '{
        "postId": "any_id",
        "customMessage": "This should fail with invalid API key"
    }' \
    401 '"error":"Invalid API key"'

# Test 8: Notify with custom message
if [ ! -z "$POST_ID" ]; then
    test_endpoint "Notify with custom message" "POST" \
        "$BASE_URL/webhooks/notify/$API_KEY" \
        "{
            \"postId\": \"$POST_ID\",
            \"customMessage\": \"Special announcement: New blog post available!\"
        }" \
        200 '"success":true'
fi

# Test 9: Notify without custom message (should use default message)
if [ ! -z "$POST_ID" ]; then
    test_endpoint "Notify without custom message" "POST" \
        "$BASE_URL/webhooks/notify/$API_KEY" \
        "{
            \"postId\": \"$POST_ID\"
        }" \
        200 '"success":true'
fi

# Print test summary
echo -e "\n${YELLOW}Test Summary:${NC}"
echo -e "Total tests: $TESTS_RUN"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$((TESTS_RUN - TESTS_PASSED))${NC}"

# Exit with failure if any tests failed
[ $TESTS_RUN -eq $TESTS_PASSED ] || exit 1
