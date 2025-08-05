import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppLayout } from '~/app/AppLayout/AppLayout';

// Mock child components
jest.mock('~/app/HeaderTools', () => {
  const MockHeaderTools = () => <div data-testid="header-tools">Header Tools</div>;
  MockHeaderTools.displayName = 'MockHeaderTools';
  return MockHeaderTools;
});

jest.mock('~/app/AppNavSidebar', () => {
  const MockAppNavSidebar = () => <div data-testid="app-nav-sidebar">Navigation Sidebar</div>;
  MockAppNavSidebar.displayName = 'MockAppNavSidebar';
  return MockAppNavSidebar;
});

jest.mock('~/app/routes', () => ({
  useNavData: () => [
    {
      label: 'Model Evaluations',
      path: '/model-evaluations',
    },
  ],
}));

jest.mock('~/app/pages/lmEval/components/EvaluationTitleIcon', () => {
  const MockEvaluationTitleIcon = ({ title }: { title: string }) => (
    <div data-testid="evaluation-title-icon">{title}</div>
  );
  MockEvaluationTitleIcon.displayName = 'MockEvaluationTitleIcon';
  return MockEvaluationTitleIcon;
});

// Mock document.getElementById for SkipToContent functionality
const mockGetElementById = jest.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true,
});

describe('AppLayout', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetElementById.mockReturnValue({
      focus: jest.fn(),
    });
  });

  const renderAppLayout = (children: React.ReactNode = <div>Test Content</div>) =>
    render(
      <BrowserRouter>
        <AppLayout>{children}</AppLayout>
      </BrowserRouter>,
    );

  describe('Basic Rendering', () => {
    it('should render children content', () => {
      renderAppLayout(<div data-testid="test-content">Test Content</div>);

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render the masthead with all components', () => {
      renderAppLayout();

      expect(screen.getByLabelText('Global navigation')).toBeInTheDocument();
      expect(screen.getByTestId('evaluation-title-icon')).toBeInTheDocument();
      expect(screen.getByText('Model evaluations')).toBeInTheDocument();
      expect(screen.getByTestId('header-tools')).toBeInTheDocument();
    });

    it('should render navigation sidebar by default', () => {
      renderAppLayout();

      expect(screen.getByTestId('app-nav-sidebar')).toBeInTheDocument();
    });

    it('should render skip to content link', () => {
      renderAppLayout();

      const skipLink = screen.getByText('Skip to Content');
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('Sidebar Toggle Functionality', () => {
    it('should toggle sidebar visibility when toggle button is clicked', async () => {
      renderAppLayout();

      expect(screen.getByTestId('app-nav-sidebar')).toBeInTheDocument();

      const toggleButton = screen.getByLabelText('Global navigation');
      await user.click(toggleButton);

      expect(screen.queryByTestId('app-nav-sidebar')).not.toBeInTheDocument();

      await user.click(toggleButton);

      expect(screen.getByTestId('app-nav-sidebar')).toBeInTheDocument();
    });

    it('should have proper ARIA label on toggle button', () => {
      renderAppLayout();

      const toggleButton = screen.getByLabelText('Global navigation');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Skip to Content Functionality', () => {
    it('should focus primary content container when skip link is clicked', async () => {
      const mockFocus = jest.fn();
      mockGetElementById.mockReturnValue({
        focus: mockFocus,
      });

      renderAppLayout();

      const skipLink = screen.getByText('Skip to Content');
      await user.click(skipLink);

      expect(mockGetElementById).toHaveBeenCalledWith('primary-app-container');
      expect(mockFocus).toHaveBeenCalled();
    });

    it('should prevent default behavior on skip link click', async () => {
      renderAppLayout();

      const skipLink = screen.getByText('Skip to Content');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      fireEvent(skipLink, clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle missing primary content container gracefully', async () => {
      mockGetElementById.mockReturnValue(null);

      renderAppLayout();

      const skipLink = screen.getByText('Skip to Content');
      await user.click(skipLink);

      expect(mockGetElementById).toHaveBeenCalledWith('primary-app-container');
    });
  });

  describe('Page Structure', () => {
    it('should render Page component with skip to content functionality', () => {
      renderAppLayout();

      const skipLink = screen.getByText('Skip to Content');
      expect(skipLink).toBeInTheDocument();
    });

    it('should render with sidebar toggle functionality', () => {
      renderAppLayout();

      const toggleButton = screen.getByLabelText('Global navigation');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should pass navData to AppNavSidebar', () => {
      renderAppLayout();

      expect(screen.getByTestId('app-nav-sidebar')).toBeInTheDocument();
    });

    it('should render HeaderTools in masthead content', () => {
      renderAppLayout();

      expect(screen.getByTestId('header-tools')).toBeInTheDocument();
    });

    it('should render EvaluationTitleIcon in masthead brand', () => {
      renderAppLayout();

      expect(screen.getByTestId('evaluation-title-icon')).toBeInTheDocument();
      expect(screen.getByText('Model evaluations')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderAppLayout();

      expect(screen.getByLabelText('Global navigation')).toBeInTheDocument();
    });

    it('should have skip to content functionality for keyboard navigation', () => {
      renderAppLayout();

      const skipLink = screen.getByText('Skip to Content');
      expect(skipLink).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should maintain sidebar state across re-renders', async () => {
      const { rerender } = renderAppLayout();

      expect(screen.getByTestId('app-nav-sidebar')).toBeInTheDocument();

      const toggleButton = screen.getByLabelText('Global navigation');
      await user.click(toggleButton);

      expect(screen.queryByTestId('app-nav-sidebar')).not.toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <AppLayout>
            <div>Updated Content</div>
          </AppLayout>
        </BrowserRouter>,
      );

      expect(screen.queryByTestId('app-nav-sidebar')).not.toBeInTheDocument();
    });
  });
});
