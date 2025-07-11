import * as React from 'react';
import { Navigate, Route } from 'react-router-dom';
import ProjectsRoutes from '~/app/concepts/projects/ProjectRoutes';
import LMEvalForm from '~/app/pages/lmEvalForm/LMEvalForm';
import LMEvalResult from '~/app/pages/lmEvalResult/LMEvalResult';
import LMEvalCoreLoader from './LMEvalCoreLoader';
import LMEval from './LmEval';

const LMEvalRoutes: React.FC = () => (
  <ProjectsRoutes>
    <Route
      path="/:namespace?/*"
      element={
        <LMEvalCoreLoader
          getInvalidRedirectPath={(namespace) => `/modelEvaluations/${namespace}`}
        />
      }
    >
      <Route index element={<LMEval />} />
      <Route path="evaluate" element={<LMEvalForm />} />
      <Route path="evaluations/:evaluationName" element={<LMEvalResult />} />
      <Route path="*" element={<Navigate to="." />} />
    </Route>
  </ProjectsRoutes>
);

export default LMEvalRoutes;
