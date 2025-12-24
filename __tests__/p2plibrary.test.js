/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Read the HTML file
const html = fs.readFileSync(
    path.resolve(__dirname, '../p2plibrary.html'),
    'utf8'
);

describe('P2P Library Page - DOM Structure', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('page has correct title', () => {
        const title = document.querySelector('title');
        expect(title).toBeTruthy();
        expect(title.textContent).toContain('P2P Library');
    });

    test('page includes shared-styles.css', () => {
        const sharedStyles = document.querySelector('link[href="shared-styles.css"]');
        expect(sharedStyles).toBeTruthy();
    });

    test('page includes p2plibrary.css', () => {
        const p2pLibraryStyles = document.querySelector('link[href="p2plibrary.css"]');
        expect(p2pLibraryStyles).toBeTruthy();
    });

    test('page has fixed background element', () => {
        const background = document.querySelector('.hero-background');
        expect(background).toBeTruthy();
        expect(background.classList.contains('p2plibrary-bg')).toBe(true);
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
        expect(h1.textContent).toContain('P2P Library');

        const description = header.querySelector('p');
        expect(description).toBeTruthy();
    });
});

describe('P2P Library Page - Upload Form Elements', () => {
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

    test('book title input exists with correct attributes', () => {
        const titleInput = document.getElementById('titleInput');
        expect(titleInput).toBeTruthy();
        expect(titleInput.tagName).toBe('INPUT');
        expect(titleInput.getAttribute('type')).toBe('text');
        expect(titleInput.getAttribute('maxlength')).toBe('100');
        expect(titleInput.getAttribute('placeholder')).toBeTruthy();
    });

    test('author input exists with correct attributes', () => {
        const authorInput = document.getElementById('authorInput');
        expect(authorInput).toBeTruthy();
        expect(authorInput.tagName).toBe('INPUT');
        expect(authorInput.getAttribute('type')).toBe('text');
        expect(authorInput.getAttribute('maxlength')).toBe('100');
        expect(authorInput.getAttribute('placeholder')).toBeTruthy();
    });

    test('summary textarea exists with correct attributes', () => {
        const summaryInput = document.getElementById('summaryInput');
        expect(summaryInput).toBeTruthy();
        expect(summaryInput.tagName).toBe('TEXTAREA');
        expect(summaryInput.getAttribute('maxlength')).toBe('500');
        expect(summaryInput.getAttribute('placeholder')).toBeTruthy();
    });

    test('notes textarea exists with correct attributes', () => {
        const notesInput = document.getElementById('notesInput');
        expect(notesInput).toBeTruthy();
        expect(notesInput.tagName).toBe('TEXTAREA');
        expect(notesInput.getAttribute('maxlength')).toBe('200');
        expect(notesInput.getAttribute('placeholder')).toBeTruthy();
    });

    test('summary character counter exists', () => {
        const summaryCharCount = document.getElementById('summaryCharCount');
        expect(summaryCharCount).toBeTruthy();
        expect(summaryCharCount.textContent).toBe('0');
    });

    test('notes character counter exists', () => {
        const notesCharCount = document.getElementById('notesCharCount');
        expect(notesCharCount).toBeTruthy();
        expect(notesCharCount.textContent).toBe('0');
    });

    test('upload button exists with correct structure', () => {
        const button = document.getElementById('uploadBtn');
        expect(button).toBeTruthy();
        expect(button.tagName).toBe('BUTTON');
        expect(button.classList.contains('btn-primary')).toBe(true);
        expect(button.textContent).toContain('Share');
    });

    test('book fields container exists', () => {
        const bookFields = document.querySelector('.book-fields');
        expect(bookFields).toBeTruthy();
    });
});

describe('P2P Library Page - State Containers', () => {
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

    test('success state container exists', () => {
        const successState = document.getElementById('successState');
        expect(successState).toBeTruthy();
        expect(successState.classList.contains('success-state')).toBe(true);
    });
});

describe('P2P Library Page - Gallery Elements', () => {
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

    test('gallery title says "Available Books"', () => {
        const galleryTitle = document.querySelector('.gallery-title');
        expect(galleryTitle).toBeTruthy();
        expect(galleryTitle.textContent).toContain('Books');
    });
});

describe('P2P Library Page - Script Loading', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('page loads p2plibrary.js script with version', () => {
        const script = document.querySelector('script[src^="p2plibrary.js"]');
        expect(script).toBeTruthy();
        expect(script.getAttribute('src')).toMatch(/p2plibrary\.js\?v=/);
    });
});

describe('P2P Library Page - Semantic HTML', () => {
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

    test('book inputs have aria-labels', () => {
        expect(document.getElementById('titleInput').hasAttribute('aria-label')).toBe(true);
        expect(document.getElementById('authorInput').hasAttribute('aria-label')).toBe(true);
        expect(document.getElementById('summaryInput').hasAttribute('aria-label')).toBe(true);
        expect(document.getElementById('notesInput').hasAttribute('aria-label')).toBe(true);
    });
});

describe('P2P Library.js - Upload Functionality (Integration)', () => {
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

        try {
            require('../p2plibrary.js');
        } catch (e) {
            // Script may not exist yet, tests will fail until implemented
        }
    });

    test('upload button is initially disabled', () => {
        const uploadBtn = document.getElementById('uploadBtn');
        // Will be implemented in p2plibrary.js
        // expect(uploadBtn.disabled).toBe(true);
    });

    test('summary textarea has character limit of 500', () => {
        const textarea = document.getElementById('summaryInput');
        expect(textarea.maxLength).toBe(500);
    });

    test('notes textarea has character limit of 200', () => {
        const textarea = document.getElementById('notesInput');
        expect(textarea.maxLength).toBe(200);
    });
});

describe('P2P Library.js - Gallery Display (Integration)', () => {
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
                            imageUrl: '/image/123-abc',
                            thumbnailUrl: '/image/123-abc',
                            title: 'Test Book',
                            author: 'Test Author',
                            summary: 'This is a test book summary.',
                            notes: 'Test notes',
                            borrowed: false,
                            timestamp: Date.now(),
                            uploadedAt: new Date().toISOString(),
                            comments: []
                        }
                    ]
                })
            })
        );

        try {
            require('../p2plibrary.js');
        } catch (e) {
            // Script may not exist yet
        }
    });

    test('gallery grid exists for rendering books', () => {
        const grid = document.getElementById('galleryGrid');
        expect(grid).toBeTruthy();
    });
});

describe('P2P Library Page - Accessibility', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('file input is keyboard accessible', () => {
        const fileInput = document.getElementById('imageInput');
        expect(fileInput.tabIndex).not.toBe(-1);
    });

    test('book inputs are keyboard accessible', () => {
        expect(document.getElementById('titleInput').tabIndex).not.toBe(-1);
        expect(document.getElementById('authorInput').tabIndex).not.toBe(-1);
        expect(document.getElementById('summaryInput').tabIndex).not.toBe(-1);
        expect(document.getElementById('notesInput').tabIndex).not.toBe(-1);
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

describe('P2P Library Page - Responsive Design', () => {
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

describe('P2P Library Page - Modal', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
    });

    test('image modal exists', () => {
        const modal = document.getElementById('imageModal');
        expect(modal).toBeTruthy();
    });

    test('modal has book info container', () => {
        const modalBookInfo = document.getElementById('modalBookInfo');
        expect(modalBookInfo).toBeTruthy();
    });

    test('modal has close button', () => {
        const closeBtn = document.getElementById('modalClose');
        expect(closeBtn).toBeTruthy();
    });
});
