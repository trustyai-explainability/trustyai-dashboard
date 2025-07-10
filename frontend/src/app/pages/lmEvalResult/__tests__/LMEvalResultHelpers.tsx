import * as React from 'react';
import { screen, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LMEvalResult from '~/app/pages/lmEvalResult/LMEvalResult';
import { EvaluationResult } from '~/app/pages/lmEvalResult/utils';
import {
  defaultParams,
  mockEmptyHookResult,
  createMockEvaluationData,
  MockHookResult,
} from './utils';

// Common assertion helpers
export const expectLoadedState = (loaded: boolean): void => {
  expect(screen.getByText(`Loaded: ${loaded}`)).toBeInTheDocument();
};

export const expectEmptyState = (empty: boolean): void => {
  expect(screen.getByText(`Empty: ${empty}`)).toBeInTheDocument();
};

export const expectTitle = (title: string): void => {
  expect(screen.getByText(`Title: ${title}`)).toBeInTheDocument();
};

export const expectEmptyMessage = (message: string): void => {
  expect(screen.getByText(`Empty Message: ${message}`)).toBeInTheDocument();
};

export const expectElementPresence = (testId: string, shouldExist: boolean): void => {
  const element = screen.queryByTestId(testId);
  if (shouldExist) {
    expect(element).toBeInTheDocument();
  } else {
    expect(element).not.toBeInTheDocument();
  }
};

// Component rendering helper
export const renderLMEvalResultComponent = (): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <LMEvalResult />
    </MemoryRouter>,
  );

// Test scenario factory function
export const createTestScenarios = (
  setupMocks: (
    params?: Partial<{ evaluationName: string; namespace: string }>,
    hookResult?: MockHookResult,
    parseResults?: EvaluationResult[],
  ) => void,
): {
  renderWithDefaultSetup: () => ReturnType<typeof render>;
  renderWithEmptyEvaluation: (evaluationName?: string) => ReturnType<typeof render>;
  renderWithNoResults: () => ReturnType<typeof render>;
  renderWithParseError: () => ReturnType<typeof render>;
} => {
  const renderWithDefaultSetup = () => {
    setupMocks();
    return renderLMEvalResultComponent();
  };

  const renderWithEmptyEvaluation = (evaluationName = 'nonexistent-evaluation') => {
    setupMocks({ evaluationName, namespace: 'test-project' }, mockEmptyHookResult);
    return renderLMEvalResultComponent();
  };

  const renderWithNoResults = () => {
    setupMocks(
      defaultParams,
      {
        data: createMockEvaluationData({ results: undefined }),
        loaded: true,
        error: undefined,
        refresh: jest.fn(),
      },
      [], // Empty parse results
    );
    return renderLMEvalResultComponent();
  };

  const renderWithParseError = () => {
    setupMocks(
      defaultParams,
      {
        data: createMockEvaluationData({ results: 'invalid json' }),
        loaded: true,
        error: undefined,
        refresh: jest.fn(),
      },
      [], // Empty parse results
    );
    return renderLMEvalResultComponent();
  };

  return {
    renderWithDefaultSetup,
    renderWithEmptyEvaluation,
    renderWithNoResults,
    renderWithParseError,
  };
};

// Test case data structures
export const errorTestCases = [
  {
    name: 'evaluation does not exist',
    expectedMessage: 'Evaluation "nonexistent-evaluation" not found',
    expectedTitle: 'nonexistent-evaluation',
    setupKey: 'renderWithEmptyEvaluation' as const,
    setupArgs: ['nonexistent-evaluation'],
  },
  {
    name: 'evaluation has no results',
    expectedMessage: 'Evaluation results not yet available',
    expectedTitle: 'test-evaluation',
    setupKey: 'renderWithNoResults' as const,
    setupArgs: [],
  },
  {
    name: 'results cannot be parsed',
    expectedMessage: 'Unable to parse evaluation results',
    expectedTitle: 'test-evaluation',
    setupKey: 'renderWithParseError' as const,
    setupArgs: [],
  },
];

export const downloadTestCases = [
  {
    name: 'should show download button when evaluation has results',
    setupKey: 'renderWithDefaultSetup' as const,
    shouldShowButton: true,
  },
  {
    name: 'should not show download button when no evaluation data',
    setupKey: 'renderWithEmptyEvaluation' as const,
    shouldShowButton: false,
  },
];
