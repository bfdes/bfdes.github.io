module.exports = {
  collectCoverageFrom: ["src/**/*"],
  moduleDirectories: [".", "node_modules"],
  transform: {
    "\\.(jpg|jpeg|png)$": "./jest/assetTransformer.js",
    "\\.(js|jsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
};
