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
    generateBtn: document.getElementById('generateBtn'),

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
    isLoading: false
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
            elements.generateBtn.disabled = true;
            break;
        case 'error':
            elements.errorState.style.display = 'block';
            elements.generateBtn.disabled = false;
            break;
        case 'results':
            elements.resultsSection.style.display = 'block';
            elements.generateBtn.disabled = false;
            break;
        default: // idle
            elements.generateBtn.disabled = false;
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

    updateGenerateButton();
}

function updateGenerateButton() {
    const hasTweet = elements.tweetInput.value.trim().length > 0;
    const underLimit = elements.tweetInput.value.length <= 280;

    elements.generateBtn.disabled = !hasTweet || !underLimit || state.isLoading;
}

// ============================================================================
// GROQ API INTEGRATION
// ============================================================================

function buildPrompt(tweet) {
    return `You are a Twitter/X social media expert. Analyze the following tweet and suggest 5-10 highly relevant, trending hashtags that will maximize engagement and reach.

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
- Do NOT repeat hashtags already in the original tweet

Hashtags:`;
}

async function generateHashtags() {
    const tweet = elements.tweetInput.value.trim();
    if (!tweet) {
        showError('Please enter a tweet');
        return;
    }

    state.originalTweet = tweet;
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
                        content: buildPrompt(tweet)
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

        // Combine original tweet with generated hashtags
        state.generatedTweet = `${tweet}\n\n${hashtags}`;

        // Display results
        elements.resultsOutput.textContent = state.generatedTweet;
        showState('results');

    } catch (error) {
        console.error('Hashtag generation error:', error);
        showError(error.message || 'Failed to generate hashtags. Please try again.');
    } finally {
        state.isLoading = false;
        updateGenerateButton();
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
    elements.generateBtn.addEventListener('click', generateHashtags);

    // Error handling
    elements.retryBtn.addEventListener('click', generateHashtags);

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
        // Ctrl/Cmd + Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (!elements.generateBtn.disabled) {
                generateHashtags();
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
    updateGenerateButton();

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
        generateHashtags,
        copyToClipboard,
        showError,
        updateCharCounter,
        updateGenerateButton,
        showState,
        initializeEventListeners
    };
}
