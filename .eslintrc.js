module.exports = {
  env: {
    node: true,
    jest: true,
    browser: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  parser: "@babel/eslint-parser",
  settings: {
    react: {
      version: "detect",
      pragma: "Template",
    },
  },
};
