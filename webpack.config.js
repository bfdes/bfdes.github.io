const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src", "main.tsx"),
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "./dist"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
      },
    ],
  },
  target: "node",
};
