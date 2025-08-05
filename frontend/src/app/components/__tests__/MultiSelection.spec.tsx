import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelection, SelectionOptions } from '@app/components/MultiSelection';
import {
  mockSetValue,
  defaultProps,
  sampleOptions,
  sampleGroupedValues,
  specialOptions,
  numericOptions,
} from './MultiSelection.testData';

describe('MultiSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with basic props', () => {
      render(<MultiSelection {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders with placeholder text', () => {
      render(<MultiSelection {...defaultProps} placeholder="Custom placeholder" />);
      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('renders in disabled state', () => {
      render(<MultiSelection {...defaultProps} isDisabled />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('displays selected values as labels', () => {
      render(<MultiSelection {...defaultProps} value={sampleOptions} />);
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('shows clear button when items are selected', () => {
      render(<MultiSelection {...defaultProps} value={sampleOptions} />);
      expect(screen.getByRole('button', { name: /clear input value/i })).toBeInTheDocument();
    });

    it('does not show clear button when no items are selected', () => {
      const unselectedOptions = sampleOptions.map((opt) => ({ ...opt, selected: false }));
      render(<MultiSelection {...defaultProps} value={unselectedOptions} />);
      expect(screen.queryByRole('button', { name: /clear input value/i })).not.toBeInTheDocument();
    });
  });

  describe('Selection Functionality', () => {
    it('calls setValue when an option is selected', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} value={sampleOptions} />);

      const toggle = screen.getByRole('button', { name: /test selection/i });
      await user.click(toggle);

      const option = screen.getByText('Option 1');
      await user.click(option);

      expect(mockSetValue).toHaveBeenCalled();
    });

    it('clears all selections when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} value={sampleOptions} />);

      const clearButton = screen.getByRole('button', { name: /clear input value/i });
      await user.click(clearButton);

      expect(mockSetValue).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '1', selected: false }),
          expect.objectContaining({ id: '2', selected: false }),
          expect.objectContaining({ id: '3', selected: false }),
        ]),
      );
    });
  });

  describe('Grouped Values', () => {
    it('renders grouped options correctly', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} groupedValues={sampleGroupedValues} />);

      const toggle = screen.getByRole('button', { name: /test selection/i });
      await user.click(toggle);

      expect(screen.getByText('Group Option 1')).toBeInTheDocument();
      expect(screen.getAllByText('Group Option 2')).toHaveLength(2);
      expect(screen.getByText('Group Option 3')).toBeInTheDocument();
    });

    it('filters grouped options based on input', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} groupedValues={sampleGroupedValues} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Option 1');

      expect(screen.getByText('Group Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Group Option 3')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown on Enter key', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} value={sampleOptions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, '{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} value={sampleOptions} />);

      const toggle = screen.getByRole('button', { name: /test selection/i });
      await user.click(toggle);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const input = screen.getByRole('combobox');
      await user.type(input, '{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters options based on input text', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} value={sampleOptions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Option 1');

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });

    it('shows no results message when no matches found', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} value={sampleOptions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'NonExistent');

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  describe('Creatable Options', () => {
    it('shows create option when isCreatable is true', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelection
          {...defaultProps}
          value={sampleOptions}
          isCreatable
          createOptionMessage="Create new option"
        />,
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'New Option');

      expect(screen.getByText('Create new option')).toBeInTheDocument();
    });

    it('creates new option when create option is selected', async () => {
      const user = userEvent.setup();
      render(<MultiSelection {...defaultProps} value={sampleOptions} isCreatable />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'New Option');

      const createOption = screen.getByText(/Create/);
      await user.click(createOption);

      expect(mockSetValue).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('shows error message when selection is required but none selected', () => {
      render(
        <MultiSelection
          {...defaultProps}
          value={sampleOptions.map((opt) => ({ ...opt, selected: false }))}
          selectionRequired
        />,
      );

      expect(screen.getByText('One or more options must be selected')).toBeInTheDocument();
    });

    it('does not show error when selection is required and items are selected', () => {
      render(<MultiSelection {...defaultProps} value={sampleOptions} selectionRequired />);

      expect(screen.queryByText('One or more options must be selected')).not.toBeInTheDocument();
    });

    it('shows custom error message', () => {
      render(
        <MultiSelection
          {...defaultProps}
          value={sampleOptions.map((opt) => ({ ...opt, selected: false }))}
          selectionRequired
          noSelectedOptionsMessage="Custom error message"
        />,
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('Custom Filter Function', () => {
    it('uses custom filter function when provided', async () => {
      const customFilter = jest.fn((filterText: string, options: SelectionOptions[]) =>
        options.filter((opt) => opt.name.startsWith(filterText)),
      );

      const user = userEvent.setup();
      render(
        <MultiSelection {...defaultProps} value={sampleOptions} filterFunction={customFilter} />,
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'Option');

      expect(customFilter).toHaveBeenCalledWith('Option', sampleOptions);
    });
  });

  describe('Props and Configuration', () => {
    it('applies custom test IDs', () => {
      render(<MultiSelection {...defaultProps} toggleTestId="custom-toggle-test-id" />);

      expect(screen.getByTestId('custom-toggle-test-id')).toBeInTheDocument();
    });

    it('handles scrollable prop', () => {
      render(<MultiSelection {...defaultProps} isScrollable />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('handles custom IDs', () => {
      render(
        <MultiSelection
          {...defaultProps}
          id="custom-id"
          toggleId="custom-toggle-id"
          inputId="custom-input-id"
        />,
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('id', 'custom-input-id');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty value array', () => {
      render(<MultiSelection {...defaultProps} value={[]} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('handles empty grouped values', () => {
      render(<MultiSelection {...defaultProps} groupedValues={[]} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('handles options with special characters in names', () => {
      render(<MultiSelection {...defaultProps} value={specialOptions} />);
      expect(screen.getByText('Option-with-dashes')).toBeInTheDocument();
    });

    it('handles numeric IDs', () => {
      render(<MultiSelection {...defaultProps} value={numericOptions} />);
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });
});
