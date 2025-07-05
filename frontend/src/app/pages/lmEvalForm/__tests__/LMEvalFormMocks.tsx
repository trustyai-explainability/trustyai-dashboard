import * as React from 'react';
import { LmModelArgument, LmEvalFormData } from '~/app/pages/lmEvalForm/utilities/types';

// Define types for mock component props
export interface MockTaskSectionProps {
  tasks: string[];
  setTasks: (tasks: string[]) => void;
}

export interface MockSecuritySectionProps {
  allowOnline: boolean;
  allowRemoteCode: boolean;
  setAllowOnline: (allow: boolean) => void;
  setAllowRemoteCode: (allow: boolean) => void;
}

export interface MockModelArgumentSectionProps {
  modelArgument: LmModelArgument;
  setModelArgument: (modelArgument: LmModelArgument) => void;
}

export interface MockFormFooterProps {
  data: LmEvalFormData;
  k8sNameData: { name: string };
}

export interface MockApplicationsPageProps {
  children: React.ReactNode;
  title: string;
  description: string;
  breadcrumb: React.ReactNode;
}

export interface MockK8sFieldProps {
  data: { name: string; k8sName: { value: string } };
  onDataChange: (data: { name: string; k8sName: { value: string } }) => void;
  dataTestId: string;
}

// Mock the child components at the top level
jest.mock('../LMEvalTaskSection', () => {
  const MockLmEvaluationTaskSection = ({ tasks, setTasks }: MockTaskSectionProps) => (
    <div data-testid="mock-task-section">
      <button onClick={() => setTasks(['task1', 'task2'])}>Set Mock Tasks</button>
      <div data-testid="task-count">{tasks.length}</div>
    </div>
  );
  MockLmEvaluationTaskSection.displayName = 'LmEvaluationTaskSection';
  return MockLmEvaluationTaskSection;
});

jest.mock('../LMEvalSecuritySection', () => {
  const MockLMEvalSecuritySection = ({
    allowOnline,
    allowRemoteCode,
    setAllowOnline,
    setAllowRemoteCode,
  }: MockSecuritySectionProps) => (
    <div data-testid="mock-security-section">
      <input
        type="checkbox"
        data-testid="allow-online-checkbox"
        checked={allowOnline}
        onChange={(e) => setAllowOnline(e.target.checked)}
      />
      <input
        type="checkbox"
        data-testid="allow-remote-code-checkbox"
        checked={allowRemoteCode}
        onChange={(e) => setAllowRemoteCode(e.target.checked)}
      />
    </div>
  );
  MockLMEvalSecuritySection.displayName = 'LMEvalSecuritySection';
  return MockLMEvalSecuritySection;
});

jest.mock('../LMEvalModelArgumentSection', () => {
  const MockLMEvalModelArgumentSection = ({
    modelArgument,
    setModelArgument,
  }: MockModelArgumentSectionProps) => (
    <div data-testid="mock-model-argument-section">
      <input
        data-testid="model-name-input"
        value={modelArgument.name}
        onChange={(e) => setModelArgument({ ...modelArgument, name: e.target.value })}
      />
      <input
        data-testid="model-url-input"
        value={modelArgument.url}
        onChange={(e) => setModelArgument({ ...modelArgument, url: e.target.value })}
      />
    </div>
  );
  MockLMEvalModelArgumentSection.displayName = 'LMEvalModelArgumentSection';
  return MockLMEvalModelArgumentSection;
});

jest.mock('../LMEvalFormFooter', () => {
  const MockLMEvalFormFooter = ({ data, k8sNameData }: MockFormFooterProps) => (
    <div data-testid="mock-form-footer">
      <span data-testid="footer-data-model">{data.deployedModelName}</span>
      <span data-testid="footer-data-eval-name">{k8sNameData.name}</span>
    </div>
  );
  MockLMEvalFormFooter.displayName = 'LMEvalFormFooter';
  return MockLMEvalFormFooter;
});

jest.mock('mod-arch-shared/dist/components/ApplicationsPage', () => {
  const MockApplicationsPage = ({
    children,
    title,
    description,
    breadcrumb,
  }: MockApplicationsPageProps) => (
    <div data-testid="mock-applications-page">
      <div data-testid="page-title">{title}</div>
      <div data-testid="page-description">{description}</div>
      <div data-testid="page-breadcrumb">{breadcrumb}</div>
      {children}
    </div>
  );
  MockApplicationsPage.displayName = 'ApplicationsPage';
  return MockApplicationsPage;
});

jest.mock('~/app/components/K8sNameDescriptionField/K8sNameDescriptionField', () => ({
  __esModule: true,
  default: ({ data, onDataChange, dataTestId }: MockK8sFieldProps) => (
    <div data-testid={`${dataTestId}-name-description-field`}>
      <input
        data-testid={`${dataTestId}-name-input`}
        value={data.name}
        onChange={(e) => onDataChange({ ...data, name: e.target.value })}
        placeholder="Evaluation run name"
      />
      <input
        data-testid={`${dataTestId}-k8s-name-input`}
        value={data.k8sName.value}
        onChange={(e) =>
          onDataChange({
            ...data,
            k8sName: { ...data.k8sName, value: e.target.value },
          })
        }
        placeholder="K8s name"
      />
    </div>
  ),
  useK8sNameDescriptionFieldData: jest.fn(() => ({
    data: {
      name: '',
      k8sName: { value: '' },
    },
    onDataChange: jest.fn(),
  })),
}));

// Function to setup all mocks
export const setupAllMocks = (): void => {
  // No need to call setupAllMocks function as all mocks are already set up at the top level
};
