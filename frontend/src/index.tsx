import React from 'react';
import ReactDOM from 'react-dom/client';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  BrowserStorageContextProvider,
  DeploymentMode,
  ModularArchConfig,
  ModularArchContextProvider,
  NotificationContextProvider,
  Theme,
  ThemeProvider,
} from 'mod-arch-shared';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'mod-arch-shared/style/MUI-theme.scss';
import App from '@app/index';

if (process.env.NODE_ENV !== 'production') {
  const config = {
    rules: [
      {
        id: 'color-contrast',
        enabled: false,
      },
    ],
  };
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const axe = require('react-axe');
  axe(React, ReactDOM, 1000, config);
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const root = ReactDOM.createRoot(document.getElementById('root') as Element);

const modularArchConfig: ModularArchConfig = {
  deploymentMode: DeploymentMode.Standalone,
  URL_PREFIX: '/trustyai',
  BFF_API_VERSION: 'v1',
};

root.render(
  <React.StrictMode>
    <ModularArchContextProvider config={modularArchConfig}>
      <ThemeProvider theme={Theme.Patternfly}>
        <BrowserStorageContextProvider>
          <NotificationContextProvider>
            <App />
          </NotificationContextProvider>
        </BrowserStorageContextProvider>
      </ThemeProvider>
    </ModularArchContextProvider>
  </React.StrictMode>,
);
