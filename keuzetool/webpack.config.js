const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'index.js'
  },
  devServer: {
    port: 9000,
    allowedHosts: "all",
    static: {
      directory: path.resolve(__dirname)
    }
  }
}
