/**
 * Morning Worker - TOTP passcode gate for the private /morning page
 *
 * Environment Variables (set via wrangler secret put):
 * - TOTP_SECRET: base32-encoded TOTP secret (scanned into an authenticator app)
 * - SESSION_SECRET: random key used to sign session tokens
 *
 * KV Namespace: RATE_LIMIT_KV (for rate limiting /verify attempts)
 */

import {
    verifyTOTP,
    issueSessionToken,
    verifySessionToken
} from './totp.js';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    corsOrigins: ['https://arunhotra.com', 'http://localhost:8000'],
    rateLimit: {
        maxAttempts: 5,
        windowMinutes: 15
    },
    totp: {
        period: 30,
        window: 1
    }
};

// ============================================================================
// Main Request Handler
// ============================================================================

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return handleCORS(request);
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            let response;

            if (path === '/verify' && request.method === 'POST') {
                response = await handleVerify(request, env);
            } else if (path === '/content' && request.method === 'GET') {
                response = await handleContent(request, env);
            } else {
                response = new Response('Not Found', { status: 404 });
            }

            return addCORSHeaders(response, request);

        } catch (error) {
            console.error('Worker error:', error);
            return addCORSHeaders(
                new Response(
                    JSON.stringify({ error: error.message || 'Internal server error' }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                ),
                request
            );
        }
    }
};

// ============================================================================
// Verify Handler
// ============================================================================

async function handleVerify(request, env) {
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `verify:${clientIP}`;

    if (env.RATE_LIMIT_KV) {
        const isRateLimited = await checkRateLimit(rateLimitKey, env.RATE_LIMIT_KV);
        if (isRateLimited) {
            return new Response(
                JSON.stringify({ error: 'Too many attempts. Please wait and try again.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    const body = await request.json().catch(() => ({}));
    const code = body.code;

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
        return new Response(
            JSON.stringify({ error: 'Please enter a valid 6-digit code' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const isValid = await verifyTOTP(env.TOTP_SECRET, code, CONFIG.totp.period, CONFIG.totp.window);

    if (!isValid) {
        if (env.RATE_LIMIT_KV) {
            await incrementRateLimit(rateLimitKey, env.RATE_LIMIT_KV);
        }
        return new Response(
            JSON.stringify({ error: 'Invalid code' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const { token, expiresAt } = await issueSessionToken(env.SESSION_SECRET);

    return new Response(
        JSON.stringify({ success: true, token, expiresAt }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
}

// ============================================================================
// Content Handler
// ============================================================================

async function handleContent(request, env) {
    const authHeader = request.headers.get('Authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/);

    if (!match) {
        return new Response(
            JSON.stringify({ error: 'Missing or invalid authorization' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const isValid = await verifySessionToken(match[1], env.SESSION_SECRET);

    if (!isValid) {
        return new Response(
            JSON.stringify({ error: 'Session expired or invalid' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Placeholder response - this is the seam where real content
    // (news, calendar, projects, etc.) gets added later without
    // touching the auth contract above.
    return new Response(
        JSON.stringify({
            placeholder: true,
            message: "Coming soon — this section isn't built yet."
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
}

// ============================================================================
// Rate Limiting
// ============================================================================

async function checkRateLimit(key, kv) {
    try {
        const data = await kv.get(key);
        if (!data) {
            return false;
        }

        const { count, expiry } = JSON.parse(data);
        const now = Date.now();

        if (now > expiry) {
            await kv.delete(key);
            return false;
        }

        return count >= CONFIG.rateLimit.maxAttempts;

    } catch (error) {
        console.error('Rate limit check error:', error);
        return false; // Allow on error
    }
}

async function incrementRateLimit(key, kv) {
    try {
        const data = await kv.get(key);
        const now = Date.now();
        const windowMs = CONFIG.rateLimit.windowMinutes * 60 * 1000;

        let count = 1;
        let expiry = now + windowMs;

        if (data) {
            const existing = JSON.parse(data);
            if (now < existing.expiry) {
                count = existing.count + 1;
                expiry = existing.expiry;
            }
        }

        await kv.put(
            key,
            JSON.stringify({ count, expiry }),
            { expirationTtl: CONFIG.rateLimit.windowMinutes * 60 }
        );

    } catch (error) {
        console.error('Rate limit increment error:', error);
    }
}

// ============================================================================
// CORS Handling - unlike the other workers, this one actually enforces
// the origin allowlist since it issues/checks credentials.
// ============================================================================

function getAllowedOrigin(request) {
    const origin = request.headers.get('Origin');
    return CONFIG.corsOrigins.includes(origin) ? origin : CONFIG.corsOrigins[0];
}

function handleCORS(request) {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': getAllowedOrigin(request),
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
            'Vary': 'Origin'
        }
    });
}

function addCORSHeaders(response, request) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', getAllowedOrigin(request));
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    newResponse.headers.set('Vary', 'Origin');
    return newResponse;
}
