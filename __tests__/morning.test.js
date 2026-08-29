/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
    path.resolve(__dirname, '../morning.html'),
    'utf8'
);

describe('Morning Page - DOM Structure', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('page has correct title', () => {
        const title = document.querySelector('title');
        expect(title).toBeTruthy();
        expect(title.textContent).toContain('Morning');
    });

    test('page is not indexed by search engines', () => {
        const robots = document.querySelector('meta[name="robots"]');
        expect(robots).toBeTruthy();
        expect(robots.getAttribute('content')).toContain('noindex');
    });

    test('page includes shared-styles.css', () => {
        expect(document.querySelector('link[href="shared-styles.css"]')).toBeTruthy();
    });

    test('page includes morning.css', () => {
        expect(document.querySelector('link[href="morning.css"]')).toBeTruthy();
    });

    test('page has fixed background element', () => {
        const background = document.querySelector('.hero-background');
        expect(background).toBeTruthy();
        expect(background.classList.contains('morning-bg')).toBe(true);
    });

    test('page has back navigation to index.html', () => {
        const backLink = document.querySelector('.back-nav .back-link');
        expect(backLink).toBeTruthy();
        expect(backLink.getAttribute('href')).toBe('index.html');
    });

    test('page has main tool container', () => {
        const container = document.querySelector('.tool-container');
        expect(container).toBeTruthy();
        expect(container.tagName).toBe('MAIN');
    });

    test('page has header with title', () => {
        const header = document.querySelector('.tool-header');
        expect(header).toBeTruthy();
        const h1 = header.querySelector('h1');
        expect(h1).toBeTruthy();
    });

    test('page loads morning.js script with version', () => {
        const script = document.querySelector('script[src^="morning.js"]');
        expect(script).toBeTruthy();
        expect(script.getAttribute('src')).toMatch(/morning\.js\?v=/);
    });
});

describe('Morning Page - Passcode Form', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('passcode form exists', () => {
        const form = document.getElementById('passcodeForm');
        expect(form).toBeTruthy();
        expect(form.tagName).toBe('FORM');
    });

    test('passcode input has correct attributes', () => {
        const input = document.getElementById('passcodeInput');
        expect(input).toBeTruthy();
        expect(input.getAttribute('inputmode')).toBe('numeric');
        expect(input.getAttribute('maxlength')).toBe('6');
        expect(input.getAttribute('pattern')).toBe('[0-9]*');
    });

    test('passcode input has an associated label', () => {
        const input = document.getElementById('passcodeInput');
        const label = document.querySelector('label[for="passcodeInput"]');
        expect(label).toBeTruthy();
        expect(input).toBeTruthy();
    });

    test('verify button exists', () => {
        const button = document.getElementById('verifyBtn');
        expect(button).toBeTruthy();
        expect(button.tagName).toBe('BUTTON');
        expect(button.classList.contains('btn-primary')).toBe(true);
    });

    test('error state container exists with a live region', () => {
        const errorState = document.getElementById('passcodeError');
        expect(errorState).toBeTruthy();
        expect(errorState.getAttribute('aria-live')).toBe('polite');
    });

    test('loading state container exists', () => {
        expect(document.getElementById('verifyLoading')).toBeTruthy();
    });
});

describe('Morning Page - Protected Content Section', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('content section exists and is hidden by default', () => {
        const section = document.getElementById('contentSection');
        expect(section).toBeTruthy();
        expect(section.style.display).toBe('none');
    });

    test('logout button exists inside the content section', () => {
        const section = document.getElementById('contentSection');
        const logoutBtn = section.querySelector('#logoutBtn');
        expect(logoutBtn).toBeTruthy();
    });

    test('dating events card exists inside the content section and is hidden by default', () => {
        const section = document.getElementById('contentSection');
        const card = section.querySelector('#datingEventsCard');
        expect(card).toBeTruthy();
        expect(card.style.display).toBe('none');
        expect(card.querySelector('#datingEventsList')).toBeTruthy();
    });
});

describe('Morning Page - Accessibility', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('passcode input is keyboard accessible', () => {
        const input = document.getElementById('passcodeInput');
        expect(input.tabIndex).not.toBe(-1);
    });

    test('verify button is keyboard accessible', () => {
        const button = document.getElementById('verifyBtn');
        expect(button.tabIndex).not.toBe(-1);
    });

    test('back link is keyboard accessible', () => {
        const backLink = document.querySelector('.back-link');
        expect(backLink.tabIndex).not.toBe(-1);
    });
});

// ============================================================================
// Client-side logic (mocking fetch and localStorage)
// ============================================================================

function seedTokenWithExpiry(expMillis) {
    const payload = { iat: Date.now(), exp: expMillis };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${payloadB64}.fakesignature`;
}

describe('morning.js - Token helpers', () => {
    let morningJs;

    beforeEach(() => {
        document.documentElement.innerHTML = html;
        localStorage.clear();
        jest.resetModules();
        morningJs = require('../morning.js');
    });

    test('storeToken/getStoredToken round-trip through localStorage', () => {
        morningJs.storeToken('abc.def');
        expect(morningJs.getStoredToken()).toBe('abc.def');
    });

    test('clearToken removes the stored token', () => {
        morningJs.storeToken('abc.def');
        morningJs.clearToken();
        expect(morningJs.getStoredToken()).toBeNull();
    });

    test('isTokenExpired returns true for an expired token', () => {
        const expired = seedTokenWithExpiry(Date.now() - 60000);
        expect(morningJs.isTokenExpired(expired)).toBe(true);
    });

    test('isTokenExpired returns false for an unexpired token', () => {
        const valid = seedTokenWithExpiry(Date.now() + 60000);
        expect(morningJs.isTokenExpired(valid)).toBe(false);
    });

    test('isTokenExpired returns true for malformed tokens', () => {
        expect(morningJs.isTokenExpired('not-a-token')).toBe(true);
        expect(morningJs.isTokenExpired('')).toBe(true);
        expect(morningJs.isTokenExpired(null)).toBe(true);
    });
});

describe('morning.js - Auth flow (Integration)', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
        localStorage.clear();
        jest.resetModules();
    });

    test('shows the passcode form on load when no token is stored', () => {
        global.fetch = jest.fn();
        require('../morning.js');

        expect(document.getElementById('passcodeForm').style.display).toBe('block');
        expect(document.getElementById('contentSection').style.display).toBe('none');
    });

    test('skips the form and fetches content when a valid token is stored', () => {
        const valid = seedTokenWithExpiry(Date.now() + 60000);
        localStorage.setItem('morning_session_token', valid);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true,
                json: () => Promise.resolve({ placeholder: true, message: 'Coming soon.' })
            })
        );

        require('../morning.js');

        expect(document.getElementById('contentSection').style.display).toBe('block');
        expect(document.getElementById('passcodeForm').style.display).toBe('none');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/content'),
            expect.objectContaining({
                headers: { Authorization: `Bearer ${valid}` }
            })
        );
    });

    test('submitting a correct code stores the token and shows content', async () => {
        global.fetch = jest.fn((url) => {
            if (String(url).includes('/verify')) {
                return Promise.resolve({
                    status: 200,
                    ok: true,
                    json: () => Promise.resolve({ success: true, token: 'valid.token', expiresAt: Date.now() + 1000 })
                });
            }
            return Promise.resolve({
                status: 200,
                ok: true,
                json: () => Promise.resolve({ placeholder: true, message: 'Coming soon.' })
            });
        });

        require('../morning.js');

        document.getElementById('passcodeInput').value = '123456';
        const form = document.getElementById('passcodeForm');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        await new Promise(process.nextTick);
        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        expect(localStorage.getItem('morning_session_token')).toBe('valid.token');
        expect(document.getElementById('contentSection').style.display).toBe('block');
    });

    test('submitting a wrong code shows an error and keeps the form visible', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 401,
                ok: false,
                json: () => Promise.resolve({ error: 'Invalid code' })
            })
        );

        require('../morning.js');

        document.getElementById('passcodeInput').value = '000000';
        const form = document.getElementById('passcodeForm');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        const errorState = document.getElementById('passcodeError');
        expect(errorState.style.display).toBe('block');
        expect(document.getElementById('passcodeErrorMessage').textContent).toBe('Invalid code');
        expect(document.getElementById('passcodeForm').style.display).not.toBe('none');
    });

    test('submitting while rate-limited shows a distinct message', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 429,
                ok: false,
                json: () => Promise.resolve({ error: 'Too many attempts. Please wait and try again.' })
            })
        );

        require('../morning.js');

        document.getElementById('passcodeInput').value = '123456';
        const form = document.getElementById('passcodeForm');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        const message = document.getElementById('passcodeErrorMessage').textContent;
        expect(message.toLowerCase()).toContain('too many attempts');
    });

    test('a 401 from /content clears the token and shows the form again', async () => {
        const valid = seedTokenWithExpiry(Date.now() + 60000);
        localStorage.setItem('morning_session_token', valid);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 401,
                ok: false,
                json: () => Promise.resolve({ error: 'Session expired or invalid' })
            })
        );

        require('../morning.js');

        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        expect(localStorage.getItem('morning_session_token')).toBeNull();
        expect(document.getElementById('passcodeForm').style.display).toBe('block');
    });

    test('logout clears the stored token and shows the passcode form', () => {
        const valid = seedTokenWithExpiry(Date.now() + 60000);
        localStorage.setItem('morning_session_token', valid);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true,
                json: () => Promise.resolve({ placeholder: true, message: 'Coming soon.' })
            })
        );

        require('../morning.js');

        document.getElementById('logoutBtn').click();

        expect(localStorage.getItem('morning_session_token')).toBeNull();
        expect(document.getElementById('passcodeForm').style.display).toBe('block');
    });
});

// ============================================================================
// Dating events rendering
// ============================================================================

describe('morning.js - renderDatingEvents', () => {
    let morningJs;

    beforeEach(() => {
        document.documentElement.innerHTML = html;
        jest.resetModules();
        morningJs = require('../morning.js');
    });

    test('returns false and hides the card when there are no events', () => {
        const shown = morningJs.renderDatingEvents({ updatedAt: null, events: [] });
        expect(shown).toBe(false);
        expect(document.getElementById('datingEventsCard').style.display).toBe('none');
    });

    test('returns false when datingEvents is missing entirely', () => {
        expect(morningJs.renderDatingEvents(undefined)).toBe(false);
    });

    test('renders an event with a name, meta line, and link', () => {
        const shown = morningJs.renderDatingEvents({
            updatedAt: '2026-08-24T10:00:00Z',
            events: [{
                name: 'Shuffle Dating',
                organizer: 'Shuffle',
                date: 'Tue Aug 25',
                time: '7:00 PM',
                venue: 'Portico Brewing',
                link: 'https://shuffle.dating/boston',
                price: '$25'
            }]
        });

        expect(shown).toBe(true);
        expect(document.getElementById('datingEventsCard').style.display).toBe('block');

        const items = document.querySelectorAll('#datingEventsList .event-item');
        expect(items.length).toBe(1);
        expect(items[0].querySelector('.event-name').textContent).toBe('Shuffle Dating');
        expect(items[0].querySelector('.event-meta').textContent).toContain('Portico Brewing');

        const link = items[0].querySelector('.event-link');
        expect(link.href).toBe('https://shuffle.dating/boston');
        expect(link.textContent).toContain('$25');
    });

    test('renders events without a link gracefully', () => {
        morningJs.renderDatingEvents({
            updatedAt: null,
            events: [{ name: 'No Link Event' }, { name: 'Second Event', venue: 'Somewhere' }]
        });

        const items = document.querySelectorAll('#datingEventsList .event-item');
        expect(items.length).toBe(2);
        expect(items[0].querySelector('.event-link')).toBeNull();
    });
});

describe('morning.js - renderContent', () => {
    let morningJs;

    beforeEach(() => {
        document.documentElement.innerHTML = html;
        jest.resetModules();
        morningJs = require('../morning.js');
    });

    test('falls back to the placeholder message when there are no dating events', () => {
        morningJs.renderContent({ message: 'Nothing yet.' });

        expect(document.getElementById('contentPlaceholder').style.display).toBe('block');
        expect(document.getElementById('contentMessage').textContent).toBe('Nothing yet.');
        expect(document.getElementById('datingEventsCard').style.display).toBe('none');
    });

    test('hides the placeholder and shows the card when dating events exist', () => {
        morningJs.renderContent({
            datingEvents: { updatedAt: null, events: [{ name: 'Event' }] }
        });

        expect(document.getElementById('contentPlaceholder').style.display).toBe('none');
        expect(document.getElementById('datingEventsCard').style.display).toBe('block');
    });
});
