/**
 * TOTP (RFC 6238) verification and session token signing.
 * Pure functions, no npm dependencies - relies only on the Web Crypto API
 * (available natively in Cloudflare Workers and modern Node).
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ============================================================================
// Base32 (RFC 4648) - conventional encoding for TOTP secrets
// ============================================================================

function base32Decode(base32) {
    const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
    let bits = '';
    for (const char of clean) {
        const val = BASE32_ALPHABET.indexOf(char);
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    return new Uint8Array(bytes);
}

// ============================================================================
// Base64url - used for the session token's payload/signature segments
// ============================================================================

function base64UrlEncode(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// ============================================================================
// HOTP / TOTP (RFC 4226 / RFC 6238), HMAC-SHA1 - matches Google Authenticator
// and other RFC 6238-compatible apps
// ============================================================================

async function hotp(secretBytes, counter, digits = 6) {
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(0, Math.floor(counter / 2 ** 32), false);
    counterView.setUint32(4, counter >>> 0, false);

    const key = await crypto.subtle.importKey(
        'raw',
        secretBytes,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );
    const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterBuffer));

    const offset = hmac[hmac.length - 1] & 0x0f;
    const binCode =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    return (binCode % 10 ** digits).toString().padStart(digits, '0');
}

/**
 * Verify a submitted 6-digit code against a base32 TOTP secret.
 * Checks a +/-1 step window (30s period) to absorb clock drift.
 */
async function verifyTOTP(secretBase32, submittedCode, periodSeconds = 30, window = 1) {
    if (!secretBase32 || !submittedCode || !/^\d{6}$/.test(submittedCode)) {
        return false;
    }

    const secretBytes = base32Decode(secretBase32);
    const counter = Math.floor(Date.now() / 1000 / periodSeconds);

    for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
        const candidate = await hotp(secretBytes, counter + errorWindow, 6);
        if (candidate === submittedCode) return true;
    }
    return false;
}

// ============================================================================
// Session tokens - HMAC-SHA256 signed, stateless (expiry embedded in payload)
// ============================================================================

async function issueSessionToken(sessionSecret) {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    const payload = { iat: Date.now(), exp: expiresAt };
    const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(sessionSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
    const sigB64 = base64UrlEncode(new Uint8Array(sigBuffer));

    return { token: `${payloadB64}.${sigB64}`, expiresAt };
}

async function verifySessionToken(token, sessionSecret) {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
        return false;
    }

    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) {
        return false;
    }

    try {
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(sessionSecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
        const expectedSig = base64UrlDecode(sigB64);
        const valid = await crypto.subtle.verify(
            'HMAC', key, expectedSig, new TextEncoder().encode(payloadB64)
        );
        if (!valid) return false;

        const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
        return typeof payload.exp === 'number' && payload.exp > Date.now();
    } catch (error) {
        return false;
    }
}

module.exports = {
    base32Decode,
    hotp,
    verifyTOTP,
    base64UrlEncode,
    base64UrlDecode,
    issueSessionToken,
    verifySessionToken,
    SESSION_DURATION_MS
};
