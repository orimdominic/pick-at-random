module.exports = {
  roots: ["<rootDir>/src/"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
};
