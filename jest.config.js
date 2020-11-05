module.exports = {
  collectCoverageFrom: ["src/**/*"],
  moduleDirectories: [".", "src", "node_modules"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transform: {
    "\\.(ts|tsx)$": "ts-jest",
    "\\.(svg|jpg|png)$": "<rootDir>/jest/assetTransformer.js",
  },
  testRegex: "/tests/.*\\.(ts|tsx)$",
};
