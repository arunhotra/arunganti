# P2P Library Worker Setup Instructions

## Quick Setup Guide

### Step 1: Get Google OAuth Refresh Token

1. **Visit this authorization URL in your browser:**

```
https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost&scope=https://www.googleapis.com/auth/drive.file&response_type=code&access_type=offline&prompt=consent
```

Replace `YOUR_CLIENT_ID` with your actual Google OAuth Client ID from the credentials JSON file.

2. **Sign in with your Google account** and grant permissions

3. **You'll be redirected to a URL like:**
   ```
   http://localhost/?code=4/0AcvDMrD...LONG_CODE_HERE...&scope=https://www.googleapis.com/auth/drive.file
   ```

4. **Copy the authorization code** (the part after `code=` and before `&scope`)

5. **Exchange the code for a refresh token:**

Run this command, replacing `YOUR_AUTH_CODE` with the code you copied:

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "code=YOUR_AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=http://localhost" \
  -d "grant_type=authorization_code"
```

Replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with values from your OAuth credentials file.

6. **Save the `refresh_token`** from the response (it starts with `1//`)

---

### Step 2: Deploy the Worker

Once you have the refresh token, run these commands:

```bash
cd /Users/arun/Documents/code/arunganti/workers

# Set the refresh token (replace with your actual token)
export GOOGLE_REFRESH_TOKEN='1//your-refresh-token-here'

# Run the setup script
./setup-p2plibrary-worker.sh
```

The script will:
- Create a KV namespace for rate limiting
- Set all required secrets
- Deploy the worker to Cloudflare

---

### Step 3: Update the Frontend

After deployment, the worker URL will be displayed. Update `p2plibrary.js`:

```javascript
// Change this line (around line 10):
workerUrl: 'https://p2plibrary-worker.arunhotra.workers.dev',
```

---

### Step 4: Test Locally

```bash
cd /Users/arun/Documents/code/arunganti
python3 -m http.server 8000
```

Visit: http://localhost:8000/p2plibrary.html

---

## Configuration Details

**Google Project:**
- Client ID: Found in your `client_secret_*.json` file
- Client Secret: Found in your `client_secret_*.json` file

**Google Drive Folder:**
- Folder ID: `1K5bhAsxDQ5nGdLbvUOXfS1I_xQLE0YD1`
- URL: https://drive.google.com/drive/folders/1K5bhAsxDQ5nGdLbvUOXfS1I_xQLE0YD1
- Permissions: Anyone with the link can access

**Worker Configuration:**
- Name: `p2plibrary-worker`
- Config: `wrangler-p2plibrary.toml`

---

## Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Create KV Namespace

```bash
wrangler kv:namespace create "RATE_LIMIT_KV" --config wrangler-p2plibrary.toml
```

Copy the namespace ID and update `wrangler-p2plibrary.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_NAMESPACE_ID_HERE"  # Replace this
```

### 2. Set Secrets

```bash
# Google OAuth credentials (from your client_secret_*.json file)
echo "YOUR_CLIENT_ID" | \
  wrangler secret put GOOGLE_CLIENT_ID --config wrangler-p2plibrary.toml

echo "YOUR_CLIENT_SECRET" | \
  wrangler secret put GOOGLE_CLIENT_SECRET --config wrangler-p2plibrary.toml

echo "YOUR_REFRESH_TOKEN" | \
  wrangler secret put GOOGLE_REFRESH_TOKEN --config wrangler-p2plibrary.toml

# Google Drive folder
echo "1K5bhAsxDQ5nGdLbvUOXfS1I_xQLE0YD1" | \
  wrangler secret put GOOGLE_DRIVE_FOLDER_ID --config wrangler-p2plibrary.toml

# Deletion password (make up a secure password)
echo "your-secure-password-here" | \
  wrangler secret put DELETION_SECRET --config wrangler-p2plibrary.toml
```

### 3. Deploy

```bash
wrangler deploy --config wrangler-p2plibrary.toml
```

---

## Troubleshooting

### "Invalid authorization code"
- The authorization code expires quickly (minutes)
- Get a fresh code by visiting the authorization URL again

### "KV namespace already exists"
- List existing namespaces: `wrangler kv:namespace list`
- Find the one for p2plibrary and use its ID in the config

### "Worker deployment failed"
- Check that all secrets are set: `wrangler secret list --config wrangler-p2plibrary.toml`
- Verify you're logged into Wrangler: `wrangler whoami`

### "Failed to fetch books"
- Check the browser console for errors
- Verify the worker URL in `p2plibrary.js` matches your deployed worker
- Test the worker directly: `curl https://p2plibrary-worker.arunhotra.workers.dev/items`

---

## Next Steps

Once everything is working:

1. **Test the upload flow:**
   - Take a photo of a book
   - Enter title, author, and summary
   - Upload and verify it appears in the gallery

2. **Test borrowing status:**
   - Toggle a book between Available and Borrowed
   - Verify the badge updates correctly

3. **Test comments:**
   - Add a comment to a book
   - Verify it appears in the comments list

4. **Test deletion:**
   - Try to delete a book
   - Use the deletion password saved during setup

5. **Deploy to production:**
   - Push your code to GitHub
   - Update your production site with the new files
