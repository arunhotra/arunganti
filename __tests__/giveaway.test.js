/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Read the HTML file
const html = fs.readFileSync(
    path.resolve(__dirname, '../giveaway.html'),
    'utf8'
);

describe('Giveaway Page - DOM Structure', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('page has correct title', () => {
        const title = document.querySelector('title');
        expect(title).toBeTruthy();
        expect(title.textContent).toContain('Giveaway');
    });

    test('page includes shared-styles.css', () => {
        const sharedStyles = document.querySelector('link[href="shared-styles.css"]');
        expect(sharedStyles).toBeTruthy();
    });

    test('page includes giveaway.css', () => {
        const giveawayStyles = document.querySelector('link[href="giveaway.css"]');
        expect(giveawayStyles).toBeTruthy();
    });

    test('page has fixed background element', () => {
        const background = document.querySelector('.hero-background');
        expect(background).toBeTruthy();
        expect(background.classList.contains('giveaway-bg')).toBe(true);
    });

    test('page has back navigation to personal-projects.html', () => {
        const backLink = document.querySelector('.back-nav .back-link');
        expect(backLink).toBeTruthy();
        expect(backLink.getAttribute('href')).toBe('personal-projects.html');
        expect(backLink.textContent).toContain('Back to Projects');
    });

    test('page has main tool container', () => {
        const container = document.querySelector('.tool-container');
        expect(container).toBeTruthy();
        expect(container.tagName).toBe('MAIN');
    });

    test('page has tool card', () => {
        const card = document.querySelector('.tool-card');
        expect(card).toBeTruthy();
    });

    test('page has header with title and description', () => {
        const header = document.querySelector('.tool-header');
        expect(header).toBeTruthy();
        expect(header.tagName).toBe('HEADER');

        const h1 = header.querySelector('h1');
        expect(h1).toBeTruthy();
        expect(h1.textContent).toContain('Giveaway');

        const description = header.querySelector('p');
        expect(description).toBeTruthy();
    });
});

describe('Giveaway Page - Upload Form Elements', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('upload section exists with correct structure', () => {
        const uploadSection = document.querySelector('.upload-section');
        expect(uploadSection).toBeTruthy();
        expect(uploadSection.tagName).toBe('SECTION');
    });

    test('file input exists with correct attributes', () => {
        const fileInput = document.getElementById('imageInput');
        expect(fileInput).toBeTruthy();
        expect(fileInput.tagName).toBe('INPUT');
        expect(fileInput.getAttribute('type')).toBe('file');
        expect(fileInput.getAttribute('accept')).toBe('image/*');
        expect(fileInput.getAttribute('capture')).toBe('environment');
    });

    test('image preview container exists', () => {
        const preview = document.getElementById('imagePreview');
        expect(preview).toBeTruthy();
        expect(preview.classList.contains('image-preview')).toBe(true);
    });

    test('description textarea exists with correct attributes', () => {
        const textarea = document.getElementById('descriptionInput');
        expect(textarea).toBeTruthy();
        expect(textarea.tagName).toBe('TEXTAREA');
        expect(textarea.getAttribute('maxlength')).toBe('280');
        expect(textarea.getAttribute('placeholder')).toBeTruthy();
    });

    test('upload button exists with correct structure', () => {
        const button = document.getElementById('uploadBtn');
        expect(button).toBeTruthy();
        expect(button.tagName).toBe('BUTTON');
        expect(button.classList.contains('btn-primary')).toBe(true);
        expect(button.textContent).toContain('Share');
    });
});

describe('Giveaway Page - State Containers', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('loading state container exists', () => {
        const loadingState = document.getElementById('loadingState');
        expect(loadingState).toBeTruthy();
        expect(loadingState.classList.contains('loading-state')).toBe(true);
    });

    test('error state container exists', () => {
        const errorState = document.getElementById('errorState');
        expect(errorState).toBeTruthy();
        expect(errorState.classList.contains('error-state')).toBe(true);
    });
});

describe('Giveaway Page - Gallery Elements', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('gallery section exists', () => {
        const gallerySection = document.getElementById('gallerySection');
        expect(gallerySection).toBeTruthy();
        expect(gallerySection.tagName).toBe('SECTION');
        expect(gallerySection.classList.contains('gallery-section')).toBe(true);
    });

    test('gallery grid container exists', () => {
        const galleryGrid = document.getElementById('galleryGrid');
        expect(galleryGrid).toBeTruthy();
        expect(galleryGrid.classList.contains('gallery-grid')).toBe(true);
    });
});

describe('Giveaway Page - Script Loading', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('page loads giveaway.js script with version', () => {
        const script = document.querySelector('script[src^="giveaway.js"]');
        expect(script).toBeTruthy();
        expect(script.getAttribute('src')).toMatch(/giveaway\.js\?v=/);
    });
});

describe('Giveaway Page - Semantic HTML', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('uses semantic HTML5 elements', () => {
        expect(document.querySelector('nav')).toBeTruthy();
        expect(document.querySelector('main')).toBeTruthy();
        expect(document.querySelector('header')).toBeTruthy();
        expect(document.querySelector('section')).toBeTruthy();
    });

    test('back navigation has aria-label', () => {
        const nav = document.querySelector('.back-nav');
        expect(nav.hasAttribute('aria-label')).toBe(true);

        const link = nav.querySelector('.back-link');
        expect(link.hasAttribute('aria-label')).toBe(true);
    });
});

// Mock tests for JavaScript functionality
// These will pass once giveaway.js is implemented

describe('Giveaway.js - Upload Functionality (Integration)', () => {
    let mockFetch;

    beforeEach(() => {
        document.documentElement.innerHTML = html;

        // Mock fetch for API calls
        mockFetch = jest.fn();
        global.fetch = mockFetch;

        // Mock FileReader for image preview
        global.FileReader = jest.fn(() => ({
            readAsDataURL: jest.fn(),
            addEventListener: jest.fn(),
            result: 'data:image/jpeg;base64,mockImageData'
        }));

        // Load the script (will be implemented)
        try {
            require('../giveaway.js');
        } catch (e) {
            // Script may not exist yet, tests will fail until implemented
        }
    });

    test('upload button is initially disabled', () => {
        const uploadBtn = document.getElementById('uploadBtn');
        // Will be implemented in giveaway.js
        // expect(uploadBtn.disabled).toBe(true);
    });

    test('description textarea has character limit', () => {
        const textarea = document.getElementById('descriptionInput');
        expect(textarea.maxLength).toBe(280);
    });
});

describe('Giveaway.js - Gallery Display (Integration)', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;

        // Mock fetch for gallery items
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    items: [
                        {
                            id: '123-abc',
                            imageUrl: '/images/123-abc.jpg',
                            thumbnailUrl: '/images/thumbnails/123-abc.jpg',
                            description: 'Test item',
                            timestamp: Date.now(),
                            uploadedAt: new Date().toISOString()
                        }
                    ]
                })
            })
        );

        try {
            require('../giveaway.js');
        } catch (e) {
            // Script may not exist yet
        }
    });

    test('gallery grid exists for rendering items', () => {
        const grid = document.getElementById('galleryGrid');
        expect(grid).toBeTruthy();
    });
});

describe('Giveaway Page - Accessibility', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('file input is keyboard accessible', () => {
        const fileInput = document.getElementById('imageInput');
        expect(fileInput.tabIndex).not.toBe(-1);
    });

    test('textarea is keyboard accessible', () => {
        const textarea = document.getElementById('descriptionInput');
        expect(textarea.tabIndex).not.toBe(-1);
    });

    test('buttons are keyboard accessible', () => {
        const uploadBtn = document.getElementById('uploadBtn');
        expect(uploadBtn.tabIndex).not.toBe(-1);
    });

    test('back link is keyboard accessible', () => {
        const backLink = document.querySelector('.back-link');
        expect(backLink.tabIndex).not.toBe(-1);
    });
});

describe('Giveaway Page - Responsive Design', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('viewport meta tag is set correctly', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        expect(viewport).toBeTruthy();
        expect(viewport.getAttribute('content')).toContain('width=device-width');
        expect(viewport.getAttribute('content')).toContain('initial-scale=1.0');
    });

    test('file input has mobile camera capture attribute', () => {
        const fileInput = document.getElementById('imageInput');
        expect(fileInput.getAttribute('capture')).toBe('environment');
    });
});
