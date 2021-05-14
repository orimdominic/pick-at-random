module.exports = {
  roots: ["<rootDir>/src/", "<rootDir>/api/"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  coverageReporters: ["html", "lcov"],
};
