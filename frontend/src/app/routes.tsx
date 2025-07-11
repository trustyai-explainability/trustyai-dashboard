import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NavDataItem } from 'mod-arch-shared/dist/types/common';
import NotFound from 'mod-arch-shared/dist/components/notFound/NotFound';
import LMEvalRoutes from './pages/lmEval/LMEvalRoutes';
import { Settings } from './pages/settings/Settings';

export const useNavData = (): NavDataItem[] => [
  {
    label: 'Model Evaluations',
    path: '/modelEvaluations',
  },
  { label: 'Settings', children: [{ label: 'Model Evaluations', path: '/settings' }] },
];

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/modelEvaluations" replace />} />
    <Route path="/modelEvaluations/*" element={<LMEvalRoutes />} />
    <Route path="*" element={<NotFound />} />
    <Route path="/settings/*" element={<Settings />} />
  </Routes>
);

export default AppRoutes;
