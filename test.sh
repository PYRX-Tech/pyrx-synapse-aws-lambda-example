#!/usr/bin/env bash
set -uo pipefail
echo "AWS Lambda example requires SAM CLI for local testing."
echo "Install: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
echo ""

if ! command -v sam &> /dev/null; then
  echo "⏭  SAM CLI not found — skipping (manual test required)"
  echo "  Run: sam local start-api --port 3001 --env-vars env.json"
  exit 0
fi

source "$(dirname "$0")/../test-helpers.sh"
[[ -z "${SYNAPSE_API_KEY:-}" ]] && echo "Set SYNAPSE_API_KEY" && exit 1
BASE_URL="http://localhost:3001"

echo "Installing & building..."
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1

cat > /tmp/sam-env.json << ENVEOF
{ "Parameters": { "SynapseApiKey": "$SYNAPSE_API_KEY", "SynapseWorkspaceId": "$SYNAPSE_WORKSPACE_ID" } }
ENVEOF

echo "Starting SAM local API on port 3001..."
sam local start-api --port 3001 --env-vars /tmp/sam-env.json > /dev/null 2>&1 &
SERVER_PID=$!
trap "kill $SERVER_PID 2>/dev/null; wait $SERVER_PID 2>/dev/null; rm -f /tmp/sam-env.json" EXIT

wait_for_server "$BASE_URL" 30 || exit 1
echo "Server ready. Running tests..."

echo "── Core ──"
test_endpoint POST /api/track '{"userId":"test_u","event":"test_event","attributes":{}}'
test_endpoint POST /api/identify '{"userId":"test_u","email":"test@example.com"}'

echo "── Contacts ──"
test_endpoint GET /api/contacts
test_endpoint GET /api/contacts/test_u

echo "── Templates ──"
test_endpoint GET /api/templates

print_results
