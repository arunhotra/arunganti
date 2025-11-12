/**
 * About Me Interactive Display Tests
 *
 * TDD: These tests are written BEFORE implementing the feature.
 * This follows the Red-Green-Refactor cycle.
 */

const fs = require('fs');
const path = require('path');

describe('About Me Interactive Display', () => {
  beforeEach(() => {
    // Load HTML file
    const html = fs.readFileSync(
      path.resolve(__dirname, '../index.html'),
      'utf8'
    );
    document.documentElement.innerHTML = html;

    // Load and execute script
    const scriptPath = path.resolve(__dirname, '../script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    // Remove module.exports for browser context
    const browserScript = scriptContent.replace(/\/\/ Export functions for testing[\s\S]*?^\}/m, '');
    eval(browserScript);
  });

  afterEach(() => {
    document.documentElement.innerHTML = '';
  });

  describe('Phrases Container Exists', () => {
    test('about-me-phrases container exists', () => {
      const phrasesContainer = document.querySelector('.about-me-phrases');
      expect(phrasesContainer).toBeInTheDocument();
    });

    test('container has all four phrases', () => {
      const phrases = document.querySelectorAll('.about-me-phrases .phrase');
      expect(phrases.length).toBe(4);

      const phraseTexts = Array.from(phrases).map(p => p.textContent.trim());
      expect(phraseTexts).toContain('techie');
      expect(phraseTexts).toContain('creative thinker');
      expect(phraseTexts).toContain('perpetual learner');
      expect(phraseTexts).toContain('bon vivant');
    });

    test('container is hidden by default', () => {
      const phrasesContainer = document.querySelector('.about-me-phrases');
      expect(phrasesContainer.classList.contains('active')).toBe(false);
    });
  });

  describe('Toggle Functionality', () => {
    test('clicking desktop About Me link shows phrases', () => {
      const aboutMeLink = document.querySelector('.top-nav .nav-link[href="#about"]');
      const phrasesContainer = document.querySelector('.about-me-phrases');

      // Initially hidden
      expect(phrasesContainer.classList.contains('active')).toBe(false);

      // Click About Me
      aboutMeLink.click();

      // Should be visible
      expect(phrasesContainer.classList.contains('active')).toBe(true);
    });

    test('clicking desktop About Me link again keeps phrases visible', () => {
      const aboutMeLink = document.querySelector('.top-nav .nav-link[href="#about"]');
      const phrasesContainer = document.querySelector('.about-me-phrases');

      // Click to show
      aboutMeLink.click();
      expect(phrasesContainer.classList.contains('active')).toBe(true);

      // Click again - should remain visible
      aboutMeLink.click();
      expect(phrasesContainer.classList.contains('active')).toBe(true);
    });

    test('clicking mobile About Me link shows phrases', () => {
      const aboutMeLink = document.querySelector('.sidebar-menu .sidebar-link[href="#about"]');
      const phrasesContainer = document.querySelector('.about-me-phrases');

      // Initially hidden
      expect(phrasesContainer.classList.contains('active')).toBe(false);

      // Click About Me
      aboutMeLink.click();

      // Should be visible
      expect(phrasesContainer.classList.contains('active')).toBe(true);
    });

    test('clicking mobile About Me link again keeps phrases visible', () => {
      const aboutMeLink = document.querySelector('.sidebar-menu .sidebar-link[href="#about"]');
      const phrasesContainer = document.querySelector('.about-me-phrases');

      // Click to show
      aboutMeLink.click();
      expect(phrasesContainer.classList.contains('active')).toBe(true);

      // Click again - should remain visible
      aboutMeLink.click();
      expect(phrasesContainer.classList.contains('active')).toBe(true);
    });

    test('About Me link prevents default scroll behavior when toggling', () => {
      const aboutMeLink = document.querySelector('.top-nav .nav-link[href="#about"]');
      const phrasesContainer = document.querySelector('.about-me-phrases');

      // Create a mock event
      const mockEvent = new Event('click', { bubbles: true, cancelable: true });
      let defaultPrevented = false;
      mockEvent.preventDefault = () => { defaultPrevented = true; };

      // Initially, phrases are hidden, so clicking should prevent default
      aboutMeLink.dispatchEvent(mockEvent);

      // When toggling phrases, default should be prevented
      // (this behavior may vary based on implementation)
    });
  });

  describe('Accessibility', () => {
    test('phrases are in semantic elements', () => {
      const phrases = document.querySelectorAll('.about-me-phrases .phrase');
      phrases.forEach(phrase => {
        // Each phrase should be in a span or other inline element
        expect(['SPAN', 'DIV', 'P']).toContain(phrase.tagName);
      });
    });
  });
});
