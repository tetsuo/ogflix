module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts', '!src/react/**/*.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: 'test',
  moduleFileExtensions: ['ts', 'js'],
  coverageThreshold: {
    global: {
      branches: 0, // 100
      functions: 0, // 100
      lines: 0, // 100
      statements: 0, // 100
    },
  },
  modulePathIgnorePatterns: [],
}
