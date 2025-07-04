import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ApplicationsPage from 'mod-arch-shared/dist/components/ApplicationsPage';
import {
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
  Form,
  FormGroup,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  Button,
  Icon,
  Popover,
  Truncate,
  FormSection,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import K8sNameDescriptionField, {
  useK8sNameDescriptionFieldData,
} from '~/app/components/K8sNameDescriptionField/K8sNameDescriptionField';
import { LmEvalFormData, LmModelArgument } from './utilities/types';
import LmEvaluationTaskSection from './LMEvalTaskSection';
import useLMGenericObjectState from './utilities/useLMGenericObjectState';
import { modelTypeOptions } from './const';
import {
  handleModelTypeSelection,
  handleModelSelection,
  type ModelTypeOption,
} from './utilities/modelUtils';
import LMEvalSecuritySection from './LMEvalSecuritySection';
import LMEvalModelArgumentSection from './LMEvalModelArgumentSection';
import LMEvalFormFooter from './LMEvalFormFooter';

// Generate resource name
const generateResourceName = (displayName: string) =>
  displayName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 253);

const LMEvalForm: React.FC = () => {
  // Form state
  const [data, setData] = useLMGenericObjectState<LmEvalFormData>({
    deployedModelName: '',
    k8sName: '',
    evaluationName: '',
    tasks: [],
    modelType: '',
    allowRemoteCode: false,
    allowOnline: false,
    model: {
      name: '',
      url: '',
      tokenizedRequest: 'False',
      tokenizer: '',
    },
  });

  // K8s name description field data
  const { data: lmEvalName, onDataChange: setLmEvalName } = useK8sNameDescriptionFieldData({
    initialData: {
      name: data.evaluationName,
      k8sName: data.k8sName,
    },
  });

  const [openModelName, setOpenModelName] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  // Resource name state
  const [resourceName, setResourceName] = React.useState('');

  // Helper function to find model type option by key
  const findOptionForKey = React.useCallback(
    (key: string): ModelTypeOption | undefined =>
      modelTypeOptions.find((option) => option.key === key),
    [],
  );

  // Auto-generate resource name from evaluation name
  React.useEffect(() => {
    if (lmEvalName.name && !resourceName) {
      const generated = generateResourceName(lmEvalName.name);
      setResourceName(generated);
      setData('k8sName', lmEvalName.k8sName.value);
      setData('evaluationName', lmEvalName.name);
    }
  }, [lmEvalName.name, lmEvalName.k8sName.value, resourceName, setData]);

  // Sync K8s name changes back to main form data
  React.useEffect(() => {
    setData('k8sName', lmEvalName.k8sName.value);
    setData('evaluationName', lmEvalName.name);
  }, [lmEvalName.k8sName.value, lmEvalName.name, setData]);

  // Mock model options - replace with your API call
  const modelOptions = [
    {
      value: 'model1',
      label: 'Model 1',
      displayName: 'Model 1',
      namespace: 'default',
      service: 'http://localhost:8000', // Mock service URL
    },
    {
      value: 'model2',
      label: 'Model 2',
      displayName: 'Model 2',
      namespace: 'default',
      service: 'http://localhost:8001', // Mock service URL
    },
  ];

  const selectedModel = modelOptions.find((model) => model.value === data.deployedModelName);
  const selectedModelLabel = selectedModel?.label || 'Select a model';

  const selectedModelType = modelTypeOptions.find((option) => option.key === data.modelType);
  const selectedLabel = selectedModelType?.label || 'Select model type';

  return (
    <ApplicationsPage
      loaded
      title="Start an evaluation run"
      description="Configure details for your model evaluation run."
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem render={() => <Link to="/modelEvaluations">Model evaluations</Link>} />
          <BreadcrumbItem isActive>Start an evaluation run</BreadcrumbItem>
        </Breadcrumb>
      }
      empty={false}
    >
      <PageSection hasBodyWrapper={false} isFilled>
        <Form data-testid="lmEvaluationForm" maxWidth="800px">
          <FormGroup label="Model name" isRequired data-testid="model-name-form-group">
            <Select
              isOpen={openModelName}
              selected={data.deployedModelName}
              onSelect={(e, selectValue) => {
                const selectedModelName = String(selectValue);

                // Update both the deployed model name and the model object with details
                const result = handleModelSelection(
                  selectedModelName,
                  modelOptions,
                  data.model,
                  data.modelType,
                  findOptionForKey,
                );

                setData('deployedModelName', result.deployedModelName);
                setData('model', result.model);
                setOpenModelName(false);
              }}
              onOpenChange={setOpenModelName}
              toggle={(toggleRef) => (
                <MenuToggle
                  isFullWidth
                  ref={toggleRef}
                  aria-label="Model options menu"
                  onClick={() => setOpenModelName(!openModelName)}
                  isExpanded={openModelName}
                  isDisabled={false}
                >
                  <Truncate content={selectedModelLabel} className="truncate-no-min-width" />
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                {modelOptions.map((option) => (
                  <SelectOption
                    value={option.value}
                    key={option.value}
                    description={`${option.displayName} in ${option.namespace}`}
                  >
                    {option.label}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FormGroup>
          {/* <FormGroup
            isRequired
            data-testid="evaluation-name-form-group"
            label="Evaluation run name"
            labelHelp={
              <Popover bodyContent={<>Provide a name for your evaluation run</>}>
                <Button
                  icon={
                    <Icon isInline>
                      <OutlinedQuestionCircleIcon />
                    </Icon>
                  }
                  variant="plain"
                  isInline
                />
              </Popover>
            }
          >
            <TextInput
              type="text"
              value={data.evaluationName}
              onChange={(_event, value) => setData('evaluationName', value)}
              placeholder="Enter evaluation name"
              aria-label="Evaluation run name"
            />
          </FormGroup> */}

          <FormGroup
            isRequired
            data-testid="evaluation-name-form-group"
            labelHelp={
              <Popover bodyContent={<></>}>
                <Button
                  icon={
                    <Icon isInline>
                      <OutlinedQuestionCircleIcon />
                    </Icon>
                  }
                  variant="plain"
                  isInline
                />
              </Popover>
            }
          >
            <K8sNameDescriptionField
              data={lmEvalName}
              onDataChange={setLmEvalName}
              dataTestId="lm-eval"
              hideDescription
              nameLabel="Evaluation run name"
            />
          </FormGroup>
          <LmEvaluationTaskSection
            tasks={data.tasks}
            setTasks={(selectedTasks: string[]) => setData('tasks', selectedTasks)}
          />
          <FormGroup
            label="Model endpoint interaction"
            isRequired
            data-testid="model-type-form-group"
          >
            <Select
              isOpen={open}
              selected={data.modelType}
              onSelect={(e, selectValue) => {
                const modelType = String(selectValue);
                const result = handleModelTypeSelection(modelType, data.model, findOptionForKey);

                setData('modelType', result.modelType);
                setData('model', result.model);
                setOpen(false);
              }}
              onOpenChange={setOpen}
              toggle={(toggleRef) => (
                <MenuToggle
                  isFullWidth
                  ref={toggleRef}
                  aria-label="Options menu"
                  onClick={() => setOpen(!open)}
                  isExpanded={open}
                >
                  <Truncate content={selectedLabel} className="truncate-no-min-width" />
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                {modelTypeOptions.map((option) => (
                  <SelectOption
                    value={option.key}
                    key={option.key}
                    description={option.description}
                  >
                    {option.label}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FormGroup>
          <LMEvalSecuritySection
            allowOnline={data.allowOnline}
            allowRemoteCode={data.allowRemoteCode}
            setAllowRemoteCode={(allowRemoteCode: boolean) =>
              setData('allowRemoteCode', allowRemoteCode)
            }
            setAllowOnline={(allowOnline: boolean) => setData('allowOnline', allowOnline)}
          />
          <LMEvalModelArgumentSection
            modelArgument={data.model}
            setModelArgument={(modelArgument: LmModelArgument) => setData('model', modelArgument)}
          />
          <FormSection>
            <LMEvalFormFooter data={data} k8sNameData={lmEvalName} />
          </FormSection>
        </Form>
      </PageSection>
    </ApplicationsPage>
  );
};

export default LMEvalForm;
