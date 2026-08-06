module.exports = {
  // preset: '@react-native/jest-preset',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
