import '@testing-library/jest-dom';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock WebSocket for cognitive architecture tests
global.WebSocket = jest.fn(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
})) as any;

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:3001';

// Increase timeout for cognitive architecture tests
jest.setTimeout(10000);

// Mock fetch for API calls
global.fetch = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  jest.restoreAllMocks();
});