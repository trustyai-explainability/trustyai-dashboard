import { SelectionOptions, GroupSelectionOptions } from '@app/components/MultiSelection';

export const mockSetValue = jest.fn();

export const defaultProps = {
  setValue: mockSetValue,
  ariaLabel: 'Test selection',
  placeholder: 'Select options',
};

export const sampleOptions: SelectionOptions[] = [
  { id: '1', name: 'Option 1', selected: false },
  { id: '2', name: 'Option 2', selected: true },
  { id: '3', name: 'Option 3', selected: false },
];

export const sampleGroupedValues: GroupSelectionOptions[] = [
  {
    id: 'group1',
    name: 'Group 1',
    values: [
      { id: 'g1-1', name: 'Group Option 1', selected: false },
      { id: 'g1-2', name: 'Group Option 2', selected: true },
    ],
  },
  {
    id: 'group2',
    name: 'Group 2',
    values: [{ id: 'g2-1', name: 'Group Option 3', selected: false }],
  },
];

export const specialOptions: SelectionOptions[] = [
  { id: '1', name: 'Option with spaces', selected: false },
  { id: '2', name: 'Option-with-dashes', selected: true },
  { id: '3', name: 'Option_with_underscores', selected: false },
];

export const numericOptions: SelectionOptions[] = [
  { id: 1, name: 'Option 1', selected: false },
  { id: 2, name: 'Option 2', selected: true },
];
