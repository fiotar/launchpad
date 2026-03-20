import "@testing-library/jest-dom";

// Mock browser APIs not available in jsdom
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock localStorage
const _storage = {};
global.localStorage = {
  getItem: (key) => _storage[key] ?? null,
  setItem: (key, val) => { _storage[key] = String(val); },
  removeItem: (key) => { delete _storage[key]; },
  clear: () => { Object.keys(_storage).forEach((k) => delete _storage[k]); },
};

// Clear storage between tests
afterEach(() => {
  localStorage.clear();
});
