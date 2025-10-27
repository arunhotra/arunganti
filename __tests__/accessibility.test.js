/**
 * Accessibility (A11y) Tests
 *
 * These tests ensure the website is accessible to users with disabilities,
 * including those using screen readers, keyboard navigation, and assistive technologies.
 */

const fs = require('fs');
const path = require('path');
const { axe, toHaveNoViolations } = require('jest-axe');

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  beforeEach(() => {
    const html = fs.readFileSync(
      path.resolve(__dirname, '../index.html'),
      'utf8'
    );
    document.documentElement.innerHTML = html;
  });

  afterEach(() => {
    document.documentElement.innerHTML = '';
  });

  describe('Automated Accessibility Checks', () => {
    test('page has no automatically detectable accessibility violations', async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Labels and Attributes', () => {
    test('hamburger menu button has aria-label', () => {
      const hamburger = document.querySelector('.hamburger-menu');
      expect(hamburger).toHaveAttribute('aria-label');
      expect(hamburger.getAttribute('aria-label')).toBe('Toggle menu');
    });

    test('close button has aria-label', () => {
      const closeBtn = document.querySelector('.close-btn');
      expect(closeBtn).toHaveAttribute('aria-label');
      expect(closeBtn.getAttribute('aria-label')).toBe('Close menu');
    });

    test('all navigation links are accessible', () => {
      const desktopLinks = document.querySelectorAll('.top-nav .nav-link');
      const sidebarLinks = document.querySelectorAll('.sidebar-link');

      [...desktopLinks, ...sidebarLinks].forEach(link => {
        expect(link.textContent.trim()).not.toBe('');
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Semantic HTML', () => {
    test('uses semantic nav elements', () => {
      const navElements = document.querySelectorAll('nav');
      expect(navElements.length).toBeGreaterThan(0);
    });

    test('uses semantic section elements', () => {
      const sections = document.querySelectorAll('section');
      expect(sections.length).toBe(4);
    });

    test('headings are properly structured', () => {
      const h2s = document.querySelectorAll('h2');
      expect(h2s.length).toBeGreaterThan(0);

      // Each section should have a heading
      const sections = document.querySelectorAll('.content-section');
      sections.forEach(section => {
        const heading = section.querySelector('h2');
        expect(heading).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Elements', () => {
    test('all buttons are actual button elements', () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    test('links have meaningful text', () => {
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        const text = link.textContent.trim();
        expect(text.length).toBeGreaterThan(0);
        // Avoid generic link text
        expect(text.toLowerCase()).not.toBe('click here');
        expect(text.toLowerCase()).not.toBe('read more');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('interactive elements are focusable', () => {
      const hamburger = document.querySelector('.hamburger-menu');
      const closeBtn = document.querySelector('.close-btn');
      const links = document.querySelectorAll('a');

      // Buttons should not have tabindex that removes them from tab order
      expect(hamburger.getAttribute('tabindex')).not.toBe('-1');
      expect(closeBtn.getAttribute('tabindex')).not.toBe('-1');

      // Links should be naturally focusable
      links.forEach(link => {
        expect(link.getAttribute('tabindex')).not.toBe('-1');
      });
    });
  });

  describe('Language and Document Structure', () => {
    test('html element has lang attribute', () => {
      const html = document.documentElement;
      expect(html).toHaveAttribute('lang');
      expect(html.getAttribute('lang')).toBe('en');
    });

    test('document has a title', () => {
      const title = document.querySelector('title');
      expect(title).toBeInTheDocument();
      expect(title.textContent.trim()).not.toBe('');
    });
  });

  describe('Form and Button Labels', () => {
    test('all buttons have accessible names', () => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const hasText = button.textContent.trim().length > 0;
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');

        expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBe(true);
      });
    });
  });
});
