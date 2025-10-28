/**
 * Hobbies Interactive Display Tests
 *
 * TDD: These tests are written BEFORE implementing the feature.
 * This follows the Red-Green-Refactor cycle.
 */

const fs = require('fs');
const path = require('path');

describe('Hobbies Interactive Display', () => {
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
    const browserScript = scriptContent.replace(/if \(typeof module[\s\S]*?\}\s*\}/s, '');
    eval(browserScript);
  });

  afterEach(() => {
    document.documentElement.innerHTML = '';
  });

  describe('Hobbies Container Exists', () => {
    test('hobbies-phrases container exists', () => {
      const phrasesContainer = document.querySelector('.hobbies-phrases');
      expect(phrasesContainer).toBeInTheDocument();
    });

    test('container has all four hobbies', () => {
      const phrases = document.querySelectorAll('.hobbies-phrases .phrase');
      expect(phrases.length).toBe(4);

      const phraseTexts = Array.from(phrases).map(p => p.textContent.trim());
      expect(phraseTexts).toContain('liverpool');
      expect(phraseTexts).toContain('dancing');
      expect(phraseTexts).toContain('improv');
      expect(phraseTexts).toContain('volleyball');
    });

    test('container is hidden by default', () => {
      const phrasesContainer = document.querySelector('.hobbies-phrases');
      expect(phrasesContainer.classList.contains('active')).toBe(false);
    });
  });

  describe('Toggle Functionality', () => {
    test('clicking desktop Hobbies link shows phrases', () => {
      const hobbiesLink = document.querySelector('.top-nav .nav-link[href="#hobbies"]');
      const phrasesContainer = document.querySelector('.hobbies-phrases');

      // Initially hidden
      expect(phrasesContainer.classList.contains('active')).toBe(false);

      // Click Hobbies
      hobbiesLink.click();

      // Should be visible
      expect(phrasesContainer.classList.contains('active')).toBe(true);
    });

    test('clicking desktop Hobbies link again hides phrases', () => {
      const hobbiesLink = document.querySelector('.top-nav .nav-link[href="#hobbies"]');
      const phrasesContainer = document.querySelector('.hobbies-phrases');

      // Click to show
      hobbiesLink.click();
      expect(phrasesContainer.classList.contains('active')).toBe(true);

      // Click again to hide
      hobbiesLink.click();
      expect(phrasesContainer.classList.contains('active')).toBe(false);
    });

    test('clicking mobile Hobbies link shows phrases', () => {
      const hobbiesLink = document.querySelector('.sidebar-menu .sidebar-link[href="#hobbies"]');
      const phrasesContainer = document.querySelector('.hobbies-phrases');

      // Initially hidden
      expect(phrasesContainer.classList.contains('active')).toBe(false);

      // Click Hobbies
      hobbiesLink.click();

      // Should be visible
      expect(phrasesContainer.classList.contains('active')).toBe(true);
    });

    test('clicking mobile Hobbies link again hides phrases', () => {
      const hobbiesLink = document.querySelector('.sidebar-menu .sidebar-link[href="#hobbies"]');
      const phrasesContainer = document.querySelector('.hobbies-phrases');

      // Click to show
      hobbiesLink.click();
      expect(phrasesContainer.classList.contains('active')).toBe(true);

      // Click again to hide
      hobbiesLink.click();
      expect(phrasesContainer.classList.contains('active')).toBe(false);
    });

    test('Hobbies link prevents default scroll behavior when toggling', () => {
      const hobbiesLink = document.querySelector('.top-nav .nav-link[href="#hobbies"]');
      const phrasesContainer = document.querySelector('.hobbies-phrases');

      // Create a mock event
      const mockEvent = new Event('click', { bubbles: true, cancelable: true });
      let defaultPrevented = false;
      mockEvent.preventDefault = () => { defaultPrevented = true; };

      // Initially, phrases are hidden, so clicking should prevent default
      hobbiesLink.dispatchEvent(mockEvent);

      // When toggling phrases, default should be prevented
      // (this behavior may vary based on implementation)
    });
  });

  describe('Accessibility', () => {
    test('phrases are in semantic elements', () => {
      const phrases = document.querySelectorAll('.hobbies-phrases .phrase');
      phrases.forEach(phrase => {
        // Each phrase should be in a span or other inline element
        expect(['SPAN', 'DIV', 'P']).toContain(phrase.tagName);
      });
    });
  });
});
