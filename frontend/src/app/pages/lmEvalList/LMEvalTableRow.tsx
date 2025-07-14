import * as React from 'react';

import { Timestamp } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { ActionsColumn, Td, Tr } from '@patternfly/react-table';
import { LMEvalKind } from '~/app/types';
import { downloadString } from '~/app/utilities/string';
import { getDisplayNameFromK8sResource } from '~/concepts/k8s/utils';
import { LMEvalState } from '~/app/pages/lmEvalForm/utilities/types';
import { getLMEvalState } from './utils';
import LMEvalStatus from './lmEvalStatus/LMEvalStatus';

type LMEvalTableRowType = {
  lmEval: LMEvalKind;
  onDeleteLMEval: (lmEval: LMEvalKind) => void;
};

const LMEvalTableRow: React.FC<LMEvalTableRowType> = ({ lmEval, onDeleteLMEval }) => {
  const handleDownload = () => {
    downloadString(`${lmEval.metadata.name}.json`, lmEval.status?.results || '{}');
  };
  const currentState = getLMEvalState(lmEval.status);
  return (
    <Tr>
      <Td dataLabel="Evaluation">
        {currentState === LMEvalState.COMPLETE ? (
          <Link
            data-testid={`lm-eval-link-${lmEval.metadata.name}`}
            to={`/modelEvaluations/${lmEval.metadata.namespace}/${lmEval.metadata.name}`}
          >
            {getDisplayNameFromK8sResource(lmEval)}
          </Link>
        ) : (
          getDisplayNameFromK8sResource(lmEval)
        )}
      </Td>
      <Td dataLabel="Model">
        {lmEval.spec.modelArgs?.find((arg) => arg.name === 'model')?.value || '-'}
      </Td>
      <Td dataLabel="Evaluated">
        {lmEval.metadata.creationTimestamp ? (
          <Timestamp date={new Date(lmEval.metadata.creationTimestamp)} />
        ) : (
          'Unknown'
        )}
      </Td>
      <Td dataLabel="Status">
        <LMEvalStatus lmEval={lmEval} />
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            ...(currentState === LMEvalState.COMPLETE && lmEval.status?.results
              ? [{ title: 'Download JSON', itemKey: 'download-json', onClick: handleDownload }]
              : []),
            { title: 'Delete', itemKey: 'lm-eval-delete', onClick: () => onDeleteLMEval(lmEval) },
          ]}
        />
      </Td>
    </Tr>
  );
};

export default LMEvalTableRow;
