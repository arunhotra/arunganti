/**
 * @jest-environment node
 */

const {
    base32Decode,
    hotp,
    verifyTOTP,
    base64UrlEncode,
    base64UrlDecode,
    issueSessionToken,
    verifySessionToken
} = require('../workers/totp.js');

describe('hotp - RFC 6238 Appendix B test vectors (SHA1, truncated to 6 digits)', () => {
    const secretBytes = new TextEncoder().encode('12345678901234567890');

    const vectors = [
        { counter: 1, expected: '287082' },
        { counter: 37037036, expected: '081804' },
        { counter: 37037037, expected: '050471' },
        { counter: 41152263, expected: '005924' },
        { counter: 66666666, expected: '279037' },
        { counter: 666666666, expected: '353130' }
    ];

    test.each(vectors)('counter $counter produces $expected', async ({ counter, expected }) => {
        const code = await hotp(secretBytes, counter, 6);
        expect(code).toBe(expected);
    });
});

describe('base32Decode', () => {
    test('decodes a known base32 string back to the expected bytes', () => {
        const encoded = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
        const decoded = base32Decode(encoded);
        expect(new TextDecoder().decode(decoded)).toBe('12345678901234567890');
    });

    test('ignores case and stray characters', () => {
        const lower = base32Decode('gezdgnbvgy3tqojq');
        const upper = base32Decode('GEZDGNBVGY3TQOJQ');
        expect(Array.from(lower)).toEqual(Array.from(upper));
    });
});

describe('verifyTOTP', () => {
    const secretBase32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

    test('rejects malformed or empty codes without throwing', async () => {
        expect(await verifyTOTP(secretBase32, 'abcdef')).toBe(false);
        expect(await verifyTOTP(secretBase32, '12345')).toBe(false);
        expect(await verifyTOTP(secretBase32, '')).toBe(false);
        expect(await verifyTOTP(secretBase32, null)).toBe(false);
    });

    test('accepts the current valid code for a known secret', async () => {
        const secretBytes = base32Decode(secretBase32);
        const counter = Math.floor(Date.now() / 1000 / 30);
        const currentCode = await hotp(secretBytes, counter, 6);

        expect(await verifyTOTP(secretBase32, currentCode)).toBe(true);
    });

    test('accepts a code one step in the past or future (clock drift window)', async () => {
        const secretBytes = base32Decode(secretBase32);
        const counter = Math.floor(Date.now() / 1000 / 30);

        const pastCode = await hotp(secretBytes, counter - 1, 6);
        const futureCode = await hotp(secretBytes, counter + 1, 6);

        expect(await verifyTOTP(secretBase32, pastCode)).toBe(true);
        expect(await verifyTOTP(secretBase32, futureCode)).toBe(true);
    });

    test('rejects a code far outside the time window', async () => {
        const secretBytes = base32Decode(secretBase32);
        const counter = Math.floor(Date.now() / 1000 / 30);
        const farCode = await hotp(secretBytes, counter + 100, 6);

        expect(await verifyTOTP(secretBase32, farCode)).toBe(false);
    });
});

describe('base64UrlEncode / base64UrlDecode', () => {
    test('round-trips arbitrary bytes without padding or unsafe characters', () => {
        const original = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255, 62, 63]);
        const encoded = base64UrlEncode(original);

        expect(encoded).not.toMatch(/[+/=]/);
        expect(Array.from(base64UrlDecode(encoded))).toEqual(Array.from(original));
    });
});

describe('issueSessionToken / verifySessionToken', () => {
    const secret = 'test-session-secret';

    test('issues a token that verifies successfully', async () => {
        const { token, expiresAt } = await issueSessionToken(secret);

        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(2);
        expect(expiresAt).toBeGreaterThan(Date.now());
        expect(await verifySessionToken(token, secret)).toBe(true);
    });

    test('rejects a token signed with a different secret', async () => {
        const { token } = await issueSessionToken(secret);
        expect(await verifySessionToken(token, 'wrong-secret')).toBe(false);
    });

    test('rejects a tampered payload', async () => {
        const { token } = await issueSessionToken(secret);
        const [, sig] = token.split('.');
        const forgedPayload = base64UrlEncode(
            new TextEncoder().encode(JSON.stringify({ exp: Date.now() + 999999999 }))
        );

        expect(await verifySessionToken(`${forgedPayload}.${sig}`, secret)).toBe(false);
    });

    test('rejects an expired token even with a valid signature', async () => {
        const payload = { iat: Date.now() - 2000, exp: Date.now() - 1000 };
        const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));

        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
        const sigB64 = base64UrlEncode(new Uint8Array(sigBuffer));

        expect(await verifySessionToken(`${payloadB64}.${sigB64}`, secret)).toBe(false);
    });

    test('rejects malformed tokens without throwing', async () => {
        expect(await verifySessionToken('not-a-token', secret)).toBe(false);
        expect(await verifySessionToken('', secret)).toBe(false);
        expect(await verifySessionToken(null, secret)).toBe(false);
    });
});
