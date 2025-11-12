/**
 * Navigation Phrases Toggle Tests
 *
 * TDD: This test was written FIRST to demonstrate the bug where Projects phrases
 * remain visible when navigating to other sections.
 *
 * Bug: When clicking "Projects", subsection text appears. When then clicking
 * "About Me" or "Hobbies", the Projects text should disappear but doesn't.
 */

const fs = require('fs');
const path = require('path');

describe('Navigation Phrases Toggle Functionality', () => {
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

  describe('Phrase Elements Exist', () => {
    test('about me phrases container exists', () => {
      const aboutPhrases = document.querySelector('.about-me-phrases');
      expect(aboutPhrases).toBeInTheDocument();
    });

    test('hobbies phrases container exists', () => {
      const hobbiesPhrases = document.querySelector('.hobbies-phrases');
      expect(hobbiesPhrases).toBeInTheDocument();
    });

    test('projects phrases container exists', () => {
      const projectsPhrases = document.querySelector('.projects-phrases');
      expect(projectsPhrases).toBeInTheDocument();
    });
  });

  describe('Single Section Visibility', () => {
    test('clicking About Me shows only about me phrases', () => {
      const aboutLink = document.querySelector('a[href="#about"]');
      const aboutPhrases = document.querySelector('.about-me-phrases');
      const hobbiesPhrases = document.querySelector('.hobbies-phrases');
      const projectsPhrases = document.querySelector('.projects-phrases');

      // Click About Me
      aboutLink.click();

      // Only About Me phrases should be active
      expect(aboutPhrases.classList.contains('active')).toBe(true);
      expect(hobbiesPhrases.classList.contains('active')).toBe(false);
      expect(projectsPhrases.classList.contains('active')).toBe(false);
    });

    test('clicking Hobbies shows only hobbies phrases', () => {
      const hobbiesLink = document.querySelector('a[href="#hobbies"]');
      const aboutPhrases = document.querySelector('.about-me-phrases');
      const hobbiesPhrases = document.querySelector('.hobbies-phrases');
      const projectsPhrases = document.querySelector('.projects-phrases');

      // Click Hobbies
      hobbiesLink.click();

      // Only Hobbies phrases should be active
      expect(aboutPhrases.classList.contains('active')).toBe(false);
      expect(hobbiesPhrases.classList.contains('active')).toBe(true);
      expect(projectsPhrases.classList.contains('active')).toBe(false);
    });

    test('clicking Projects shows only projects phrases', () => {
      const projectsLink = document.querySelector('a[href="#projects"]');
      const aboutPhrases = document.querySelector('.about-me-phrases');
      const hobbiesPhrases = document.querySelector('.hobbies-phrases');
      const projectsPhrases = document.querySelector('.projects-phrases');

      // Click Projects
      projectsLink.click();

      // Only Projects phrases should be active
      expect(aboutPhrases.classList.contains('active')).toBe(false);
      expect(hobbiesPhrases.classList.contains('active')).toBe(false);
      expect(projectsPhrases.classList.contains('active')).toBe(true);
    });
  });

  describe('Bug Fix: Projects phrases should hide when navigating away', () => {
    test('projects phrases hide when clicking About Me after Projects', () => {
      const projectsLink = document.querySelector('a[href="#projects"]');
      const aboutLink = document.querySelector('a[href="#about"]');
      const projectsPhrases = document.querySelector('.projects-phrases');
      const aboutPhrases = document.querySelector('.about-me-phrases');

      // First click Projects
      projectsLink.click();
      expect(projectsPhrases.classList.contains('active')).toBe(true);

      // Then click About Me
      aboutLink.click();

      // Projects phrases should be hidden, About Me should be shown
      expect(projectsPhrases.classList.contains('active')).toBe(false);
      expect(aboutPhrases.classList.contains('active')).toBe(true);
    });

    test('projects phrases hide when clicking Hobbies after Projects', () => {
      const projectsLink = document.querySelector('a[href="#projects"]');
      const hobbiesLink = document.querySelector('a[href="#hobbies"]');
      const projectsPhrases = document.querySelector('.projects-phrases');
      const hobbiesPhrases = document.querySelector('.hobbies-phrases');

      // First click Projects
      projectsLink.click();
      expect(projectsPhrases.classList.contains('active')).toBe(true);

      // Then click Hobbies
      hobbiesLink.click();

      // Projects phrases should be hidden, Hobbies should be shown
      expect(projectsPhrases.classList.contains('active')).toBe(false);
      expect(hobbiesPhrases.classList.contains('active')).toBe(true);
    });
  });

  describe('Mutual Exclusivity of Phrases', () => {
    test('navigating between all sections maintains mutual exclusivity', () => {
      const aboutLink = document.querySelector('a[href="#about"]');
      const projectsLink = document.querySelector('a[href="#projects"]');
      const hobbiesLink = document.querySelector('a[href="#hobbies"]');
      const aboutPhrases = document.querySelector('.about-me-phrases');
      const hobbiesPhrases = document.querySelector('.hobbies-phrases');
      const projectsPhrases = document.querySelector('.projects-phrases');

      // Start with About Me
      aboutLink.click();
      expect(aboutPhrases.classList.contains('active')).toBe(true);
      expect(hobbiesPhrases.classList.contains('active')).toBe(false);
      expect(projectsPhrases.classList.contains('active')).toBe(false);

      // Navigate to Projects
      projectsLink.click();
      expect(aboutPhrases.classList.contains('active')).toBe(false);
      expect(hobbiesPhrases.classList.contains('active')).toBe(false);
      expect(projectsPhrases.classList.contains('active')).toBe(true);

      // Navigate to Hobbies
      hobbiesLink.click();
      expect(aboutPhrases.classList.contains('active')).toBe(false);
      expect(hobbiesPhrases.classList.contains('active')).toBe(true);
      expect(projectsPhrases.classList.contains('active')).toBe(false);

      // Navigate back to About Me
      aboutLink.click();
      expect(aboutPhrases.classList.contains('active')).toBe(true);
      expect(hobbiesPhrases.classList.contains('active')).toBe(false);
      expect(projectsPhrases.classList.contains('active')).toBe(false);
    });
  });
});
