import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { KeyboardShortcutsProvider } from '../contexts/KeyboardShortcutsContext';
import { trackCTAClick } from '../utils/analytics';
import Navigation from './Navigation';

jest.mock('../utils/analytics');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn()
}));

describe('Navigation', () => {
  const mockOnStageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocation as jest.Mock).mockReturnValue({ state: {} });
  });

  const renderWithProviders = (props = {}) => {
    return render(
      <MemoryRouter>
        <KeyboardShortcutsProvider>
          <Navigation
            currentStage="seed"
            totalStages={4}
            onStageChange={mockOnStageChange}
            {...props}
          />
        </KeyboardShortcutsProvider>
      </MemoryRouter>
    );
  };

  it('renders with correct ARIA attributes', () => {
    renderWithProviders();

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Stage navigation');

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '2');
    expect(progressbar).toHaveAttribute('aria-valuemin', '1');
    expect(progressbar).toHaveAttribute('aria-valuemax', '4');
  });

  it('handles keyboard navigation', () => {
    renderWithProviders();

    // Previous stage
    fireEvent.keyDown(document, { key: '[' });
    expect(mockOnStageChange).toHaveBeenCalledWith('pre-seed');

    // Next stage
    fireEvent.keyDown(document, { key: ']' });
    expect(mockOnStageChange).toHaveBeenCalledWith('series-a');
  });

  it('disables navigation at boundaries', () => {
    renderWithProviders({ currentStage: 'pre-seed' });

    const prevButton = screen.getByLabelText('Previous stage');
    expect(prevButton).toBeDisabled();

    renderWithProviders({ currentStage: 'series-b' });

    const nextButton = screen.getByLabelText('Next stage');
    expect(nextButton).toBeDisabled();
  });

  it('tracks navigation interactions', () => {
    renderWithProviders();

    fireEvent.click(screen.getByLabelText('Next stage'));
    expect(trackCTAClick).toHaveBeenCalledWith('stage_navigation');
  });

  it('focuses navigation on keyboard-triggered route changes', () => {
    (useLocation as jest.Mock).mockReturnValue({ 
      state: { fromKeyboard: true } 
    });

    renderWithProviders();

    const nav = screen.getByRole('navigation');
    expect(document.activeElement).toBe(nav);
  });

  it('maintains focus when using keyboard shortcuts', () => {
    renderWithProviders();

    const nav = screen.getByRole('navigation');
    nav.focus();

    fireEvent.keyDown(document, { key: ']' });
    expect(document.activeElement).toBe(nav);
  });

  it('announces stage changes to screen readers', () => {
    renderWithProviders();

    const status = screen.getByText('Stage 2 of 4');
    expect(status.parentElement).toHaveAttribute('aria-live', 'polite');
  });

  it('provides accessible keyboard shortcut information', () => {
    renderWithProviders();

    const shortcuts = screen.getByLabelText('Keyboard shortcuts');
    expect(shortcuts).toBeInTheDocument();
    expect(shortcuts).toHaveTextContent(/prev stage/);
    expect(shortcuts).toHaveTextContent(/next stage/);
  });

  it('updates progress bar correctly', () => {
    renderWithProviders({ currentStage: 'series-a' });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '3');

    const progressBarFill = progressBar.querySelector('.stage-navigation__progress-bar');
    expect(progressBarFill).toHaveStyle({ width: '75%' });
  });

  it('handles click events on navigation buttons', () => {
    renderWithProviders();

    fireEvent.click(screen.getByLabelText('Previous stage'));
    expect(mockOnStageChange).toHaveBeenCalledWith('pre-seed');

    fireEvent.click(screen.getByLabelText('Next stage'));
    expect(mockOnStageChange).toHaveBeenCalledWith('series-a');
  });

  it('renders navigation links', () => {
    render(<Navigation />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('tracks CTA click events', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByText('Home'));
    expect(trackCTAClick).toHaveBeenCalledWith('Home');
  });
});