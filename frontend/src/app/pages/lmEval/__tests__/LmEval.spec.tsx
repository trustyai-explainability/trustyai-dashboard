import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { LMEvalContext } from '~/app/context/LMEvalContext';
import { LMEvalKind, ProjectKind, CustomWatchK8sResult } from '~/app/types';
import LmEval from '~/app/pages/lmEval/LmEval';
import { mockProjectsK8sList } from '~/__mocks__/mockProject';

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
});
