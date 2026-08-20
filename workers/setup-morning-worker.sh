#!/bin/bash

# Setup script for Morning Worker
# This script will:
# 1. Generate a TOTP secret and a session-signing secret
# 2. Create KV namespace for rate limiting
# 3. Update wrangler config with KV namespace ID
# 4. Set all required secrets
# 5. Deploy the worker
# 6. Print the one-time otpauth:// enrollment URI (scan this into your
#    authenticator app immediately - it is not saved anywhere else)

set -e  # Exit on error

echo "======================================================================"
echo "Morning Worker Setup"
echo "======================================================================"
echo ""

# Check if we're in the workers directory
if [ ! -f "wrangler-morning.toml" ]; then
    echo "Error: wrangler-morning.toml not found. Please run this script from the workers directory."
    exit 1
fi

# Step 1: Generate secrets
echo "Step 1: Generating Secrets"
echo "----------------------------------------------------------------------"

TOTP_SECRET=$(python3 -c "import os, base64; print(base64.b32encode(os.urandom(20)).decode('utf-8').rstrip('='))")
SESSION_SECRET=$(openssl rand -base64 32)

echo "✓ Generated TOTP_SECRET"
echo "✓ Generated SESSION_SECRET"
echo ""

# Step 2: Create KV namespace
echo "Step 2: Creating KV Namespace for Rate Limiting"
echo "----------------------------------------------------------------------"

KV_OUTPUT=$(wrangler kv namespace create "MORNING_RATE_LIMIT_KV" --config wrangler-morning.toml 2>&1)
echo "$KV_OUTPUT"

# Extract the namespace ID from output
KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | grep -o '"[^"]*"' | tr -d '"')

if [ -z "$KV_ID" ]; then
    echo ""
    echo "Warning: Could not extract KV namespace ID automatically."
    echo "Please check if the namespace already exists:"
    echo ""
    echo "  wrangler kv namespace list"
    echo ""
    read -p "Enter the KV namespace ID manually: " KV_ID
fi

echo "✓ KV Namespace ID: $KV_ID"
echo ""

# Step 3: Update wrangler config with KV namespace ID
echo "Step 3: Updating wrangler-morning.toml with KV namespace ID"
echo "----------------------------------------------------------------------"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/id = \"CREATE_NEW_KV_NAMESPACE_ID_HERE\"/id = \"$KV_ID\"/" wrangler-morning.toml
else
    # Linux
    sed -i "s/id = \"CREATE_NEW_KV_NAMESPACE_ID_HERE\"/id = \"$KV_ID\"/" wrangler-morning.toml
fi

echo "✓ Updated wrangler-morning.toml"
echo ""

# Step 4: Set secrets
echo "Step 4: Setting Worker Secrets"
echo "----------------------------------------------------------------------"

echo "$TOTP_SECRET" | wrangler secret put TOTP_SECRET --config wrangler-morning.toml
echo "✓ Set TOTP_SECRET"

echo "$SESSION_SECRET" | wrangler secret put SESSION_SECRET --config wrangler-morning.toml
echo "✓ Set SESSION_SECRET"
echo ""

# Step 5: Deploy worker
echo "Step 5: Deploying Worker"
echo "----------------------------------------------------------------------"

wrangler deploy --config wrangler-morning.toml

echo ""
echo "======================================================================"
echo "✓ Setup Complete!"
echo "======================================================================"
echo ""
echo "Your Morning worker is now deployed!"
echo ""
echo "Worker URL: https://morning-worker.arunhotra.workers.dev"
echo ""
echo "IMPORTANT: Scan this into your authenticator app NOW."
echo "It is only printed here, once - it is not saved anywhere else."
echo "----------------------------------------------------------------------"
OTPAUTH_URI="otpauth://totp/arunganti.com:morning?secret=${TOTP_SECRET}&issuer=arunganti.com&algorithm=SHA1&digits=6&period=30"
echo "$OTPAUTH_URI"
echo "----------------------------------------------------------------------"
echo ""
echo "Open Google Authenticator (or any RFC 6238-compatible app) and either:"
echo "  - Generate a QR code from the URI above and scan it, or"
echo "  - Use 'Enter setup key' and paste in the secret manually:"
echo "    $TOTP_SECRET"
echo ""
echo "Next steps:"
echo "1. Confirm morning.js's CONFIG.workerUrl matches the worker URL above"
echo "2. Test locally: python3 -m http.server 8000"
echo "3. Visit: http://localhost:8000/morning.html"
echo "4. Enter the current code from your authenticator app to confirm it works"
echo ""
echo "======================================================================"
