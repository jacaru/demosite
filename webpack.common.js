const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: './src/js/index.js',
  module: {
    rules: [
      {
			  test: /\.js/,
			  include: /yaml[\\/]browser[\\/]dist/,
			  type: "javascript/auto"
			}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: false
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      //Buffer: ['buffer', 'Buffer']
    }),
  ],
  resolve: {
    fallback: {
      //buffer: require.resolve("buffer/"),
      //"crypto": require.resolve("crypto-browserify"),
      //util: require.resolve("util/")
    }
  }
};