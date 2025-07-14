import React from 'react';
import { Progress } from '@patternfly/react-core';
import { getLMEvalStatusProgress } from '~/app/pages/lmEvalList/utils';
import { LMEvalKind } from '~/app/types';

type LMEvalProgressBarProps = {
  status?: LMEvalKind['status'];
};

const LMEvalProgressBar: React.FC<LMEvalProgressBarProps> = ({ status }) => {
  const progress = getLMEvalStatusProgress(status);

  return <Progress value={progress} style={{ width: '200px' }} size="sm" />;
};

export default LMEvalProgressBar;
