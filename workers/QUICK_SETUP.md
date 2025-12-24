# P2P Library - Quick Setup

## 🚀 Three Simple Steps

### 1️⃣ Get Refresh Token

Visit this URL and sign in:
```
https://accounts.google.com/o/oauth2/auth?client_id=141335757100-ps332qpv55q2jlmh5dl3rm6fhergqv8p.apps.googleusercontent.com&redirect_uri=http://localhost&scope=https://www.googleapis.com/auth/drive.file&response_type=code&access_type=offline&prompt=consent
```

After authorization, copy the `code` from the redirect URL and run:

```bash
# Get CLIENT_ID and CLIENT_SECRET from your client_secret_*.json file
curl -X POST https://oauth2.googleapis.com/token \
  -d "code=PASTE_YOUR_CODE_HERE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=http://localhost" \
  -d "grant_type=authorization_code"
```

Copy the `refresh_token` value from the response.

---

### 2️⃣ Deploy Worker

```bash
cd /Users/arun/Documents/code/arunganti/workers

# Set your refresh token
export GOOGLE_REFRESH_TOKEN='paste-refresh-token-here'

# Run setup
./setup-p2plibrary-worker.sh
```

**Save the deletion password** that the script outputs!

---

### 3️⃣ Test It

```bash
cd /Users/arun/Documents/code/arunganti
python3 -m http.server 8000
```

Open: http://localhost:8000/p2plibrary.html

---

## ✅ That's It!

Your P2P Library is now live. Upload a book to test!

---

## 📝 Configuration Summary

- **Google Drive Folder:** [Your folder ID](https://drive.google.com/drive/folders/YOUR_FOLDER_ID)
- **Worker URL:** https://p2plibrary-worker.arunhotra.workers.dev
- **Credentials:** Found in your `client_secret_*.json` file

---

## 🆘 Need Help?

See `SETUP_INSTRUCTIONS.md` for detailed troubleshooting.
