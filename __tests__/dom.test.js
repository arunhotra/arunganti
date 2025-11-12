/**
 * DOM Structure Tests
 *
 * These tests verify that the HTML structure is correct and contains
 * all expected elements with proper IDs, classes, and attributes.
 */

const fs = require('fs');
const path = require('path');

describe('DOM Structure and Elements', () => {
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

  describe('Page Metadata', () => {
    test('has correct page title', () => {
      const title = document.querySelector('title');
      expect(title).toBeInTheDocument();
      expect(title.textContent).toBe('Portfolio');
    });

    test('has viewport meta tag for responsive design', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeInTheDocument();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
    });

    test('has meta description', () => {
      const description = document.querySelector('meta[name="description"]');
      expect(description).toBeInTheDocument();
      expect(description.getAttribute('content')).toBeTruthy();
    });

    test('links to styles.css', () => {
      const styleLink = document.querySelector('link[rel="stylesheet"]:not([href*="googleapis"])');
      expect(styleLink).toBeInTheDocument();
      expect(styleLink.getAttribute('href')).toBe('styles.css');
    });

    test('links to script.js', () => {
      const script = document.querySelector('script[src="script.js"]');
      expect(script).toBeInTheDocument();
    });
  });

  describe('Background and Layout', () => {
    test('has hero background element', () => {
      const hero = document.querySelector('.hero-background');
      expect(hero).toBeInTheDocument();
      expect(hero.classList.contains('hero-background')).toBe(true);
    });
  });

  describe('Desktop Navigation', () => {
    test('has desktop navigation bar', () => {
      const nav = document.querySelector('.top-nav');
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe('NAV');
    });

    test('desktop nav has all required links', () => {
      const links = document.querySelectorAll('.top-nav .nav-link');
      expect(links.length).toBe(4);

      const hrefs = Array.from(links).map(link => link.getAttribute('href'));
      expect(hrefs).toEqual(['#about', '#projects', '#hobbies', 'javascript:void(0)']);

      const texts = Array.from(links).map(link => link.textContent);
      expect(texts).toEqual(['About Me', 'Projects', 'Hobbies', 'Resume']);
    });

    test('desktop nav has separators', () => {
      const separators = document.querySelectorAll('.nav-separator');
      expect(separators.length).toBe(3);
      separators.forEach(sep => {
        expect(sep.textContent).toBe('•');
      });
    });
  });

  describe('Mobile Navigation', () => {
    test('has hamburger menu button', () => {
      const hamburger = document.querySelector('.hamburger-menu');
      expect(hamburger).toBeInTheDocument();
      expect(hamburger.tagName).toBe('BUTTON');
    });

    test('hamburger button has three span elements', () => {
      const hamburger = document.querySelector('.hamburger-menu');
      const spans = hamburger.querySelectorAll('span');
      expect(spans.length).toBe(3);
    });

    test('has sidebar overlay element', () => {
      const overlay = document.querySelector('.sidebar-overlay');
      expect(overlay).toBeInTheDocument();
    });

    test('has sidebar menu', () => {
      const sidebar = document.querySelector('.sidebar-menu');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar.tagName).toBe('NAV');
    });

    test('sidebar has close button', () => {
      const closeBtn = document.querySelector('.sidebar-menu .close-btn');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn.textContent).toBe('×');
    });

    test('sidebar has all navigation links', () => {
      const links = document.querySelectorAll('.sidebar-link');
      expect(links.length).toBe(4);

      const hrefs = Array.from(links).map(link => link.getAttribute('href'));
      expect(hrefs).toEqual(['#about', '#projects', '#hobbies', 'javascript:void(0)']);
    });
  });

  describe('Content Sections', () => {
    test('has all four content sections', () => {
      const sections = document.querySelectorAll('.content-section');
      expect(sections.length).toBe(4);

      const ids = Array.from(sections).map(section => section.id);
      expect(ids).toEqual(['about', 'projects', 'hobbies', 'resume']);
    });

    test('each section has a content card', () => {
      const sections = document.querySelectorAll('.content-section');
      sections.forEach(section => {
        const card = section.querySelector('.content-card');
        expect(card).toBeInTheDocument();
      });
    });

    test('each content card has a heading', () => {
      const cards = document.querySelectorAll('.content-card');
      cards.forEach(card => {
        const heading = card.querySelector('h2');
        expect(heading).toBeInTheDocument();
      });
    });
  });

  describe('Projects Section', () => {
    test('has projects phrases overlay container', () => {
      const projectsPhrases = document.querySelector('.projects-phrases');
      expect(projectsPhrases).toBeInTheDocument();
    });

    test('projects phrases container is hidden by default', () => {
      const projectsPhrases = document.querySelector('.projects-phrases');
      expect(projectsPhrases.classList.contains('active')).toBe(false);
    });

    test('has F5 Projects link', () => {
      const f5Link = document.querySelector('.projects-phrases .project-phrase.left');
      expect(f5Link).toBeInTheDocument();
      expect(f5Link.tagName).toBe('A');
      expect(f5Link.textContent).toBe('F5 Projects');
    });

    test('has Personal Projects link', () => {
      const personalLink = document.querySelector('.projects-phrases .project-phrase.right');
      expect(personalLink).toBeInTheDocument();
      expect(personalLink.tagName).toBe('A');
      expect(personalLink.textContent).toBe('Personal Projects');
    });

    test('both project links have project-phrase class', () => {
      const projectLinks = document.querySelectorAll('.projects-phrases .project-phrase');
      expect(projectLinks.length).toBe(2);
    });
  });

  describe('ID Uniqueness', () => {
    test('all IDs are unique', () => {
      const elementsWithIds = document.querySelectorAll('[id]');
      const ids = Array.from(elementsWithIds).map(el => el.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });
  });
});
