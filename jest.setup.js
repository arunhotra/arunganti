// Import jest-dom matchers
require('@testing-library/jest-dom');

// Import jest-axe for accessibility testing
const { toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
