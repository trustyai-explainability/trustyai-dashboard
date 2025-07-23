import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  ModularArchContextProvider,
  ThemeProvider,
  BrowserStorageContextProvider,
  NotificationContextProvider,
  DeploymentMode,
  Theme,
} from 'mod-arch-shared';
import LMEvalRoutes from '@app/pages/lmEval/LMEvalRoutes';
import ProjectsContextProvider from '@app/context/ProjectsContext';
import '@patternfly/react-core/dist/styles/base.css';
import '@app/app.css';

// Define your configuration
const modularArchConfig = {
  deploymentMode: DeploymentMode.Standalone, // or Federated, Kubeflow
  URL_PREFIX: '/api',
  BFF_API_VERSION: 'v1',
  // Optional: Force a specific namespace
  // mandatoryNamespace: 'production'
};

const LMEvalWrapper: React.FC = () => (
  <ModularArchContextProvider config={modularArchConfig}>
    <ThemeProvider theme={Theme.Patternfly}>
      <BrowserStorageContextProvider>
        <NotificationContextProvider>
          <ProjectsContextProvider>
            <Routes>
              <Route path="/*" element={<LMEvalRoutes />} />
            </Routes>
          </ProjectsContextProvider>
        </NotificationContextProvider>
      </BrowserStorageContextProvider>
    </ThemeProvider>
  </ModularArchContextProvider>
);

export default LMEvalWrapper;
