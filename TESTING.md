# Testing Guide

This document explains the Test-Driven Development (TDD) approach used in this project and how to run tests using Podman containers.

## Table of Contents

1. [Why Test-Driven Development?](#why-test-driven-development)
2. [Setup Requirements](#setup-requirements)
3. [Running Tests](#running-tests)
4. [The TDD Cycle](#the-tdd-cycle)
5. [Test Structure](#test-structure)
6. [Writing New Tests](#writing-new-tests)
7. [Troubleshooting](#troubleshooting)

## Why Test-Driven Development?

Test-Driven Development (TDD) is a software development approach where you write tests BEFORE writing the actual code. Benefits include:

- **Better Design**: Writing tests first forces you to think about the API/interface before implementation
- **Living Documentation**: Tests serve as documentation showing how code should behave
- **Confidence**: Comprehensive tests let you refactor fearlessly
- **Fewer Bugs**: Catch issues early before they reach production
- **Faster Development**: May seem slower initially, but saves time debugging later

## Setup Requirements

### Required Software

- **Podman** (or Docker) - Container runtime
- **podman-compose** - For managing multi-container setups

Install Podman:
```bash
# macOS
brew install podman podman-compose

# Linux
sudo dnf install podman podman-compose  # Fedora/RHEL
sudo apt install podman podman-compose  # Debian/Ubuntu
```

### Why Containers?

We use containers to:
- Avoid installing Node.js and npm packages directly on your machine
- Ensure consistent testing environment across different machines
- Keep your corporate machine clean and isolated from dependencies

## Running Tests

### First Time Setup

Build the test container (only needed once, or when dependencies change):
```bash
podman-compose build
```

### Run Tests (One-Time)

Run all tests once:
```bash
./test.sh
```

Run tests with verbose output:
```bash
./test.sh --verbose
```

Run specific test file:
```bash
./test.sh __tests__/menu.test.js
```

### Run Tests in Watch Mode

For active development, run tests in watch mode. Tests automatically re-run when you save files:
```bash
./test-watch.sh
```

**Watch Mode Commands:**
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `p` to filter by filename pattern
- Press `t` to filter by test name pattern
- Press `q` to quit

### Generate Coverage Report

See how much of your code is covered by tests:
```bash
./test.sh --coverage
```

Coverage report will show:
- **Statements**: Percentage of statements executed
- **Branches**: Percentage of if/else branches taken
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Interactive Shell

Open a shell inside the container for debugging:
```bash
./shell.sh
```

## The TDD Cycle

TDD follows the **Red-Green-Refactor** cycle:

### 1. RED - Write a Failing Test

Write a test that describes what you want the code to do. The test should fail because the feature doesn't exist yet.

**Example:**
```javascript
// __tests__/menu.test.js
test('clicking hamburger button opens sidebar menu', () => {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebarMenu');

  hamburger.click();

  expect(sidebar.classList.contains('active')).toBe(true);
});
```

Run the test - it should fail (RED).

### 2. GREEN - Write Minimal Code to Pass

Write just enough code to make the test pass. Don't worry about perfection yet.

**Example:**
```javascript
// script.js
hamburgerBtn.addEventListener('click', () => {
    sidebarMenu.classList.add('active');
});
```

Run the test - it should now pass (GREEN).

### 3. REFACTOR - Improve the Code

Now that tests are passing, improve the code quality while ensuring tests stay green.

**Example:**
```javascript
// script.js - refactored
function openSidebar() {
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

hamburgerBtn.addEventListener('click', openSidebar);
```

Run tests again - they should still pass.

### 4. Repeat

Go back to step 1 and write the next test for the next feature.

## Test Structure

Tests are organized in the `__tests__/` directory:

```
__tests__/
├── menu.test.js          # Mobile menu functionality tests
├── dom.test.js           # HTML structure and element tests
└── accessibility.test.js # Accessibility (a11y) compliance tests
```

### Test Categories

**1. Functionality Tests (menu.test.js)**
- Test JavaScript behavior
- Verify event handlers work correctly
- Check state changes

**2. DOM Structure Tests (dom.test.js)**
- Verify HTML elements exist
- Check IDs and classes are correct
- Ensure proper semantic structure

**3. Accessibility Tests (accessibility.test.js)**
- Automated accessibility checks with jest-axe
- ARIA labels and attributes
- Keyboard navigation
- Screen reader compatibility

## Writing New Tests

### Test File Template

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup code - runs before each test
  });

  afterEach(() => {
    // Cleanup code - runs after each test
  });

  describe('Subfeature', () => {
    test('should do something specific', () => {
      // Arrange - Set up test conditions
      const element = document.getElementById('myElement');

      // Act - Perform the action being tested
      element.click();

      // Assert - Verify the expected outcome
      expect(element.classList.contains('active')).toBe(true);
    });
  });
});
```

### Common Jest Matchers

```javascript
expect(value).toBe(expected)              // Strict equality
expect(value).toEqual(expected)           // Deep equality
expect(value).toBeTruthy()                // Truthy value
expect(value).toBeFalsy()                 // Falsy value
expect(array).toContain(item)             // Array contains item
expect(element).toBeInTheDocument()       // Element exists in DOM
expect(element).toHaveAttribute('id')     // Element has attribute
expect(element).toHaveClass('active')     // Element has CSS class
```

### TDD Workflow Example

Let's say you want to add a feature: "Escape key closes the mobile menu"

**Step 1: Write the test (RED)**
```javascript
// __tests__/menu.test.js
test('pressing Escape key closes open sidebar menu', () => {
  // Open menu
  const hamburger = document.getElementById('hamburgerBtn');
  hamburger.click();

  const sidebar = document.getElementById('sidebarMenu');
  expect(sidebar.classList.contains('active')).toBe(true);

  // Press Escape
  const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
  document.dispatchEvent(escapeEvent);

  // Menu should be closed
  expect(sidebar.classList.contains('active')).toBe(false);
});
```

Run test: `./test.sh` - It fails ❌

**Step 2: Write code to make it pass (GREEN)**
```javascript
// script.js
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});
```

Run test: `./test.sh` - It passes ✅

**Step 3: Refactor if needed**
```javascript
// script.js - refactored for better organization
function handleKeyDown(event) {
    if (event.key === 'Escape' && sidebarMenu.classList.contains('active')) {
        closeSidebar();
    }
}

document.addEventListener('keydown', handleKeyDown);
```

Run test: `./test.sh` - Still passes ✅

## Troubleshooting

### Container Issues

**Container won't build:**
```bash
# Rebuild from scratch
podman-compose build --no-cache
```

**Permission errors:**
```bash
# Make sure scripts are executable
chmod +x test.sh test-watch.sh shell.sh
```

### Test Issues

**Tests can't find elements:**
- Check that IDs and classes match between HTML and tests
- Ensure HTML file is being loaded in beforeEach

**Tests fail in container but pass locally:**
- Make sure you're not relying on local npm packages
- Check that all files are properly mounted in docker-compose.yml

**Module not found errors:**
- Rebuild container: `podman-compose build`
- Check that package.json lists all dependencies

### Getting Help

- View Jest documentation: https://jestjs.io/docs/getting-started
- Testing Library docs: https://testing-library.com/docs/
- Jest-axe for accessibility: https://github.com/nickcolley/jest-axe

## Best Practices

1. **Write tests first** - Follow the TDD cycle religiously
2. **One test, one assertion** - Keep tests focused and simple
3. **Descriptive test names** - Test names should explain what's being tested
4. **Arrange-Act-Assert** - Structure tests clearly
5. **Don't test implementation details** - Test behavior, not internals
6. **Keep tests independent** - Tests shouldn't depend on each other
7. **Clean up after tests** - Use afterEach to reset state

## Coverage Goals

Target coverage thresholds (defined in jest.config.js):
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

These are enforced automatically. Tests will fail if coverage drops below these thresholds.
