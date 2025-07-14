import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LMEvalResultTable from '~/app/pages/lmEvalResult/LMEvalResultTable';
import { EvaluationResult } from '~/app/pages/lmEvalResult/utils';
import { mockResults } from '~/__mocks__/lmEvaluationResultsData';

// Helper functions
export const setupUserAndRender = (
  results: EvaluationResult[] = mockResults,
): { user: ReturnType<typeof userEvent.setup> } => {
  const user = userEvent.setup();
  render(<LMEvalResultTable results={results} />);
  return { user };
};

export const searchByText = async (
  user: ReturnType<typeof userEvent.setup>,
  searchText: string,
): Promise<HTMLElement> => {
  const searchInput = screen.getByPlaceholderText('Find by task name');
  await user.type(searchInput, searchText);
  return searchInput;
};

export const expectTableHeaders = (): void => {
  expect(screen.getAllByText('Task')[1]).toBeInTheDocument();
  expect(screen.getAllByText('Metric')[0]).toBeInTheDocument();
  expect(screen.getAllByText('Value')[0]).toBeInTheDocument();
  expect(screen.getAllByText('Error')[0]).toBeInTheDocument();
};

export const expectRowCount = (expectedCount: number): void => {
  expect(screen.getAllByRole('row')).toHaveLength(expectedCount);
};
