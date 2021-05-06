module.exports = {
  parser: "@babel/eslint-parser",
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  env: {
    node: true,
    jest: true,
    browser: true,
    es6: true,
  },
  settings: {
    react: {
      version: "detect",
      pragma: "Template",
    },
  },
};
