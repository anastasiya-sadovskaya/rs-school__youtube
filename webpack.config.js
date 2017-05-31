const path = require('path');

module.exports = {
  entry: './src/js/app.js',
  output: {
    path: path.join(__dirname, './dist/'),
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          outputReport: {
            filePath: 'checkstyle.txt',
            formatter: require('eslint/lib/formatters/checkstyle')
          }
        }
      }
    ],
    loaders: [
      {
        exclude: /node_modules/,
        loader: ['babel-loader'],
      }
    ]
  }
};