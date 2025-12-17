// ============================================================================
// TWITTERIZER - AI Hashtag Generator
// Uses Groq API (llama-3.3-70b-versatile model)
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const GROQ_CONFIG = {
    WORKER_URL: 'https://twitterizer-proxy.arunhotra.workers.dev', // Replace with your actual Worker URL after deployment
    MODEL: 'llama-3.3-70b-versatile',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.7
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
    // Input
    tweetInput: document.getElementById('tweetInput'),
    charCount: document.getElementById('charCount'),
    generateFreeBtn: document.getElementById('generateFreeBtn'),
    generateProBtn: document.getElementById('generateProBtn'),
    charWarning: document.getElementById('charWarning'),

    // States
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    resultsSection: document.getElementById('resultsSection'),
    resultsOutput: document.getElementById('resultsOutput'),

    // Actions
    copyBtn: document.getElementById('copyBtn'),
    newTweetBtn: document.getElementById('newTweetBtn'),
    copyFeedback: document.getElementById('copyFeedback')
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let state = {
    originalTweet: '',
    generatedTweet: '',
    isLoading: false,
    version: null // 'free' or 'pro'
};

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

function showState(stateName) {
    // Hide all states
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.resultsSection.style.display = 'none';

    // Show requested state
    switch(stateName) {
        case 'loading':
            elements.loadingState.style.display = 'block';
            elements.generateFreeBtn.disabled = true;
            elements.generateProBtn.disabled = true;
            break;
        case 'error':
            elements.errorState.style.display = 'block';
            elements.generateFreeBtn.disabled = false;
            elements.generateProBtn.disabled = false;
            break;
        case 'results':
            elements.resultsSection.style.display = 'block';
            elements.generateFreeBtn.disabled = false;
            elements.generateProBtn.disabled = false;
            break;
        default: // idle
            elements.generateFreeBtn.disabled = false;
            elements.generateProBtn.disabled = false;
    }
}

function showError(message) {
    elements.errorMessage.textContent = message;
    showState('error');
}

function updateCharCounter() {
    const count = elements.tweetInput.value.length;
    elements.charCount.textContent = count;

    // Update styling based on character count
    const counterElement = elements.charCount.parentElement;
    if (count > 260) {
        counterElement.classList.add('error');
        counterElement.classList.remove('warning');
    } else if (count > 220) {
        counterElement.classList.add('warning');
        counterElement.classList.remove('error');
    } else {
        counterElement.classList.remove('warning', 'error');
    }

    // Show/hide character warning for Free version
    if (count >= 270) {
        elements.charWarning.style.display = 'block';
    } else {
        elements.charWarning.style.display = 'none';
    }

    updateGenerateButtons();
}

function updateGenerateButtons() {
    const hasTweet = elements.tweetInput.value.trim().length > 0;
    const underLimit = elements.tweetInput.value.length <= 280;

    const shouldEnable = hasTweet && underLimit && !state.isLoading;
    elements.generateFreeBtn.disabled = !shouldEnable;
    elements.generateProBtn.disabled = !shouldEnable;
}

// ============================================================================
// CHARACTER CALCULATION FOR FREE VERSION
// ============================================================================

/**
 * Calculate available characters for hashtags
 * @param {string} tweet - Original tweet text
 * @returns {number} - Number of characters available for hashtags
 */
function calculateAvailableChars(tweet) {
    const TWITTER_LIMIT = 280;
    const SEPARATOR_LENGTH = 2; // "\n\n"
    const tweetLength = tweet.length;
    return TWITTER_LIMIT - tweetLength - SEPARATOR_LENGTH;
}

/**
 * Estimate hashtag count based on available characters
 * Average hashtag length: ~12 chars including space
 * @param {number} availableChars - Characters available for hashtags
 * @returns {object} - Min and max hashtag count
 */
function estimateHashtagCount(availableChars) {
    const AVG_HASHTAG_LENGTH = 12; // "#TechNews " = 10-14 chars average

    if (availableChars < AVG_HASHTAG_LENGTH) {
        return { min: 0, max: 0 };
    }

    const maxPossible = Math.floor(availableChars / AVG_HASHTAG_LENGTH);

    // Conservative estimate: aim for 80% of max to ensure we fit
    const targetMax = Math.floor(maxPossible * 0.8);
    const targetMin = Math.max(1, Math.floor(targetMax * 0.6));

    return {
        min: Math.min(targetMin, 7), // Cap at 7
        max: Math.min(targetMax, 10)  // Cap at 10
    };
}

// ============================================================================
// GROQ API INTEGRATION
// ============================================================================

/**
 * Build AI prompt for hashtag generation
 * @param {string} tweet - Original tweet text
 * @param {string} version - 'free' or 'pro'
 * @param {object} hashtagCount - {min, max} for Free version
 * @returns {string} - Complete prompt for AI
 */
function buildPrompt(tweet, version, hashtagCount = null) {
    let countInstruction = '5-10';
    let extraConstraints = '';

    if (version === 'free' && hashtagCount) {
        if (hashtagCount.max === 0) {
            countInstruction = '0'; // Edge case, shouldn't happen
        } else if (hashtagCount.min === hashtagCount.max) {
            countInstruction = `${hashtagCount.max}`;
        } else {
            countInstruction = `${hashtagCount.min}-${hashtagCount.max}`;
        }

        const availableChars = calculateAvailableChars(tweet);
        extraConstraints = `\n- CRITICAL: Keep hashtags SHORT - you have only ${availableChars} characters total
- Total hashtag length (including spaces) must NOT exceed ${availableChars} characters`;
    }

    return `You are a Twitter/X social media expert. Analyze the following tweet and suggest ${countInstruction} highly relevant, trending hashtags that will maximize engagement and reach.

Tweet: "${tweet}"

Requirements:
- Return ONLY the hashtags, separated by spaces
- Use proper hashtag format (e.g., #TechNews #AI #Innovation)
- Choose hashtags that are:
  * Relevant to the tweet content
  * Popular and trending (when appropriate)
  * A mix of broad and niche tags
  * Likely to increase visibility
- Do NOT include explanations, numbering, or extra text
- Do NOT repeat hashtags already in the original tweet${extraConstraints}

Hashtags:`;
}

/**
 * Generate hashtags for Free version (280 character limit)
 */
async function generateHashtagsFree() {
    const tweet = elements.tweetInput.value.trim();
    if (!tweet) {
        showError('Please enter a tweet');
        return;
    }

    // Check if tweet is too close to limit
    const FREE_THRESHOLD = 270;
    if (tweet.length >= FREE_THRESHOLD) {
        // Show original tweet as-is with no hashtags
        state.originalTweet = tweet;
        state.generatedTweet = tweet;
        state.version = 'free';

        elements.resultsOutput.textContent = state.generatedTweet;
        showState('results');
        return;
    }

    // Calculate hashtag count constraints
    const availableChars = calculateAvailableChars(tweet);
    const hashtagCount = estimateHashtagCount(availableChars);

    if (hashtagCount.max === 0) {
        // Not enough space for even one hashtag
        state.originalTweet = tweet;
        state.generatedTweet = tweet;
        state.version = 'free';

        elements.resultsOutput.textContent = state.generatedTweet;
        showState('results');
        return;
    }

    state.originalTweet = tweet;
    state.version = 'free';
    state.isLoading = true;
    showState('loading');

    try {
        const response = await fetch(GROQ_CONFIG.WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_CONFIG.MODEL,
                messages: [
                    {
                        role: 'user',
                        content: buildPrompt(tweet, 'free', hashtagCount)
                    }
                ],
                max_tokens: GROQ_CONFIG.MAX_TOKENS,
                temperature: GROQ_CONFIG.TEMPERATURE
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your Groq API key.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few moments.');
            } else {
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }
        }

        const data = await response.json();
        let hashtags = data.choices[0]?.message?.content?.trim();

        if (!hashtags) {
            throw new Error('No hashtags generated. Please try again.');
        }

        // Combine and verify character limit
        const combined = `${tweet}\n\n${hashtags}`;

        // Enforce 280 limit - truncate if necessary
        if (combined.length > 280) {
            // Trim hashtags to fit
            const maxHashtagLength = 280 - tweet.length - 2; // -2 for "\n\n"
            hashtags = hashtags.substring(0, maxHashtagLength).trim();

            // Remove partial hashtag at end if present
            const lastSpace = hashtags.lastIndexOf(' ');
            if (lastSpace > 0) {
                hashtags = hashtags.substring(0, lastSpace);
            }
        }

        state.generatedTweet = `${tweet}\n\n${hashtags}`;

        // Display results
        elements.resultsOutput.textContent = state.generatedTweet;
        showState('results');

    } catch (error) {
        console.error('Hashtag generation error:', error);
        showError(error.message || 'Failed to generate hashtags. Please try again.');
    } finally {
        state.isLoading = false;
        updateGenerateButtons();
    }
}

/**
 * Generate hashtags for Pro version (no character limit)
 */
async function generateHashtagsPro() {
    const tweet = elements.tweetInput.value.trim();
    if (!tweet) {
        showError('Please enter a tweet');
        return;
    }

    state.originalTweet = tweet;
    state.version = 'pro';
    state.isLoading = true;
    showState('loading');

    try {
        const response = await fetch(GROQ_CONFIG.WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_CONFIG.MODEL,
                messages: [
                    {
                        role: 'user',
                        content: buildPrompt(tweet, 'pro')
                    }
                ],
                max_tokens: GROQ_CONFIG.MAX_TOKENS,
                temperature: GROQ_CONFIG.TEMPERATURE
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your Groq API key.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few moments.');
            } else {
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }
        }

        const data = await response.json();
        const hashtags = data.choices[0]?.message?.content?.trim();

        if (!hashtags) {
            throw new Error('No hashtags generated. Please try again.');
        }

        // Combine original tweet with generated hashtags (no limit)
        state.generatedTweet = `${tweet}\n\n${hashtags}`;

        // Display results
        elements.resultsOutput.textContent = state.generatedTweet;
        showState('results');

    } catch (error) {
        console.error('Hashtag generation error:', error);
        showError(error.message || 'Failed to generate hashtags. Please try again.');
    } finally {
        state.isLoading = false;
        updateGenerateButtons();
    }
}

// ============================================================================
// CLIPBOARD FUNCTIONALITY
// ============================================================================

async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(state.generatedTweet);

        // Show feedback
        elements.copyFeedback.style.display = 'block';
        setTimeout(() => {
            elements.copyFeedback.style.display = 'none';
        }, 3000);

        // Button feedback
        const originalText = elements.copyBtn.textContent;
        elements.copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            elements.copyBtn.textContent = originalText;
        }, 2000);

    } catch (error) {
        console.error('Copy failed:', error);
        showError('Failed to copy to clipboard');
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initializeEventListeners() {
    // Input
    elements.tweetInput.addEventListener('input', updateCharCounter);
    elements.generateFreeBtn.addEventListener('click', generateHashtagsFree);
    elements.generateProBtn.addEventListener('click', generateHashtagsPro);

    // Error handling
    elements.retryBtn.addEventListener('click', () => {
        if (state.version === 'free') {
            generateHashtagsFree();
        } else {
            generateHashtagsPro();
        }
    });

    // Results actions
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.newTweetBtn.addEventListener('click', () => {
        elements.tweetInput.value = '';
        updateCharCounter();
        showState('idle');
        elements.tweetInput.focus();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to generate with Free
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (!elements.generateFreeBtn.disabled) {
                generateHashtagsFree();
            }
        }
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    // Initialize UI
    updateCharCounter();
    updateGenerateButtons();

    // Set up event listeners
    initializeEventListeners();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GROQ_CONFIG,
        state,
        buildPrompt,
        generateHashtagsFree,
        generateHashtagsPro,
        calculateAvailableChars,
        estimateHashtagCount,
        copyToClipboard,
        showError,
        updateCharCounter,
        updateGenerateButtons,
        showState,
        initializeEventListeners
    };
}
