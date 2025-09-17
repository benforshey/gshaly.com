const path = require("path");
const TerserPlugin = new require("terser-webpack-plugin");

module.exports = {
  entry: "./static/src/script/main.js",
  output: {
    filename: "bundle_v1.0.2.js",
    path: path.resolve(__dirname, "./static/dist/script/"),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
