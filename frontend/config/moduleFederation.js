/* eslint-disable @typescript-eslint/no-require-imports */
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const deps = require('../package.json').dependencies;

const moduleFederationConfig = {
  name: 'lmEval',
  filename: 'remoteEntry.js',
  shared: {
    react: { singleton: true, requiredVersion: deps.react },
    'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
    'react-router': { singleton: true, requiredVersion: deps['react-router'] },
    'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
    '@patternfly/react-core': { singleton: true, requiredVersion: deps['@patternfly/react-core'] },
  },
  exposes: {
    './extensions': './odh/extensions',
  },
  runtime: false,
  dts: false,
};

module.exports = {
  moduleFederationPlugins: [new ModuleFederationPlugin(moduleFederationConfig)],
};
