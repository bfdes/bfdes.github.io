module.exports = {
  presets: [
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        pragma: "Template.createElement",
        pragmaFrag: "Template.createFragment",
      },
    ],
  ],
};
