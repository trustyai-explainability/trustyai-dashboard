import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LMEvalRoutes from '@app/pages/lmEval/LMEvalRoutes';
import { ThemeProvider } from '@app/ThemeContext';
import ProjectsContextProvider from '@app/context/ProjectsContext';
import '@patternfly/react-core/dist/styles/base.css';
import '@app/app.css';

const LMEvalWrapper: React.FC = () => (
  <ThemeProvider>
    <ProjectsContextProvider>
      <Routes>
        <Route path="/*" element={<LMEvalRoutes />} />
      </Routes>
    </ProjectsContextProvider>
  </ThemeProvider>
);

export default LMEvalWrapper;
