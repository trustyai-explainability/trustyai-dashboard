/* eslint-disable @typescript-eslint/no-var-requires */

// Load environment variables from .env file
require('dotenv').config();

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
        // Force kubeflow-userid header for development
        onProxyReq: (proxyReq, req, res) => {
          // Remove any existing header first
          proxyReq.removeHeader('kubeflow-userid');
          // Use environment variable or fallback to default
          const userId = process.env.DEV_USER_ID || 'test';
          // Ensure userId is not undefined or empty
          if (userId && userId.trim() !== '') {
            proxyReq.setHeader('kubeflow-userid', userId);
          } else {
            proxyReq.setHeader('kubeflow-userid', 'pnaik');
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
