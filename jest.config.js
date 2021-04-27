module.exports = {
  roots: ["<rootDir>/src/"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testURL: "http://localhost/",
  moduleFileExtensions: ["ts", "js"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
};
