// eslint-disable-next-line import/order
import './LMEvalFormMocks';

import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LMEvalForm from '~/app/pages/lmEvalForm/LMEvalForm';

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) =>
  render(<BrowserRouter>{component}</BrowserRouter>);

describe('LMEvalForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the form with all essential elements', () => {
    renderWithRouter(<LMEvalForm />);

    expect(screen.getByTestId('mock-applications-page')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toHaveTextContent('Start an evaluation run');
    expect(screen.getByTestId('page-description')).toHaveTextContent(
      'Configure details for your model evaluation run.',
    );
    expect(screen.getByTestId('lmEvaluationForm')).toBeInTheDocument();
  });

  it('should render model selection dropdown', () => {
    renderWithRouter(<LMEvalForm />);

    expect(screen.getByTestId('model-name-form-group')).toBeInTheDocument();
    expect(screen.getByText('Model name')).toBeInTheDocument();
    expect(screen.getByText('Select a model')).toBeInTheDocument();
  });

  it('should handle model selection', async () => {
    renderWithRouter(<LMEvalForm />);

    // Open the model dropdown
    const modelToggle = screen.getByRole('button', { name: /model options menu/i });
    await user.click(modelToggle);

    // Select a model
    const modelOption = screen.getByText('Model 1');
    await user.click(modelOption);

    // Verify the selection is reflected in the footer
    await waitFor(() => {
      expect(screen.getByTestId('footer-data-model')).toHaveTextContent('model1');
    });
  });

  it('should render evaluation name field', () => {
    renderWithRouter(<LMEvalForm />);

    expect(screen.getByTestId('evaluation-name-form-group')).toBeInTheDocument();
    expect(screen.getByTestId('lm-eval-name-description-field')).toBeInTheDocument();
  });

  it('should render model type selection dropdown', () => {
    renderWithRouter(<LMEvalForm />);

    expect(screen.getByTestId('model-type-form-group')).toBeInTheDocument();
    expect(screen.getByText('Model endpoint interaction')).toBeInTheDocument();
    expect(screen.getByText('Select model type')).toBeInTheDocument();
  });

  it('should handle model type selection', async () => {
    renderWithRouter(<LMEvalForm />);

    // Open the model type dropdown
    const modelTypeButtons = screen.getAllByRole('button', { name: /options menu/i });
    const modelTypeToggle = modelTypeButtons.find((button) =>
      button.closest('[data-testid="model-type-form-group"]'),
    );

    if (modelTypeToggle) {
      await user.click(modelTypeToggle);

      // Select a model type
      const modelTypeOption = screen.getByText('Local chat completion');
      await user.click(modelTypeOption);

      // Verify the selection is displayed
      await waitFor(() => {
        expect(screen.getByText('Local chat completion')).toBeInTheDocument();
      });
    }
  });

  it('should render all child components', () => {
    renderWithRouter(<LMEvalForm />);

    expect(screen.getByTestId('mock-task-section')).toBeInTheDocument();
    expect(screen.getByTestId('mock-security-section')).toBeInTheDocument();
    expect(screen.getByTestId('mock-model-argument-section')).toBeInTheDocument();
    expect(screen.getByTestId('mock-form-footer')).toBeInTheDocument();
  });

  it('should handle task section interactions', async () => {
    renderWithRouter(<LMEvalForm />);

    const setTasksButton = screen.getByText('Set Mock Tasks');
    await user.click(setTasksButton);

    expect(screen.getByTestId('task-count')).toHaveTextContent('2');
  });

  it('should handle security section interactions', async () => {
    renderWithRouter(<LMEvalForm />);

    const allowOnlineCheckbox = screen.getByTestId('allow-online-checkbox');
    const allowRemoteCodeCheckbox = screen.getByTestId('allow-remote-code-checkbox');

    expect(allowOnlineCheckbox).not.toBeChecked();
    expect(allowRemoteCodeCheckbox).not.toBeChecked();

    await user.click(allowOnlineCheckbox);
    await user.click(allowRemoteCodeCheckbox);

    expect(allowOnlineCheckbox).toBeChecked();
    expect(allowRemoteCodeCheckbox).toBeChecked();
  });

  it('should handle model argument updates', async () => {
    renderWithRouter(<LMEvalForm />);

    const modelNameInput = screen.getByTestId('model-name-input');
    const modelUrlInput = screen.getByTestId('model-url-input');

    await user.clear(modelNameInput);
    await user.type(modelNameInput, 'test-model');

    await user.clear(modelUrlInput);
    await user.type(modelUrlInput, 'http://test-url.com');

    expect(modelNameInput).toHaveValue('test-model');
    expect(modelUrlInput).toHaveValue('http://test-url.com');
  });

  it('should render breadcrumb with correct links', () => {
    renderWithRouter(<LMEvalForm />);

    const breadcrumb = screen.getByTestId('page-breadcrumb');
    expect(breadcrumb).toBeInTheDocument();

    // Check for the presence of breadcrumb items
    expect(screen.getByText('Model evaluations')).toBeInTheDocument();
    // Use getAllByText since there are multiple instances of this text (title and breadcrumb)
    const startEvalRunElements = screen.getAllByText('Start an evaluation run');
    expect(startEvalRunElements.length).toBeGreaterThan(0);
  });

  it('should have proper form structure and accessibility', () => {
    renderWithRouter(<LMEvalForm />);

    const form = screen.getByTestId('lmEvaluationForm');
    expect(form).toBeInTheDocument();
    expect(form.tagName).toBe('FORM');

    // Check for required fields
    const requiredFields = screen.getAllByText('*');
    expect(requiredFields.length).toBeGreaterThan(0);
  });

  it('should handle dropdown state management', async () => {
    renderWithRouter(<LMEvalForm />);

    // Test model dropdown state
    const modelToggle = screen.getByRole('button', { name: /model options menu/i });

    // Initially closed
    expect(modelToggle).toHaveAttribute('aria-expanded', 'false');

    // Open dropdown
    await user.click(modelToggle);
    expect(modelToggle).toHaveAttribute('aria-expanded', 'true');

    // Close by clicking outside or selecting an option
    const modelOption = screen.getByText('Model 1');
    await user.click(modelOption);

    await waitFor(() => {
      expect(modelToggle).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('should display model options with correct descriptions', async () => {
    renderWithRouter(<LMEvalForm />);

    const modelToggle = screen.getByRole('button', { name: /model options menu/i });
    await user.click(modelToggle);

    expect(screen.getByText('Model 1')).toBeInTheDocument();
    expect(screen.getByText('Model 2')).toBeInTheDocument();
    expect(screen.getByText('Model 1 in default')).toBeInTheDocument();
    expect(screen.getByText('Model 2 in default')).toBeInTheDocument();
  });

  it('should display model type options with correct descriptions', async () => {
    renderWithRouter(<LMEvalForm />);

    const modelTypeButtons = screen.getAllByRole('button', { name: /options menu/i });
    const modelTypeToggle = modelTypeButtons.find((button) =>
      button.closest('[data-testid="model-type-form-group"]'),
    );

    if (modelTypeToggle) {
      await user.click(modelTypeToggle);

      expect(screen.getByText('Local chat completion')).toBeInTheDocument();
      expect(screen.getByText('Local completion')).toBeInTheDocument();
      expect(
        screen.getByText('Use this for tasks that rely on free-form generation.'),
      ).toBeInTheDocument();
    }
  });
});
