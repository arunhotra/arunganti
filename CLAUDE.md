# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML/CSS portfolio website featuring a single-page design with a glassmorphism aesthetic. The site includes sections for About Me, Projects, Hobbies, and Resume, with smooth scrolling navigation.

## File Structure

- `index.html` - Main HTML file containing the page structure and all content sections
- `styles.css` - All styling including glassmorphism effects, responsive design, and animations
- `script.js` - JavaScript for mobile menu functionality
- `pics/` - Image assets directory
  - Desktop background: `pics/alternate-main.jpg`
  - Mobile background: `pics/main-page.jpg`
- `__tests__/` - Jest test files
  - `menu.test.js` - Mobile menu functionality tests
  - `dom.test.js` - DOM structure tests
  - `accessibility.test.js` - Accessibility compliance tests
- `Dockerfile` - Container definition for testing environment
- `docker-compose.yml` - Container orchestration for tests
- `jest.config.js` - Jest testing configuration
- `TESTING.md` - Comprehensive testing documentation

## Development

### Running the Website

This is a static website with no build process. To develop:

1. Open `index.html` directly in a browser, or
2. Use a local server: `python3 -m http.server 8000` (then visit http://localhost:8000)

### Running Tests (Containerized TDD)

Tests run in Podman containers to avoid installing dependencies locally:

```bash
# Run all tests once
./test.sh

# Run tests in watch mode (auto-rerun on changes)
./test-watch.sh

# Run tests with coverage report
./test.sh --coverage

# Open shell in test container
./shell.sh
```

**Prerequisites:** Podman and podman-compose must be installed.

See `TESTING.md` for comprehensive TDD workflow and best practices.

## Design System

**Glassmorphism Pattern:**
- Translucent backgrounds use `rgba(255, 255, 255, 0.1-0.15)`
- Backdrop blur: `backdrop-filter: blur(10px)` and `-webkit-backdrop-filter: blur(10px)`
- Borders: `1px solid rgba(255, 255, 255, 0.2-0.3)`
- Box shadows: `0 8px 32px 0 rgba(0, 0, 0, 0.2-0.3)`

**Color Scheme:**
- Text: White with varying opacity (0.5-1.0)
- Backgrounds: Semi-transparent white overlays on background image

**Responsive Breakpoints:**
- `768px` - Tablet adjustments
- `480px` - Mobile adjustments (hides nav separators)

## Architecture Notes

**Fixed Background Pattern:**
The `.hero-background` element uses `position: fixed` to create a parallax-like effect where the background image stays in place while content scrolls over it.

**Navigation:**
The `.top-nav` is fixed at the top and uses smooth scroll anchors to navigate between sections. Each section has `min-height: 100vh` to create full-page sections.

**First Section Behavior:**
The `#about` section has special styling where the `.content-card` is hidden (`display: none`) to allow the background image to display without obstruction on the hero/landing view.

**Mobile Navigation:**
- Desktop (>480px): Glassmorphism navigation bar (`.top-nav`) displayed
- Mobile (≤480px): Hamburger menu (`.hamburger-menu`) displayed, desktop nav hidden
- Sidebar menu (`.sidebar-menu`) slides in from right with overlay backdrop
- JavaScript in `script.js` handles menu open/close interactions
- Menu elements are completely hidden on desktop using `display: none`

**Responsive Background Images:**
- Desktop/tablets use `pics/alternate-main.jpg`
- Mobile (≤480px) uses `pics/main-page.jpg`
- Both images are web-optimized JPG format

## Test-Driven Development (TDD)

This project follows TDD practices using Jest in a containerized environment:

**TDD Workflow (Red-Green-Refactor):**
1. **RED**: Write a failing test that describes desired behavior
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Improve code while keeping tests green
4. Repeat

**When adding new features:**
1. Write the test first in `__tests__/` directory
2. Run `./test-watch.sh` to see it fail
3. Implement the feature in the appropriate file
4. See the test pass
5. Refactor if needed

**Test coverage requirements:**
- Minimum 70% coverage for statements, branches, functions, and lines
- Tests automatically fail if coverage drops below thresholds

**What to test:**
- JavaScript functionality (event handlers, state changes)
- DOM structure (elements exist with correct IDs/classes)
- Accessibility (ARIA labels, keyboard navigation, semantic HTML)
- Responsive behavior (though matchMedia is mocked in tests)
