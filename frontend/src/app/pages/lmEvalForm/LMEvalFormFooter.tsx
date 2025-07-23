import React from 'react';
import {
  ActionList,
  ActionListItem,
  Alert,
  Button,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useNavigate, useParams } from 'react-router-dom';
import { K8sNameDescriptionFieldData } from '~/app/components/K8sNameDescriptionField/types';
import { LmEvalFormData } from '~/app/pages/lmEvalForm/utilities/types';
import { isFilledLmEvalFormData } from '~/app/pages/lmEvalForm/utilities/formUtils';
import { LMEvalService } from '~/app/api/service';
import { LMEvalCreateRequest } from '~/app/api/k8s';

type LMEvalFormFooterProps = {
  data: LmEvalFormData;
  k8sNameData: K8sNameDescriptionFieldData;
};

const LMEvalFormFooter: React.FC<LMEvalFormFooterProps> = ({ data, k8sNameData }) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const canSubmit = isFilledLmEvalFormData(data, k8sNameData);
  const navigate = useNavigate();
  const { namespace } = useParams<{ namespace: string }>();

  const onCreateLmEval = async () => {
    if (!namespace) {
      setError(new Error('No namespace provided. Please select a project.'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Convert form data to API request format
      const createRequest: LMEvalCreateRequest = {
        evaluationName: data.evaluationName,
        k8sName: k8sNameData.k8sName.value,
        modelType: data.deployedModelName, // Use the selected model name
        model: {
          name: data.model.name,
          url: data.model.url,
          tokenizedRequest: data.model.tokenizedRequest,
          tokenizer: data.model.tokenizer,
        },
        tasks: data.tasks,
        allowRemoteCode: data.allowRemoteCode,
        allowOnline: data.allowOnline,
        batchSize: '8', // Default batch size
      };

      // Create the evaluation using our API
      const createdEvaluation = await LMEvalService.createEvaluation(namespace, createRequest);

      // Navigate to the evaluation results page
      navigate(`/model-evaluations/${namespace}/evaluations/${createdEvaluation.metadata.name}`, {
        state: {
          message: `Evaluation "${data.evaluationName}" created successfully and is starting.`,
          type: 'success',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create evaluation'));
    } finally {
      setSubmitting(false);
    }
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
              onClick={onCreateLmEval}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Creating evaluation...' : 'Start evaluation run'}
            </Button>
          </ActionListItem>
          <ActionListItem>
            <Button
              variant="link"
              data-testid="lm-evaluation-cancel-button"
              onClick={() => {
                navigate('/model-evaluations');
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
