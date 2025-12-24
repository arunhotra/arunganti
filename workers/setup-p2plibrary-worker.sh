#!/bin/bash

# Setup script for P2P Library Worker
# This script will:
# 1. Create KV namespace
# 2. Update wrangler config with KV namespace ID
# 3. Set all required secrets
# 4. Deploy the worker

set -e  # Exit on error

echo "======================================================================"
echo "P2P Library Worker Setup"
echo "======================================================================"
echo ""

# Configuration - UPDATE THESE WITH YOUR VALUES
CLIENT_ID="${GOOGLE_CLIENT_ID:-YOUR_CLIENT_ID}"
CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-YOUR_CLIENT_SECRET}"
FOLDER_ID="${GOOGLE_DRIVE_FOLDER_ID:-YOUR_FOLDER_ID}"

# Check if we're in the workers directory
if [ ! -f "wrangler-p2plibrary.toml" ]; then
    echo "Error: wrangler-p2plibrary.toml not found. Please run this script from the workers directory."
    exit 1
fi

# Step 1: Get refresh token
echo "Step 1: Getting Google OAuth Refresh Token"
echo "----------------------------------------------------------------------"

if [ -z "$GOOGLE_REFRESH_TOKEN" ]; then
    echo ""
    echo "You need to get a refresh token first. Please run:"
    echo ""
    echo "  node get-google-refresh-token.js"
    echo ""
    echo "Follow the instructions, then set the refresh token:"
    echo ""
    echo "  export GOOGLE_REFRESH_TOKEN='your-refresh-token-here'"
    echo ""
    echo "Then run this script again."
    echo ""
    exit 1
fi

echo "✓ Refresh token found in environment"
echo ""

# Step 2: Create KV namespace
echo "Step 2: Creating KV Namespace for Rate Limiting"
echo "----------------------------------------------------------------------"

KV_OUTPUT=$(wrangler kv:namespace create "RATE_LIMIT_KV" --config wrangler-p2plibrary.toml 2>&1)
echo "$KV_OUTPUT"

# Extract the namespace ID from output
KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | grep -o '"[^"]*"' | tr -d '"')

if [ -z "$KV_ID" ]; then
    echo ""
    echo "Warning: Could not extract KV namespace ID automatically."
    echo "Please check if the namespace already exists:"
    echo ""
    echo "  wrangler kv:namespace list"
    echo ""
    read -p "Enter the KV namespace ID manually: " KV_ID
fi

echo "✓ KV Namespace ID: $KV_ID"
echo ""

# Step 3: Update wrangler config with KV namespace ID
echo "Step 3: Updating wrangler-p2plibrary.toml with KV namespace ID"
echo "----------------------------------------------------------------------"

# Use sed to replace the placeholder
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/id = \"CREATE_NEW_KV_NAMESPACE_ID_HERE\"/id = \"$KV_ID\"/" wrangler-p2plibrary.toml
else
    # Linux
    sed -i "s/id = \"CREATE_NEW_KV_NAMESPACE_ID_HERE\"/id = \"$KV_ID\"/" wrangler-p2plibrary.toml
fi

echo "✓ Updated wrangler-p2plibrary.toml"
echo ""

# Step 4: Set secrets
echo "Step 4: Setting Worker Secrets"
echo "----------------------------------------------------------------------"

echo "$CLIENT_ID" | wrangler secret put GOOGLE_CLIENT_ID --config wrangler-p2plibrary.toml
echo "✓ Set GOOGLE_CLIENT_ID"

echo "$CLIENT_SECRET" | wrangler secret put GOOGLE_CLIENT_SECRET --config wrangler-p2plibrary.toml
echo "✓ Set GOOGLE_CLIENT_SECRET"

echo "$GOOGLE_REFRESH_TOKEN" | wrangler secret put GOOGLE_REFRESH_TOKEN --config wrangler-p2plibrary.toml
echo "✓ Set GOOGLE_REFRESH_TOKEN"

echo "$FOLDER_ID" | wrangler secret put GOOGLE_DRIVE_FOLDER_ID --config wrangler-p2plibrary.toml
echo "✓ Set GOOGLE_DRIVE_FOLDER_ID"

# Generate a random deletion password
DELETION_SECRET=$(openssl rand -base64 32)
echo "$DELETION_SECRET" | wrangler secret put DELETION_SECRET --config wrangler-p2plibrary.toml
echo "✓ Set DELETION_SECRET"

echo ""
echo "IMPORTANT: Save this deletion password!"
echo "----------------------------------------------------------------------"
echo "Deletion Password: $DELETION_SECRET"
echo "----------------------------------------------------------------------"
echo "You'll need this password to delete books from the library."
echo "Save it somewhere safe!"
echo ""

# Step 5: Deploy worker
echo "Step 5: Deploying Worker"
echo "----------------------------------------------------------------------"

wrangler deploy --config wrangler-p2plibrary.toml

echo ""
echo "======================================================================"
echo "✓ Setup Complete!"
echo "======================================================================"
echo ""
echo "Your P2P Library worker is now deployed!"
echo ""
echo "Worker URL: https://p2plibrary-worker.arunhotra.workers.dev"
echo ""
echo "Next steps:"
echo "1. Update p2plibrary.js with the worker URL above"
echo "2. Test locally: python3 -m http.server 8000"
echo "3. Visit: http://localhost:8000/p2plibrary.html"
echo ""
echo "======================================================================"
