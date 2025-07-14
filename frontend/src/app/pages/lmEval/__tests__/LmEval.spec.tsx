import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { LMEvalContext } from '~/app/context/LMEvalContext';
import { LMEvalKind, ProjectKind, CustomWatchK8sResult } from '~/app/types';
import LmEval from '~/app/pages/lmEval/LmEval';
import { mockProjectsK8sList } from '~/__mocks__/mockProject';
import { mockLMEvaluation } from '~/__mocks__/mockLMEvaluation';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Define the context type for testing
type LMEvalContextType = {
  lmEval: CustomWatchK8sResult<LMEvalKind[]>;
  project?: ProjectKind | null;
  preferredProject?: ProjectKind | null;
  projects?: ProjectKind[] | null;
};

// Helper function to render component with router and context
const renderWithProviders = (contextValue: LMEvalContextType) => {
  const component = (
    <BrowserRouter>
      <LMEvalContext.Provider value={contextValue}>
        <LmEval />
      </LMEvalContext.Provider>
    </BrowserRouter>
  );
  return render(component);
};

describe('LmEval', () => {
  const mockProjects = mockProjectsK8sList().items;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should render empty state when no evaluation data exists', () => {
      const contextValue: LMEvalContextType = {
        lmEval: [[], true, undefined], // empty data, loaded, no error
        project: mockProjects[0],
        preferredProject: mockProjects[1],
        projects: mockProjects,
      };

      renderWithProviders(contextValue);

      // Check for empty state text content
      expect(screen.getByText('No model evaluation runs')).toBeInTheDocument();
      expect(
        screen.getByText(/No evaluation runs have been started for models in this project/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Start a new evaluation run, or select a different project/),
      ).toBeInTheDocument();
    });

    it('should render evaluate model button in empty state', () => {
      const contextValue: LMEvalContextType = {
        lmEval: [[], true, undefined],
        project: mockProjects[0],
        preferredProject: mockProjects[1],
        projects: mockProjects,
      };

      renderWithProviders(contextValue);

      expect(screen.getByText('Start evaluation run')).toBeInTheDocument();
    });
  });

  describe('List View', () => {
    it('should render list view when evaluation data exists', () => {
      const mockEvaluations = [
        mockLMEvaluation({ name: 'eval-1', model: 'model-1', state: 'Running' }),
        mockLMEvaluation({ name: 'eval-2', model: 'model-2', state: 'Complete' }),
      ];

      const contextValue: LMEvalContextType = {
        lmEval: [mockEvaluations, true, undefined],
        project: mockProjects[0],
        preferredProject: mockProjects[1],
        projects: mockProjects,
      };

      renderWithProviders(contextValue);

      // Check that the table is rendered
      expect(screen.getByTestId('lm-eval-table')).toBeInTheDocument();

      // Check that evaluation names are displayed
      expect(screen.getByText('eval-1')).toBeInTheDocument();
      expect(screen.getByText('eval-2')).toBeInTheDocument();
    });

    it('should display evaluation details correctly', () => {
      const mockEvaluations = [
        mockLMEvaluation({
          name: 'test-evaluation',
          model: 'test-model',
          state: 'Running',
          modelArgs: [{ name: 'model', value: 'test-model' }],
        }),
      ];

      const contextValue: LMEvalContextType = {
        lmEval: [mockEvaluations, true, undefined],
        project: mockProjects[0],
        preferredProject: mockProjects[1],
        projects: mockProjects,
      };

      renderWithProviders(contextValue);

      // Check that the table is rendered
      expect(screen.getByTestId('lm-eval-table')).toBeInTheDocument();

      // Check evaluation name is displayed
      expect(screen.getByText('test-evaluation')).toBeInTheDocument();

      // Check model name is displayed
      expect(screen.getByText('test-model')).toBeInTheDocument();
    });

    it('should handle multiple evaluations with different states', () => {
      const mockEvaluations = [
        mockLMEvaluation({ name: 'eval-pending', state: 'Pending' }),
        mockLMEvaluation({ name: 'eval-running', state: 'Running' }),
        mockLMEvaluation({ name: 'eval-complete', state: 'Complete' }),
        mockLMEvaluation({ name: 'eval-failed', state: 'Complete', reason: 'Failed' }),
      ];

      const contextValue: LMEvalContextType = {
        lmEval: [mockEvaluations, true, undefined],
        project: mockProjects[0],
        preferredProject: mockProjects[1],
        projects: mockProjects,
      };

      renderWithProviders(contextValue);

      // Check that the table is rendered
      expect(screen.getByTestId('lm-eval-table')).toBeInTheDocument();

      // Check that all evaluation names are displayed
      expect(screen.getByText('eval-pending')).toBeInTheDocument();
      expect(screen.getByText('eval-running')).toBeInTheDocument();
      expect(screen.getByText('eval-complete')).toBeInTheDocument();
      expect(screen.getByText('eval-failed')).toBeInTheDocument();
    });

    it('should not render empty state when there are evaluations', () => {
      const mockEvaluations = [mockLMEvaluation({ name: 'eval-1' })];

      const contextValue: LMEvalContextType = {
        lmEval: [mockEvaluations, true, undefined],
        project: mockProjects[0],
        preferredProject: mockProjects[1],
        projects: mockProjects,
      };

      renderWithProviders(contextValue);

      // Empty state should not be rendered
      expect(screen.queryByText('No model evaluation runs')).not.toBeInTheDocument();

      // Table should be rendered instead
      expect(screen.getByTestId('lm-eval-table')).toBeInTheDocument();

      // Evaluation name should be displayed
      expect(screen.getByText('eval-1')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should not show table when data is not loaded', () => {
      const contextValue: LMEvalContextType = {
        lmEval: [[], false, undefined], // empty data, not loaded, no error
        project: mockProjects[0],
        preferredProject: mockProjects[1],
        projects: mockProjects,
      };

      renderWithProviders(contextValue);

      // Table should not be rendered when not loaded
      expect(screen.queryByTestId('lm-eval-table')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should handle load errors gracefully', () => {
      const contextValue: LMEvalContextType = {
        lmEval: [[], true, new Error('Failed to load evaluations')],
        project: mockProjects[0],
        preferredProject: mockProjects[1],
        projects: mockProjects,
      };

      renderWithProviders(contextValue);

      // Should still render the component structure but no table
      expect(screen.queryByTestId('lm-eval-table')).not.toBeInTheDocument();
    });
  });
});
