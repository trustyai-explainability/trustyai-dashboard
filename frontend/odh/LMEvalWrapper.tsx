import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '@app/index';

const LMEvalWrapper: React.FC = () => (
  <Routes>
    <Route path="/*" element={<App />} />
  </Routes>
);

export default LMEvalWrapper;
