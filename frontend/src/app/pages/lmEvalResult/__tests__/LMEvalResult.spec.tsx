import * as React from 'react';
import '@testing-library/jest-dom';
import { EvaluationResult } from '~/app/pages/lmEvalResult/utils';
import {
  defaultParams,
  mockSuccessfulHookResult,
  mockEmptyHookResult,
  createSetupMocks,
} from './utils';
import {
  expectLoadedState,
  expectEmptyState,
  expectTitle,
  expectEmptyMessage,
  expectElementPresence,
  renderLMEvalResultComponent,
  createTestScenarios,
  errorTestCases,
  downloadTestCases,
} from './LMEvalResultHelpers';

// Create mock functions that can be configured per test
const mockUseParams = jest.fn();
const mockUseLMEvalResult = jest.fn();
const mockParseEvaluationResults = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}));

// Mock the useLMEvalResult hook
jest.mock('~/app/pages/lmEvalResult/useLMEvalResult', () => ({
  __esModule: true,
  default: () => mockUseLMEvalResult(),
}));

// Mock the utils
jest.mock('~/app/pages/lmEvalResult/utils', () => ({
  parseEvaluationResults: (results: string) => mockParseEvaluationResults(results),
}));

// Mock the LMEvalResultTable component
jest.mock(
  '~/app/pages/lmEvalResult/LMEvalResultTable',
  () =>
    function MockLMEvalResultTable({ results }: { results: EvaluationResult[] }) {
      return <div data-testid="lm-eval-result-table">Results: {results.length}</div>;
    },
);

// Mock the ApplicationsPage component
jest.mock(
  'mod-arch-shared/dist/components/ApplicationsPage',
  () =>
    function MockApplicationsPage({
      loaded,
      empty,
      emptyMessage,
      title,
      breadcrumb,
      headerAction,
      children,
    }: {
      loaded?: boolean;
      empty?: boolean;
      emptyMessage?: string;
      title?: string;
      breadcrumb?: React.ReactNode;
      headerAction?: React.ReactNode;
      children?: React.ReactNode;
    }) {
      return (
        <div data-testid="lm-eval-result-app-page">
          <div>Loaded: {String(loaded)}</div>
          <div>Empty: {String(empty)}</div>
          {emptyMessage && <div>Empty Message: {emptyMessage}</div>}
          {title && <div>Title: {title}</div>}
          {breadcrumb && <div data-testid="breadcrumb">{breadcrumb}</div>}
          {headerAction && <div data-testid="header-action">{headerAction}</div>}
          {children && <div data-testid="children">{children}</div>}
        </div>
      );
    },
);

describe('LMEvalResult', () => {
  // Setup mocks and test scenarios
  const setupMocks = createSetupMocks(
    mockUseParams,
    mockUseLMEvalResult,
    mockParseEvaluationResults,
  );

  const {
    renderWithDefaultSetup,
    renderWithEmptyEvaluation,
    renderWithNoResults,
    renderWithParseError,
  } = createTestScenarios(setupMocks);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Rendering', () => {
    it('should render evaluation results when evaluation exists and has results', () => {
      renderWithDefaultSetup();

      expectLoadedState(true);
      expectEmptyState(false);
      expectTitle('test-evaluation');
      expectElementPresence('children', true);
      expectElementPresence('header-action', true);
      expectElementPresence('breadcrumb', true);
    });
  });

  describe('Error States', () => {
    errorTestCases.forEach(({ name, setupKey, setupArgs, expectedMessage, expectedTitle }) => {
      it(`should render error message when ${name}`, () => {
        const scenarios = {
          renderWithDefaultSetup,
          renderWithEmptyEvaluation,
          renderWithNoResults,
          renderWithParseError,
        };
        const setupFunction = scenarios[setupKey];

        if (setupKey === 'renderWithEmptyEvaluation' && setupArgs.length > 0) {
          renderWithEmptyEvaluation(setupArgs[0]);
        } else {
          setupFunction();
        }

        expectLoadedState(true);
        expectEmptyState(true);
        expectEmptyMessage(expectedMessage);
        expectTitle(expectedTitle);
      });
    });

    it('should handle missing evaluationName parameter', () => {
      setupMocks({ namespace: 'test-project' }, mockEmptyHookResult);
      renderLMEvalResultComponent();

      expectEmptyMessage('Evaluation "Unknown" not found');
    });

    it('should handle loading state', () => {
      setupMocks(defaultParams, { ...mockEmptyHookResult, loaded: false });
      renderLMEvalResultComponent();

      expectLoadedState(false);
    });

    it('should pass load error to application page', () => {
      setupMocks(defaultParams, { ...mockEmptyHookResult, error: new Error('Load failed') });
      renderLMEvalResultComponent();

      expectLoadedState(true);
      expectEmptyState(true);
    });
  });

  describe('Download Functionality', () => {
    downloadTestCases.forEach(({ name, setupKey, shouldShowButton }) => {
      it(name, () => {
        const scenarios = {
          renderWithDefaultSetup,
          renderWithEmptyEvaluation,
          renderWithNoResults,
          renderWithParseError,
        };
        const setupFunction = scenarios[setupKey];

        if (setupKey === 'renderWithEmptyEvaluation') {
          setupMocks(defaultParams, mockEmptyHookResult);
          renderLMEvalResultComponent();
        } else {
          setupFunction();
        }

        expectElementPresence('header-action', shouldShowButton);
      });
    });
  });

  describe('Hook Integration', () => {
    it('should call useLMEvalResult with correct parameters', () => {
      renderWithDefaultSetup();

      expect(mockUseLMEvalResult).toHaveBeenCalled();
    });

    it('should call parseEvaluationResults with correct results string', () => {
      renderWithDefaultSetup();

      expect(mockParseEvaluationResults).toHaveBeenCalledWith(
        mockSuccessfulHookResult.data.status.results,
      );
    });
  });
});
