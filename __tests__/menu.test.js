/**
 * Mobile Menu Functionality Tests
 *
 * TDD Example: These tests were written BEFORE implementing the menu functionality.
 * This demonstrates the Red-Green-Refactor cycle:
 * 1. RED: Write failing test that describes desired behavior
 * 2. GREEN: Write minimal code to make test pass
 * 3. REFACTOR: Improve code while keeping tests green
 */

const fs = require('fs');
const path = require('path');

describe('Mobile Menu Functionality', () => {
  let container;

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

  describe('Menu Elements Exist', () => {
    test('hamburger button exists with correct ID', () => {
      const hamburger = document.getElementById('hamburgerBtn');
      expect(hamburger).toBeInTheDocument();
      expect(hamburger.tagName).toBe('BUTTON');
    });

    test('sidebar menu exists with correct ID', () => {
      const sidebar = document.getElementById('sidebarMenu');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar.tagName).toBe('NAV');
    });

    test('sidebar overlay exists with correct ID', () => {
      const overlay = document.getElementById('sidebarOverlay');
      expect(overlay).toBeInTheDocument();
    });

    test('close button exists with correct ID', () => {
      const closeBtn = document.getElementById('closeBtn');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn.tagName).toBe('BUTTON');
    });

    test('sidebar contains navigation links', () => {
      const links = document.querySelectorAll('.sidebar-link');
      expect(links.length).toBe(4);

      const linkTexts = Array.from(links).map(link => link.textContent);
      expect(linkTexts).toEqual(['About Me', 'Projects', 'Hobbies', 'Resume']);
    });
  });

  describe('Menu Opening Behavior', () => {
    test('clicking hamburger button opens sidebar menu', () => {
      const hamburger = document.getElementById('hamburgerBtn');
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('sidebarOverlay');

      // Initially, menu should not have 'active' class
      expect(sidebar.classList.contains('active')).toBe(false);
      expect(overlay.classList.contains('active')).toBe(false);

      // Click hamburger
      hamburger.click();

      // Menu should now be active
      expect(sidebar.classList.contains('active')).toBe(true);
      expect(overlay.classList.contains('active')).toBe(true);
    });

    test('opening menu prevents body scrolling', () => {
      const hamburger = document.getElementById('hamburgerBtn');

      expect(document.body.style.overflow).toBe('');

      hamburger.click();

      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('Menu Closing Behavior', () => {
    beforeEach(() => {
      // Open menu first
      const hamburger = document.getElementById('hamburgerBtn');
      hamburger.click();
    });

    test('clicking close button closes sidebar menu', () => {
      const closeBtn = document.getElementById('closeBtn');
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('sidebarOverlay');

      // Menu should be open
      expect(sidebar.classList.contains('active')).toBe(true);

      // Click close button
      closeBtn.click();

      // Menu should be closed
      expect(sidebar.classList.contains('active')).toBe(false);
      expect(overlay.classList.contains('active')).toBe(false);
    });

    test('clicking overlay closes sidebar menu', () => {
      const overlay = document.getElementById('sidebarOverlay');
      const sidebar = document.getElementById('sidebarMenu');

      // Menu should be open
      expect(sidebar.classList.contains('active')).toBe(true);

      // Click overlay
      overlay.click();

      // Menu should be closed
      expect(sidebar.classList.contains('active')).toBe(false);
    });

    test('clicking navigation link closes sidebar menu', () => {
      const sidebar = document.getElementById('sidebarMenu');
      const firstLink = document.querySelector('.sidebar-link');

      // Menu should be open
      expect(sidebar.classList.contains('active')).toBe(true);

      // Click nav link
      firstLink.click();

      // Menu should be closed
      expect(sidebar.classList.contains('active')).toBe(false);
    });

    test('closing menu re-enables body scrolling', () => {
      const closeBtn = document.getElementById('closeBtn');

      // Menu is open, scrolling disabled
      expect(document.body.style.overflow).toBe('hidden');

      closeBtn.click();

      // Menu closed, scrolling enabled
      expect(document.body.style.overflow).toBe('');
    });
  });
});
