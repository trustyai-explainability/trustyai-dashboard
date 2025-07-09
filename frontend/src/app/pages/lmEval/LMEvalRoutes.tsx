import * as React from 'react';
import { Navigate, Route } from 'react-router-dom';
import ProjectsRoutes from '~/app/concepts/projects/ProjectRoutes';
import LMEvalForm from '~/app/pages/lmEvalForm/LMEvalForm';
import LMEvalCoreLoader from './LMEvalCoreLoader';
import LMEval from './LmEval';

const LMEvalRoutes: React.FC = () => (
  <ProjectsRoutes>
    <Route
      path="/:namespace?/*"
      element={
        <LMEvalCoreLoader
          getInvalidRedirectPath={(namespace) => `/ModelEvaluations/${namespace}`}
        />
      }
    >
      <Route index element={<LMEval />} />
      {/* TODO: Add LMEvalForm */}
      <Route path="evaluate" element={<LMEvalForm />} />
      {/* TODO: Add LMEvalResult */}

      <Route path="*" element={<Navigate to="." />} />
    </Route>
  </ProjectsRoutes>
);

export default LMEvalRoutes;
