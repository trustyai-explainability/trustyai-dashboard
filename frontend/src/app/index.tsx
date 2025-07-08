import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { ThemeProvider } from './ThemeContext';
// eslint-disable-next-line import/no-extraneous-dependencies

const App: React.FunctionComponent = () => (
  <Router>
    <ThemeProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </ThemeProvider>
  </Router>
);

export default App;
