/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage", 
  testResultsProcessor: "jest-sonar-reporter",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/test/",
    "/dist/"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50
    }
  },
  coverageReporters: ["cobertura", "lcov"],
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverageFrom: [
    "src/**/*.controller.ts",
  ]
};