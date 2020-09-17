const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

const config = {
  entry: './src/react/index.ts',
  output: {
    filename: './bundle.js',
    path: __dirname + '/public'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$|\.jsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
        options: { silent: true }
      }
    ]
  },
  performance: {
    hints: false
  }
}

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production'
  config.devtool = false
  config.plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
  config.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  }
} else {
  config.mode = 'development'
  config.devtool = 'source-map'
}

module.exports = config
