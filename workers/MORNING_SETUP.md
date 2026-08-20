# Morning Page - Setup & Architecture

`morning.html` is a private, passcode-gated page. It's not linked from
anywhere on the site (no nav link, not listed on `personal-projects.html`) -
it's only reachable by knowing the direct URL, and even then it shows
nothing until you enter a valid code. For now, the content behind the
gate is just a placeholder ("Coming soon"); real content (news, calendar,
current projects, etc.) gets added later without changing the auth.

## What was built

| Piece | File | Purpose |
|---|---|---|
| Page shell | `morning.html`, `morning.css` | Passcode form + hidden content area, same glassmorphism style as the rest of the site |
| Client logic | `morning.js` | Talks to the worker, stores the session token, decides form-vs-content on load |
| Worker | `workers/morning-worker.js` | Verifies codes, issues/checks session tokens, rate-limits attempts |
| TOTP/crypto | `workers/totp.js` | Pure RFC 6238 TOTP + token signing functions (unit tested against official test vectors) |
| Deploy config | `workers/wrangler-morning.toml` | Cloudflare Worker + KV namespace binding |
| One-time setup | `workers/setup-morning-worker.sh` | Generates secrets, deploys the worker, prints the QR enrollment URI |
| Tests | `__tests__/morning.test.js`, `__tests__/totp.test.js` | DOM, auth flow, accessibility, and TOTP algorithm correctness |

There is no username or password - just a 6-digit code from an
authenticator app (Google Authenticator, or anything else that speaks
RFC 6238).

## Why it's built this way

The site is fully static - anyone can download `morning.html`/`morning.js`
directly regardless of what the client-side JavaScript does. So the page
itself can never be the thing that "hides" content. All it does is show a
form and, later, render whatever a Worker gives it. The actual gate is
server-side: the Worker only ever returns real content in response to a
request carrying a session token it can verify.

## Auth flow

1. **First visit** (no stored token): `morning.js` shows the passcode
   form and waits.
2. **User enters a 6-digit code, submits.** Client `POST`s
   `{ code }` to `${workerUrl}/verify`.
3. **Worker checks the code.** It recomputes the current TOTP value
   from `TOTP_SECRET` (allowing one 30-second step of drift in either
   direction) and compares it to what was submitted.
   - Wrong code → `401`, and the attempt counts against a rate limit
     (5 attempts / 15 minutes per IP, stored in Workers KV).
   - Too many attempts → `429`, distinct error message client-side.
   - Correct code → the worker signs a session token (HMAC-SHA256 over
     `{iat, exp}`, `exp` = 30 days out) and returns it as
     `{ token, expiresAt }`.
4. **Client stores the token** in `localStorage` and immediately calls
   `GET ${workerUrl}/content` with `Authorization: Bearer <token>`.
5. **Worker verifies the token** (signature + not-expired) and returns
   the content payload - today just `{ placeholder: true, message: "..." }`.
6. **Later visits**, as long as the stored token hasn't expired: the
   client skips the form entirely and goes straight to step 4. The
   client-side expiry check here is just a UX shortcut - the worker is
   the real source of truth and independently re-verifies the token
   signature and expiry on every `/content` call.
7. **Logout**: clears the token from `localStorage` and shows the form
   again. Nothing to revoke server-side, since tokens are stateless
   (no session store - the expiry is baked into the signed token
   itself).

There's no cookie involved anywhere - the worker
(`morning-worker.arunhotra.workers.dev`) and the site (`arunganti.com`)
are different origins, and this repo has never used cookies, so a bearer
token in `localStorage` was the natural fit.

## One-time setup (already done)

```bash
cd workers
./setup-morning-worker.sh
```

This generates a random `TOTP_SECRET` (base32) and `SESSION_SECRET`,
creates a dedicated `MORNING_RATE_LIMIT_KV` namespace (its own namespace,
separate from the one giveaway/p2plibrary share - KV namespace *titles*
are unique per Cloudflare account, so it can't reuse their `RATE_LIMIT_KV`
title even though the *binding name* in code is the same), sets both
secrets via `wrangler secret put`, deploys the worker, and prints an
`otpauth://...` URI **once** - that's what you scan into your
authenticator app. It is never written to a file or logged anywhere else,
so if you miss it, see "Rotating the secret" below.

Note: if you ever re-run this on a machine with an older Wrangler CLI,
the KV creation step uses `wrangler kv namespace create` (space, not the
older `wrangler kv:namespace create` colon syntax) - older Wrangler
versions may need the colon form instead.

## Rotating the secret

If you lose the QR/URI, or just want a fresh secret:

```bash
cd workers
NEW_SECRET=$(python3 -c "import os, base64; print(base64.b32encode(os.urandom(20)).decode('utf-8').rstrip('='))")
echo "$NEW_SECRET" | wrangler secret put TOTP_SECRET --config wrangler-morning.toml
echo "otpauth://totp/arunganti.com:morning?secret=${NEW_SECRET}&issuer=arunganti.com&algorithm=SHA1&digits=6&period=30"
```

Scan the printed URI into your authenticator app immediately, then remove
the old entry from the app.

## Extending it with real content

The seam is `handleContent()` in `workers/morning-worker.js` - it's the
only place that needs to change. Once a request's token is verified, swap
the placeholder response body for whatever you want to show (news,
today's/this week's calendar events, current projects, etc.). Nothing
about the auth contract, `morning.js`, or `morning.html` needs to change
for that.

## Testing without touching production

- `npx jest __tests__/totp.test.js __tests__/morning.test.js` - unit/DOM
  tests, no deploy needed.
- `python3 -m http.server 8000` and visit
  `http://localhost:8000/morning.html` - exercises the real deployed
  worker end-to-end (the worker's CORS allowlist already includes
  `http://localhost:8000`).
