/**
 * Twitterizer Tool Tests
 *
 * Tests for twitterizer.html and twitterizer.js functionality
 */

const fs = require('fs');
const path = require('path');

describe('Twitterizer Tool', () => {
    let localStorageMock;
    let fetchMock;
    let clipboardMock;

    beforeEach(() => {
        // Mock localStorage FIRST before any code runs
        localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn()
        };
        global.localStorage = localStorageMock;

        // Mock fetch
        fetchMock = jest.fn();
        global.fetch = fetchMock;

        // Mock clipboard API
        clipboardMock = {
            writeText: jest.fn(() => Promise.resolve())
        };
        global.navigator.clipboard = clipboardMock;

        // Load HTML file
        const html = fs.readFileSync(
            path.resolve(__dirname, '../twitterizer.html'),
            'utf8'
        );
        document.documentElement.innerHTML = html;

        // Load and execute script
        const scriptPath = path.resolve(__dirname, '../twitterizer.js');
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');

        // Remove the module exports and auto-init for browser context, but keep function definitions
        const browserScript = scriptContent
            .replace(/\/\/ Start the app when DOM is ready[\s\S]*$/m, '')
            .replace(/\/\/ Export functions for testing[\s\S]*$/m, '');

        // Execute script in test environment
        eval(browserScript);
    });

    afterEach(() => {
        document.documentElement.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Page Structure', () => {
        test('tool card exists with correct structure', () => {
            const toolCard = document.querySelector('.tool-card');
            expect(toolCard).toBeInTheDocument();
        });

        test('page title is correct', () => {
            const title = document.querySelector('title');
            expect(title.textContent).toBe('Twitterizer | Personal Projects');
        });

        test('tool header exists with title', () => {
            const header = document.querySelector('.tool-header h1');
            expect(header).toBeInTheDocument();
            expect(header.textContent).toBe('Twitterizer');
        });

        test('tweet input textarea exists', () => {
            const tweetInput = document.getElementById('tweetInput');
            expect(tweetInput).toBeInTheDocument();
            expect(tweetInput.tagName).toBe('TEXTAREA');
            expect(tweetInput.getAttribute('maxlength')).toBe('280');
        });

        test('character counter exists', () => {
            const charCount = document.getElementById('charCount');
            expect(charCount).toBeInTheDocument();
        });

        test('generate button exists', () => {
            const generateBtn = document.getElementById('generateBtn');
            expect(generateBtn).toBeInTheDocument();
        });

        test('all state containers exist', () => {
            const loadingState = document.getElementById('loadingState');
            const errorState = document.getElementById('errorState');
            const resultsSection = document.getElementById('resultsSection');

            expect(loadingState).toBeInTheDocument();
            expect(errorState).toBeInTheDocument();
            expect(resultsSection).toBeInTheDocument();
        });

        test('back navigation links to personal-projects.html', () => {
            const backLink = document.querySelector('.back-link');
            expect(backLink).toBeInTheDocument();
            expect(backLink.getAttribute('href')).toBe('personal-projects.html');
        });

        test('copy and new tweet buttons exist in results section', () => {
            const copyBtn = document.getElementById('copyBtn');
            const newTweetBtn = document.getElementById('newTweetBtn');

            expect(copyBtn).toBeInTheDocument();
            expect(newTweetBtn).toBeInTheDocument();
        });

        test('retry button exists in error state', () => {
            const retryBtn = document.getElementById('retryBtn');
            expect(retryBtn).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        test('all form inputs have labels', () => {
            const tweetInput = document.getElementById('tweetInput');
            const label = document.querySelector('label[for="tweetInput"]');

            expect(label).toBeInTheDocument();
        });

        test('buttons have accessible names', () => {
            const generateBtn = document.getElementById('generateBtn');
            const copyBtn = document.getElementById('copyBtn');

            expect(generateBtn.textContent.trim()).toBeTruthy();
            expect(copyBtn.textContent.trim()).toBeTruthy();
        });

        test('input section has aria-label', () => {
            const inputSection = document.querySelector('.input-section');
            expect(inputSection.getAttribute('aria-label')).toBe('Tweet input area');
        });

        test('results section has aria-label', () => {
            const resultsSection = document.getElementById('resultsSection');
            expect(resultsSection.getAttribute('aria-label')).toBe('Generated tweet with hashtags');
        });

        test('back link has aria-label', () => {
            const backLink = document.querySelector('.back-link');
            expect(backLink.getAttribute('aria-label')).toBe('Back to projects');
        });
    });

    describe('CSS and JavaScript Links', () => {
        test('links to shared-styles.css', () => {
            const sharedStyles = document.querySelector('link[href="shared-styles.css"]');
            expect(sharedStyles).toBeInTheDocument();
        });

        test('links to twitterizer.css', () => {
            const twitterizerStyles = document.querySelector('link[href="twitterizer.css"]');
            expect(twitterizerStyles).toBeInTheDocument();
        });

        test('links to Poppins font', () => {
            const fontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
            expect(fontLink).toBeInTheDocument();
            expect(fontLink.getAttribute('href')).toContain('Poppins');
        });

        test('links to twitterizer.js', () => {
            const script = document.querySelector('script[src="twitterizer.js"]');
            expect(script).toBeInTheDocument();
        });
    });

    describe('HTML Semantic Structure', () => {
        test('uses semantic HTML elements', () => {
            const nav = document.querySelector('nav');
            const main = document.querySelector('main');
            const header = document.querySelector('header');
            const section = document.querySelector('section');

            expect(nav).toBeInTheDocument();
            expect(main).toBeInTheDocument();
            expect(header).toBeInTheDocument();
            expect(section).toBeInTheDocument();
        });

        test('results section is initially hidden', () => {
            const resultsSection = document.getElementById('resultsSection');
            expect(resultsSection.style.display).toBe('none');
        });

        test('loading state is initially hidden', () => {
            const loadingState = document.getElementById('loadingState');
            expect(loadingState.style.display).toBe('none');
        });

        test('error state is initially hidden', () => {
            const errorState = document.getElementById('errorState');
            expect(errorState.style.display).toBe('none');
        });
    });

    describe('Form Elements', () => {
        test('tweet textarea has correct attributes', () => {
            const tweetInput = document.getElementById('tweetInput');

            expect(tweetInput.getAttribute('maxlength')).toBe('280');
            expect(tweetInput.getAttribute('rows')).toBe('4');
            expect(tweetInput.getAttribute('placeholder')).toBeTruthy();
        });

        test('generate button is disabled by default', () => {
            const generateBtn = document.getElementById('generateBtn');
            expect(generateBtn.disabled).toBe(true);
        });

        test('character counter shows 0/280 initially', () => {
            const charCount = document.getElementById('charCount');
            expect(charCount.textContent).toBe('0');
        });
    });
});
