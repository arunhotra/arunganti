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
 * Fetch protected content from the worker. This is the seam where real
 * content (news, calendar, projects, etc.) will render once it exists -
 * for now the worker only ever returns a placeholder message.
 */
async function fetchContent() {
    const token = getStoredToken();

    elements.contentPlaceholder.style.display = 'none';
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

        elements.contentMessage.textContent = data.message || 'Coming soon.';
        elements.contentLoading.style.display = 'none';
        elements.contentPlaceholder.style.display = 'block';

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
        CONFIG
    };
}
