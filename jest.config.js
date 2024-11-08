module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup/testSetup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@testing-library)'
  ]
}
