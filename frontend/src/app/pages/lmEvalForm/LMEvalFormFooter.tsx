import React from 'react';
import {
  ActionList,
  ActionListItem,
  Alert,
  Button,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { K8sNameDescriptionFieldData } from '~/app/components/K8sNameDescriptionField/types';
import { LmEvalFormData } from '~/app/pages/lmEvalForm/utilities/types';
import { isFilledLmEvalFormData } from '~/app/pages/lmEvalForm/utilities/formUtils';

type LMEvalFormFooterProps = {
  data: LmEvalFormData;
  k8sNameData: K8sNameDescriptionFieldData;
};

const LMEvalFormFooter: React.FC<LMEvalFormFooterProps> = ({ data, k8sNameData }) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const canSubmit = isFilledLmEvalFormData(data, k8sNameData);
  const navigate = useNavigate();

  const onCreatelmEval = async () => {
    setSubmitting(true);
    setError(null);
    //add create api
  };

  return (
    <Stack hasGutter>
      {error && (
        <StackItem>
          <Alert isInline variant="danger" title="Error creating evaluation">
            {error.message}
          </Alert>
        </StackItem>
      )}
      <StackItem>
        <ActionList>
          <ActionListItem>
            <Button
              variant="primary"
              data-testid="lm-evaluation-submit-button"
              isDisabled={isSubmitting || !canSubmit}
              onClick={onCreatelmEval}
              isLoading={isSubmitting}
            >
              Start evaluation run
            </Button>
          </ActionListItem>
          <ActionListItem>
            <Button
              variant="link"
              data-testid="lm-evaluation-cancel-button"
              onClick={() => {
                navigate('/modelEvaluations');
              }}
            >
              Cancel
            </Button>
          </ActionListItem>
        </ActionList>
      </StackItem>
    </Stack>
  );
};
export default LMEvalFormFooter;
