module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "14" } }],
    [
      "@babel/preset-react",
      {
        pragma: "Template.createElement",
        pragmaFrag: "Template.Fragment",
      },
    ],
  ],
};
