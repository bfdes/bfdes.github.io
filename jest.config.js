module.exports = {
  collectCoverageFrom: ["src/**/*"],
  moduleDirectories: [".", "src", "node_modules"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  transform: {
    "\\.(ts|tsx)$": "ts-jest",
  },
  testRegex: "/tests/.*\\.(ts|tsx)$",
};
