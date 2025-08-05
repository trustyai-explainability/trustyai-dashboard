import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '@app/components/NotFound/NotFound';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders all required elements correctly', () => {
      render(
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>,
      );

      // Check main elements are present
      expect(screen.getByText('404 Page not found')).toBeInTheDocument();
      expect(
        screen.getByText("We didn't find a page that matches the address you navigated to."),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Take me home' })).toBeInTheDocument();
    });
  });

  describe('Navigation Functionality', () => {
    it('navigates to home page when "Take me home" button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>,
      );

      const homeButton = screen.getByRole('button', { name: 'Take me home' });
      await user.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not call navigate function on initial render', () => {
      render(
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>,
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility and User Interaction', () => {
    it('has proper button accessibility and focus management', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button', { name: 'Take me home' });

      // Check button is enabled and accessible
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();

      // Check focus management
      await user.tab();
      expect(button).toHaveFocus();

      // Check click functionality
      await user.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
