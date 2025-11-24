import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView for jsdom
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: function() {}
});
