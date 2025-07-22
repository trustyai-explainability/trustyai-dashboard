/* eslint-disable @typescript-eslint/no-require-imports */
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

const moduleFederationConfig = {
  name: 'lmEval',
  filename: 'remoteEntry.js',
  shared: {
    react: {
      singleton: true,
      eager: true,
      requiredVersion: false,
    },
    'react-dom': {
      singleton: true,
      eager: true,
      requiredVersion: false,
    },
    'react-router': {
      singleton: true,
      eager: true,
      requiredVersion: false,
    },
    'react-router-dom': {
      singleton: true,
      eager: true,
      requiredVersion: false,
    },
    '@patternfly/react-core': {
      singleton: true,
      eager: true,
    },
  },
  exposes: {
    './extensions': './odh/extensions',
  },
  runtime: false,
  dts: false,
  experiments: {
    federationRuntime: 'hoisted',
  },
};

module.exports = {
  moduleFederationPlugins: [new ModuleFederationPlugin(moduleFederationConfig)],
};
