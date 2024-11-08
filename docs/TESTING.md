# Testing Guide

## Integration Testing

This guide explains how to write integration tests for the debugging tools using React Native Testing Library.

### Setup

1. Install dependencies:
```bash
yarn add -D @testing-library/react-native @testing-library/jest-native
```

2. Configure Jest in package.json:
```json
{
  "jest": {
    "preset": "react-native",
    "setupFilesAfterEnv": ["./src/tests/setup/testSetup.ts"]
  }
}
```

### Writing Tests

1. **Test Structure**
- Setup: Prepare the test environment
- Render: Mount components
- Act: Simulate user interactions
- Assert: Verify expected behavior
- Cleanup: Reset state for next test

2. **Best Practices**
- Test from user's perspective
- Use accessibility labels and text
- Avoid implementation details
- Mock external dependencies
- Handle async operations

3. **Common Patterns**
```typescript
// Rendering components
const { getByText, getByTestId } = render(<Component />);

// Finding elements
const button = getByText('Submit');
const input = getByTestId('email-input');

// Simulating user interaction
fireEvent.press(button);
fireEvent.changeText(input, 'test@example.com');

// Waiting for async operations
await waitFor(() => {
  expect(getByText('Success')).toBeVisible();
});
```

### Running Tests

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Run in watch mode
yarn test --watch
```
