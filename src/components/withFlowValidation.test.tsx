import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { withFlowValidation } from './withFlowValidation';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { trackCTAClick } from '../utils/analytics';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

jest.mock('../contexts/KeyboardShortcutsContext');
jest.mock('../hooks/useTimeTracker');
jest.mock('../utils/analytics');

describe('withFlowValidation', () => {
  const TestComponent: React.FC<any> = ({ validateFlow, canProgress, isIdle }) => (
    <div>
      <span data-testid="can-progress">{canProgress.toString()}</span>
      <span data-testid="is-idle">{isIdle.toString()}</span>
      <button onClick={validateFlow}>Next</button>
    </div>
  );

  const WrappedComponent = withFlowValidation(TestComponent, {
    minTimePerQuestion: 5000
  });

  const mockNavigate = jest.fn();
  const mockDisableShortcuts = jest.fn();
  const mockEnableShortcuts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useKeyboardShortcuts as jest.Mock).mockReturnValue({
      disableShortcuts: mockDisableShortcuts,
      enableShortcuts: mockEnableShortcuts
    });
    (useTimeTracker as jest.Mock).mockReturnValue({
      elapsedTime: 0,
      canProgress: false,
      isIdle: false
    });
  });

  it('prevents progression when minimum time not met', async () => {
    const mockOnValidationFailed = jest.fn();
    
    render(
      <MemoryRouter>
        <WrappedComponent onValidationFailed={mockOnValidationFailed} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Next'));
    expect(mockOnValidationFailed).toHaveBeenCalledWith(
      'Please spend at least 5 seconds reviewing the question'
    );
  });

  it('allows progression after minimum time met', async () => {
    const mockOnValidationSuccess = jest.fn();
    
    (useTimeTracker as jest.Mock).mockReturnValue({
      elapsedTime: 6000,
      canProgress: true,
      isIdle: false
    });

    render(
      <MemoryRouter>
        <WrappedComponent onValidationSuccess={mockOnValidationSuccess} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Next'));
    expect(mockOnValidationSuccess).toHaveBeenCalled();
    expect(trackCTAClick).toHaveBeenCalledWith('assessment_progression');
  });

  it('handles keyboard shortcuts based on progression state', () => {
    render(
      <MemoryRouter>
        <WrappedComponent />
      </MemoryRouter>
    );

    // Initially shortcuts should be disabled
    expect(mockDisableShortcuts).toHaveBeenCalled();

    // Simulate meeting minimum time
    act(() => {
      (useTimeTracker as jest.Mock).mockImplementation(({ onTimeUpdate }) => {
        onTimeUpdate?.(6000);
        return {
          elapsedTime: 6000,
          canProgress: true,
          isIdle: false
        };
      });
    });

    expect(mockEnableShortcuts).toHaveBeenCalled();
  });

  it('prevents navigation when idle', async () => {
    const mockOnValidationFailed = jest.fn();
    
    (useTimeTracker as jest.Mock).mockReturnValue({
      elapsedTime: 6000,
      canProgress: true,
      isIdle: true
    });

    render(
      <MemoryRouter>
        <WrappedComponent onValidationFailed={mockOnValidationFailed} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Next'));
    expect(mockOnValidationFailed).toHaveBeenCalledWith(
      'Please resume the assessment before continuing'
    );
  });

  it('handles beforeunload event', () => {
    (useTimeTracker as jest.Mock).mockReturnValue({
      elapsedTime: 0,
      canProgress: false,
      isIdle: false
    });

    render(
      <MemoryRouter>
        <WrappedComponent />
      </MemoryRouter>
    );

    const event = new Event('beforeunload') as BeforeUnloadEvent;
    Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
    Object.defineProperty(event, 'returnValue', { value: '', writable: true });

    window.dispatchEvent(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('blocks programmatic navigation when validation fails', () => {
    const unblockMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(() => unblockMock);

    const { unmount } = render(
      <MemoryRouter>
        <WrappedComponent />
      </MemoryRouter>
    );

    const mockNavigationResult = mockNavigate.mock.calls[0][0]('/next-page');
    expect(mockNavigationResult).toBe(false);

    unmount();
    expect(unblockMock).toHaveBeenCalled();
  });
});