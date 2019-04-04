const path = require("path")
const MinifyPlugin = require("babel-minify-webpack-plugin")

module.exports = {
  entry: "./static/src/script/main.js",
  output: {
    filename: "bundle_v1.0.0.js",
    path: path.resolve(__dirname, "./static/dist/script/"),
  },
  plugins: [new MinifyPlugin()],
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }],
  },
}
