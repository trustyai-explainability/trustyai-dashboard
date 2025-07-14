import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import { getLMEvalState, getLMEvalStatusColor } from '~/app/pages/lmEvalList/utils';
import { LMEvalKind } from '~/app/types';
import { LMEvalState } from '~/app/pages/lmEvalForm/utilities/types';
import UnderlinedTruncateButton from '~/app/components/UnderlinedTruncatedButton';
import LMEvalStatusLabel from './LMEvalStatusLabel';
import LMEvalProgressBar from './LMEvalProgressBar';

type LMEvalStatusProps = {
  lmEval: LMEvalKind;
};

const LMEvalStatus: React.FC<LMEvalStatusProps> = ({ lmEval }) => {
  const currentState = getLMEvalState(lmEval.status);

  const isStarting = currentState === LMEvalState.PENDING;
  const isRunning =
    currentState === LMEvalState.IN_PROGRESS &&
    lmEval.status?.progressBars?.some((bar) => bar.message === 'Requesting API');
  const isRunningInitializing = currentState === LMEvalState.IN_PROGRESS && !isRunning;
  const isFailed = currentState === LMEvalState.FAILED;

  const showUnderlinedTruncateButton = isStarting || isRunningInitializing || isFailed;

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
      <FlexItem>
        <LMEvalStatusLabel status={lmEval.status} />
      </FlexItem>
      {showUnderlinedTruncateButton ? (
        <UnderlinedTruncateButton
          content={lmEval.status?.message || 'Waiting for server request to start...'}
          color={getLMEvalStatusColor(currentState)}
        />
      ) : null}
      {isRunning ? (
        <FlexItem>
          <LMEvalProgressBar status={lmEval.status} />
        </FlexItem>
      ) : null}
    </Flex>
  );
};

export default LMEvalStatus;
