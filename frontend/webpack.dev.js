/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { stylePaths } = require('./stylePaths');
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '9000';

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    host: HOST,
    port: PORT,
    historyApiFallback: true,
    open: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    client: {
      overlay: true,
    },
    // Proxy configuration for development
    proxy: [
      {
        context: ['/api', '/healthcheck'],
        target: process.env.BFF_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        // Add kubeflow-userid header for development
        onProxyReq: (proxyReq, req, res) => {
          if (process.env.DEV_USER_ID) {
            proxyReq.setHeader('kubeflow-userid', process.env.DEV_USER_ID);
          }
        },
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        include: [...stylePaths],
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
});
