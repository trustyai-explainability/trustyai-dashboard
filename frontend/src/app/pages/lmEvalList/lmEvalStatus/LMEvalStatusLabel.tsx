import * as React from 'react';
import { Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  OutlinedQuestionCircleIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import { LMEvalKind } from '~/app/types';
import { LMEvalState } from '~/app/pages/lmEvalForm/utilities/types';
import { getLMEvalState } from '~/app/pages/lmEvalList/utils';

type LMEvalStatusLabelProps = {
  status?: LMEvalKind['status'];
};

const LMEvalStatusLabel: React.FC<LMEvalStatusLabelProps> = ({ status }) => {
  const currentState = getLMEvalState(status);

  let iconStatus: 'success' | 'danger' | 'warning' | 'info';

  let IconComponent: React.ComponentType;

  if (currentState === LMEvalState.IN_PROGRESS) {
    return (
      <Label isCompact color="blue" icon={<InProgressIcon />}>
        {currentState}
      </Label>
    );
  }

  switch (currentState) {
    case LMEvalState.PENDING:
      iconStatus = 'info';
      IconComponent = PendingIcon;
      break;
    case LMEvalState.COMPLETE:
      iconStatus = 'success';
      IconComponent = CheckCircleIcon;
      break;
    case LMEvalState.FAILED:
      iconStatus = 'danger';
      IconComponent = ExclamationCircleIcon;
      break;
    default:
      iconStatus = 'warning';
      IconComponent = OutlinedQuestionCircleIcon;
      break;
  }

  return (
    <Label isCompact status={iconStatus} icon={<IconComponent />}>
      {currentState}
    </Label>
  );
};

export default LMEvalStatusLabel;
