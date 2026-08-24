/**
 * Morning - Private page client-side functionality
 * Handles the TOTP passcode gate and session token storage
 */

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    workerUrl: 'https://morning-worker.arunhotra.workers.dev',
    tokenStorageKey: 'morning_session_token'
};

// ============================================================================
// DOM Elements
// ============================================================================

let elements = {};

function initElements() {
    elements = {
        passcodeForm: document.getElementById('passcodeForm'),
        passcodeInput: document.getElementById('passcodeInput'),
        verifyBtn: document.getElementById('verifyBtn'),
        passcodeError: document.getElementById('passcodeError'),
        passcodeErrorMessage: document.getElementById('passcodeErrorMessage'),
        verifyLoading: document.getElementById('verifyLoading'),

        contentSection: document.getElementById('contentSection'),
        contentLoading: document.getElementById('contentLoading'),
        contentPlaceholder: document.getElementById('contentPlaceholder'),
        contentMessage: document.getElementById('contentMessage'),
        datingEventsCard: document.getElementById('datingEventsCard'),
        datingEventsUpdated: document.getElementById('datingEventsUpdated'),
        datingEventsList: document.getElementById('datingEventsList'),
        logoutBtn: document.getElementById('logoutBtn')
    };
}

// ============================================================================
// Token Storage
// ============================================================================

function getStoredToken() {
    try {
        return localStorage.getItem(CONFIG.tokenStorageKey);
    } catch (error) {
        return null;
    }
}

function storeToken(token) {
    try {
        localStorage.setItem(CONFIG.tokenStorageKey, token);
    } catch (error) {
        console.error('Failed to store session token:', error);
    }
}

function clearToken() {
    try {
        localStorage.removeItem(CONFIG.tokenStorageKey);
    } catch (error) {
        console.error('Failed to clear session token:', error);
    }
}

/**
 * Best-effort client-side expiry check, used only to decide whether to
 * show the passcode form or go straight to fetching content. This is
 * never a security check - the worker independently verifies the
 * signature and expiry of the token on every /content request.
 */
function isTokenExpired(token) {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
        return true;
    }

    try {
        const [payloadB64] = token.split('.');
        const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = atob(padded);
        const payload = JSON.parse(payloadJson);
        return !(typeof payload.exp === 'number' && payload.exp > Date.now());
    } catch (error) {
        return true;
    }
}

// ============================================================================
// UI State
// ============================================================================

function showPasscodeForm() {
    elements.passcodeForm.style.display = 'block';
    elements.contentSection.style.display = 'none';
    elements.passcodeInput.value = '';
    hidePasscodeError();
}

function showContent() {
    elements.passcodeForm.style.display = 'none';
    elements.contentSection.style.display = 'block';
}

function showPasscodeError(message) {
    elements.passcodeErrorMessage.textContent = message;
    elements.passcodeError.style.display = 'block';
}

function hidePasscodeError() {
    elements.passcodeError.style.display = 'none';
}

function setVerifyLoading(isLoading) {
    elements.verifyBtn.disabled = isLoading;
    elements.verifyLoading.style.display = isLoading ? 'block' : 'none';
}

// ============================================================================
// Auth Flow
// ============================================================================

async function handleVerifySubmit(event) {
    event.preventDefault();

    const code = elements.passcodeInput.value.trim();

    if (!/^\d{6}$/.test(code)) {
        showPasscodeError('Please enter a 6-digit code');
        return;
    }

    hidePasscodeError();
    setVerifyLoading(true);

    try {
        const response = await fetch(`${CONFIG.workerUrl}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        if (response.status === 429) {
            showPasscodeError('Too many attempts. Please wait 15 minutes and try again.');
            return;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.token) {
            showPasscodeError(data.error || 'Incorrect code, please try again.');
            return;
        }

        storeToken(data.token);
        showContent();
        await fetchContent();

    } catch (error) {
        console.error('Verify error:', error);
        showPasscodeError('Something went wrong. Please try again.');
    } finally {
        setVerifyLoading(false);
    }
}

/**
 * Render the dating-events section from the worker's `datingEvents`
 * payload. Returns true if there was anything to show, so the caller
 * knows whether to fall back to the placeholder message instead.
 */
function renderDatingEvents(datingEvents) {
    const events = (datingEvents && Array.isArray(datingEvents.events)) ? datingEvents.events : [];

    if (events.length === 0) {
        elements.datingEventsCard.style.display = 'none';
        return false;
    }

    elements.datingEventsUpdated.textContent = datingEvents.updatedAt
        ? `Updated ${new Date(datingEvents.updatedAt).toLocaleString()}`
        : '';

    elements.datingEventsList.innerHTML = '';
    events.forEach((event) => {
        const li = document.createElement('li');
        li.className = 'event-item';

        const name = document.createElement('span');
        name.className = 'event-name';
        name.textContent = event.name || 'Untitled event';

        const meta = document.createElement('span');
        meta.className = 'event-meta';
        meta.textContent = [event.organizer, event.date, event.time, event.venue]
            .filter(Boolean)
            .join(' • ');

        li.appendChild(name);
        li.appendChild(meta);

        if (event.link) {
            const link = document.createElement('a');
            link.className = 'event-link';
            link.href = event.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = event.price ? `Details (${event.price}) ↗` : 'Details ↗';
            li.appendChild(link);
        }

        elements.datingEventsList.appendChild(li);
    });

    elements.datingEventsCard.style.display = 'block';
    return true;
}

/**
 * Render whatever the worker returned. Each dashboard section (dating
 * events today, others later) gets its own render function and its own
 * key on the response payload - this just wires them into the shared
 * placeholder/fallback message.
 */
function renderContent(data) {
    const hasDatingEvents = renderDatingEvents(data.datingEvents);

    if (hasDatingEvents) {
        elements.contentPlaceholder.style.display = 'none';
    } else {
        elements.contentMessage.textContent = data.message || 'No dating events found for the coming week.';
        elements.contentPlaceholder.style.display = 'block';
    }
}

async function fetchContent() {
    const token = getStoredToken();

    elements.contentPlaceholder.style.display = 'none';
    elements.datingEventsCard.style.display = 'none';
    elements.contentLoading.style.display = 'block';

    try {
        const response = await fetch(`${CONFIG.workerUrl}/content`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            clearToken();
            showPasscodeForm();
            return;
        }

        const data = await response.json();

        elements.contentLoading.style.display = 'none';
        renderContent(data);

    } catch (error) {
        console.error('Content fetch error:', error);
        elements.contentLoading.style.display = 'none';
        elements.contentMessage.textContent = 'Failed to load content. Please refresh the page.';
        elements.contentPlaceholder.style.display = 'block';
    }
}

function handleLogout() {
    clearToken();
    showPasscodeForm();
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
    if (elements.passcodeForm) {
        elements.passcodeForm.addEventListener('submit', handleVerifySubmit);
    }
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
}

// ============================================================================
// Initialization
// ============================================================================

function init() {
    initElements();
    setupEventListeners();

    const token = getStoredToken();

    if (token && !isTokenExpired(token)) {
        showContent();
        fetchContent();
    } else {
        showPasscodeForm();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getStoredToken,
        storeToken,
        clearToken,
        isTokenExpired,
        renderDatingEvents,
        renderContent,
        CONFIG
    };
}
