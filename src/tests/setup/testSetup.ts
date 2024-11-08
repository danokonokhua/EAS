import '@testing-library/jest-native/extend-expect';
import { cleanup } from '@testing-library/react-native';
import { jest } from '@jest/globals';

// Setup global mocks
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(10000);
