import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { AppLayout } from '@app/AppLayout/AppLayout';
import Routes from '@app/routes';
import '@app/app.css';
import { ThemeProvider } from './ThemeContext';
import ProjectsContextProvider from './context/ProjectsContext';

const AppWithoutRouter: React.FC = () => (
  <ThemeProvider>
    <ProjectsContextProvider>
      <AppLayout>
        <Routes />
      </AppLayout>
    </ProjectsContextProvider>
  </ThemeProvider>
);

export default AppWithoutRouter;
