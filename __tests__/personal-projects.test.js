/**
 * Personal Projects Page Tests
 *
 * Tests for personal-projects.html structure and functionality
 */

const fs = require('fs');
const path = require('path');

describe('Personal Projects Page', () => {
    beforeEach(() => {
        // Load HTML file
        const html = fs.readFileSync(
            path.resolve(__dirname, '../personal-projects.html'),
            'utf8'
        );
        document.documentElement.innerHTML = html;
    });

    afterEach(() => {
        document.documentElement.innerHTML = '';
    });

    describe('Page Structure', () => {
        test('page has correct title', () => {
            const title = document.querySelector('title');
            expect(title).toBeInTheDocument();
            expect(title.textContent).toBe('Personal Projects | Portfolio');
        });

        test('background element exists with correct class', () => {
            const background = document.querySelector('.hero-background');
            expect(background).toBeInTheDocument();
        });

        test('back navigation link exists and points to index.html', () => {
            const backLink = document.querySelector('.back-link');
            expect(backLink).toBeInTheDocument();
            expect(backLink.getAttribute('href')).toBe('index.html');
        });

        test('page title heading exists', () => {
            const heading = document.querySelector('.page-title');
            expect(heading).toBeInTheDocument();
            expect(heading.textContent).toBe('Personal Projects');
        });
    });

    describe('Project Grid', () => {
        test('project grid exists with correct class', () => {
            const grid = document.querySelector('.project-grid');
            expect(grid).toBeInTheDocument();
        });

        test('Twitterizer tile exists and links to twitterizer.html', () => {
            const twitterizerTile = document.querySelector('a[href="twitterizer.html"]');
            expect(twitterizerTile).toBeInTheDocument();
            expect(twitterizerTile.classList.contains('project-tile')).toBe(true);
        });

        test('Twitterizer tile has title and description', () => {
            const twitterizerTile = document.querySelector('a[href="twitterizer.html"]');
            const title = twitterizerTile.querySelector('.project-tile-title');
            const description = twitterizerTile.querySelector('.project-tile-description');

            expect(title).toBeInTheDocument();
            expect(title.textContent).toBe('Twitterizer');

            expect(description).toBeInTheDocument();
            expect(description.textContent).toContain('hashtag generator');
        });

        test('Twitterizer tile has badge with arrow', () => {
            const twitterizerTile = document.querySelector('a[href="twitterizer.html"]');
            const badge = twitterizerTile.querySelector('.project-tile-badge');

            expect(badge).toBeInTheDocument();
            expect(badge.textContent).toContain('→');
        });

        test('placeholder tiles exist for future projects', () => {
            const placeholders = document.querySelectorAll('.project-tile-placeholder');
            expect(placeholders.length).toBeGreaterThanOrEqual(2);
        });

        test('placeholder tiles have correct content', () => {
            const placeholders = document.querySelectorAll('.project-tile-placeholder');
            placeholders.forEach(placeholder => {
                const title = placeholder.querySelector('.project-tile-title');
                expect(title.textContent).toBe('Coming Soon');
            });
        });
    });

    describe('Accessibility', () => {
        test('back link has proper aria-label', () => {
            const backLink = document.querySelector('.back-link');
            expect(backLink.getAttribute('aria-label')).toBe('Back to main portfolio');
        });

        test('Twitterizer link has proper aria-label', () => {
            const twitterizerLink = document.querySelector('a[href="twitterizer.html"]');
            expect(twitterizerLink.getAttribute('aria-label')).toBe('Twitterizer hashtag generator tool');
        });

        test('page uses semantic HTML', () => {
            const nav = document.querySelector('nav');
            const main = document.querySelector('main');
            const heading = document.querySelector('h1');

            expect(nav).toBeInTheDocument();
            expect(main).toBeInTheDocument();
            expect(heading).toBeInTheDocument();
        });

        test('all images have alt text or are decorative', () => {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                const hasAlt = img.hasAttribute('alt');
                const isDecorative = img.getAttribute('alt') === '' && img.getAttribute('role') === 'presentation';
                expect(hasAlt || isDecorative).toBe(true);
            });
        });
    });

    describe('Responsive Design', () => {
        test('grid layout classes are present', () => {
            const grid = document.querySelector('.project-grid');
            expect(grid).toBeInTheDocument();
        });

        test('projects container has correct class', () => {
            const container = document.querySelector('.projects-container');
            expect(container).toBeInTheDocument();
        });
    });

    describe('CSS and JavaScript Links', () => {
        test('links to shared-styles.css', () => {
            const sharedStyles = document.querySelector('link[href="shared-styles.css"]');
            expect(sharedStyles).toBeInTheDocument();
        });

        test('links to personal-projects.css', () => {
            const projectsStyles = document.querySelector('link[href="personal-projects.css"]');
            expect(projectsStyles).toBeInTheDocument();
        });

        test('links to Poppins font', () => {
            const fontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
            expect(fontLink).toBeInTheDocument();
            expect(fontLink.getAttribute('href')).toContain('Poppins');
        });
    });
});
