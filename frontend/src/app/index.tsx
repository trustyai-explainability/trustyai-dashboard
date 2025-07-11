import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import Routes from '@app/routes';
import '@app/app.css';
import { ThemeProvider } from './ThemeContext';
import ProjectsContextProvider from './context/ProjectsContext';

const App: React.FunctionComponent = () => (
  <Router>
    <ThemeProvider>
      <ProjectsContextProvider>
        <AppLayout>
          <Routes />
        </AppLayout>
      </ProjectsContextProvider>
    </ThemeProvider>
  </Router>
);

export default App;
