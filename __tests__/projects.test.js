/**
 * Projects Page Links Tests
 *
 * TDD: These tests are written BEFORE implementing the projects links functionality.
 * This demonstrates the Red-Green-Refactor cycle:
 * 1. RED: Write failing test that describes desired behavior
 * 2. GREEN: Write minimal code to make test pass
 * 3. REFACTOR: Improve code while keeping tests green
 */

const fs = require('fs');
const path = require('path');

describe('Projects Page Links Functionality', () => {
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
    const moduleExportMatch = scriptContent.match(/if \(typeof module[\s\S]*?module\.exports[\s\S]*?\n\}/);
    const browserScript = moduleExportMatch
      ? scriptContent.replace(moduleExportMatch[0], '')
      : scriptContent;
    eval(browserScript);
  });

  afterEach(() => {
    document.documentElement.innerHTML = '';
  });

  describe('Projects Section and Links Exist', () => {
    test('projects section exists with correct ID', () => {
      const projectsSection = document.getElementById('projects');
      expect(projectsSection).toBeInTheDocument();
      expect(projectsSection.tagName).toBe('SECTION');
    });

    test('projects links container exists', () => {
      const projectsLinks = document.querySelector('.projects-links');
      expect(projectsLinks).toBeInTheDocument();
    });

    test('F5 projects link exists with correct text', () => {
      const f5Link = document.querySelector('.project-link-left');
      expect(f5Link).toBeInTheDocument();
      expect(f5Link.textContent).toBe('F5 projects');
      expect(f5Link.tagName).toBe('A');
    });

    test('Personal projects link exists with correct text', () => {
      const personalLink = document.querySelector('.project-link-right');
      expect(personalLink).toBeInTheDocument();
      expect(personalLink.textContent).toBe('personal projects');
      expect(personalLink.tagName).toBe('A');
    });
  });

  describe('Projects Links Visibility Toggle', () => {
    test('projects links are hidden by default', () => {
      const projectsLinks = document.querySelector('.projects-links');
      expect(projectsLinks.classList.contains('active')).toBe(false);
    });

    test('clicking Projects nav link shows project links', () => {
      const projectsNavLink = document.querySelector('a[href="#projects"]');
      const projectsLinks = document.querySelector('.projects-links');

      // Initially hidden
      expect(projectsLinks.classList.contains('active')).toBe(false);

      // Click projects link
      projectsNavLink.click();

      // Should now be visible
      expect(projectsLinks.classList.contains('active')).toBe(true);
    });

    test('clicking Projects nav link hides other section phrases', () => {
      const projectsNavLink = document.querySelector('a[href="#projects"]');
      const aboutMePhrases = document.querySelector('.about-me-phrases');
      const hobbiesPhrases = document.querySelector('.hobbies-phrases');

      // Activate about me phrases first
      aboutMePhrases.classList.add('active');
      hobbiesPhrases.classList.add('active');

      // Click projects link
      projectsNavLink.click();

      // Other phrases should be hidden
      expect(aboutMePhrases.classList.contains('active')).toBe(false);
      expect(hobbiesPhrases.classList.contains('active')).toBe(false);
    });

    test('clicking Projects link toggles visibility', () => {
      const projectsNavLink = document.querySelector('a[href="#projects"]');
      const projectsLinks = document.querySelector('.projects-links');

      // First click shows links
      projectsNavLink.click();
      expect(projectsLinks.classList.contains('active')).toBe(true);

      // Second click hides links
      projectsNavLink.click();
      expect(projectsLinks.classList.contains('active')).toBe(false);
    });

    test('clicking Projects in mobile sidebar also shows project links', () => {
      const projectsSidebarLink = document.querySelector('.sidebar-link[href="#projects"]');
      const projectsLinks = document.querySelector('.projects-links');

      // Initially hidden
      expect(projectsLinks.classList.contains('active')).toBe(false);

      // Click projects sidebar link
      projectsSidebarLink.click();

      // Should now be visible
      expect(projectsLinks.classList.contains('active')).toBe(true);
    });
  });

  describe('Projects Links Positioning', () => {
    test('projects links container exists with correct class', () => {
      const projectsLinks = document.querySelector('.projects-links');
      expect(projectsLinks).toBeInTheDocument();
      expect(projectsLinks.classList.contains('projects-links')).toBe(true);
    });

    test('F5 projects link is positioned on left side', () => {
      const f5Link = document.querySelector('.project-link-left');
      const styles = window.getComputedStyle(f5Link);
      // Left positioned link should not have right alignment
      expect(styles.left).not.toBe('auto');
    });

    test('Personal projects link is positioned on right side', () => {
      const personalLink = document.querySelector('.project-link-right');
      const styles = window.getComputedStyle(personalLink);
      // Right positioned link should not have left alignment
      expect(styles.right).not.toBe('auto');
    });
  });
});
