/* eslint-disable @typescript-eslint/no-require-imports */
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

const moduleFederationConfig = {
  name: 'lmEval',
  filename: 'remoteEntry.js',
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.0.0',
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.0.0',
    },
    '@patternfly/react-core': {
      singleton: true,
      requiredVersion: '^6.0.0',
    },
    '@odh-dashboard/plugin-core': {
      singleton: true,
      requiredVersion: '0.0.0',
    },
  },
  exposes: {
    './extensions': './src/odh/extensions',
  },
  runtime: false,
  dts: false,
};

module.exports = {
  moduleFederationPlugins: [new ModuleFederationPlugin(moduleFederationConfig)],
};
