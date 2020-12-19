const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};