module.exports = {
  collectCoverageFrom: ["src/**/*"],
  moduleDirectories: [".", "node_modules"],
  transform: {
    "\\.(js|jsx)$": ["babel-jest", { configFile: "./jest/babel.config.js" }],
    "\\.(jpg|jpeg|png)$": "./jest/assetTransformer.js",
  },
};
