const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const outputDirectory = 'dist';
const mode = process.env.NODE_ENV || 'development';

module.exports = {
  entry: ['babel-polyfill', './src/client/index.js'],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: 'bundle.js',
    globalObject: 'this'
  },
  mode,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            name: mode === 'development' ? '[name].worker.js' : '[hash].worker.js'
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            fallback: 'file-loader',
            name: () => {
              if (mode === 'development') {
                return 'assets/[name].[ext]';
              }

              return 'assets/[hash].[ext]';
            },
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx']
  },
  devServer: {
    port: 3000,
    open: false,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  plugins: [
    new CleanWebpackPlugin([outputDirectory]),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    })
  ]
};
