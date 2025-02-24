import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { withFlowValidation } from './withFlowValidation';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { trackCTAClick } from '../utils/analytics';
import { useStorage } from '../hooks/useStorage';
import { useAudioFeedback } from './AudioFeedback';
import { Stage } from '../types';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

jest.mock('../contexts/KeyboardShortcutsContext');
jest.mock('../hooks/useTimeTracker');
jest.mock('../utils/analytics');
jest.mock('../hooks/useStorage');
jest.mock('./AudioFeedback');

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

  const mockPlaySound = jest.fn();
  const mockState = {
    stages: {
      'pre-seed': { isComplete: true },
      'seed': { isComplete: true },
      'series-a': { isComplete: false },
      'series-b': { isComplete: false },
      'series-c': { isComplete: false }
    }
  };

  beforeEach(() => {
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState
    });
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test component
  const TestComponent = ({ currentStage }: { currentStage: Stage }) => (
    <div>Current Stage: {currentStage}</div>
  );

  const WrappedComponent = withFlowValidation(TestComponent);

  it('allows access to first stage without prerequisites', () => {
    render(<WrappedComponent currentStage="pre-seed" />);
    expect(screen.getByText('Current Stage: pre-seed')).toBeInTheDocument();
  });

  it('allows access to subsequent stages when prerequisites are met', () => {
    render(<WrappedComponent currentStage="seed" />);
    expect(screen.getByText('Current Stage: seed')).toBeInTheDocument();
  });

  it('blocks access to stages with incomplete prerequisites', () => {
    const onInvalidFlow = jest.fn();
    render(
      <WrappedComponent 
        currentStage="series-b" 
        onInvalidFlow={onInvalidFlow}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/Please complete series-a/);
    expect(onInvalidFlow).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('error');
  });

  it('shows last completed stage when blocking access', () => {
    render(<WrappedComponent currentStage="series-b" />);
    expect(screen.getByText(/Last completed stage: seed/)).toBeInTheDocument();
  });

  it('respects enforceOrder option', () => {
    const NonEnforcingComponent = withFlowValidation(TestComponent, { 
      enforceOrder: false 
    });

    render(<NonEnforcingComponent currentStage="series-c" />);
    expect(screen.getByText('Current Stage: series-c')).toBeInTheDocument();
  });

  it('handles custom stage validation', async () => {
    const validateStage = jest.fn().mockResolvedValue(false);
    
    render(
      <WrappedComponent 
        currentStage="seed"
        validateStage={validateStage}
      />
    );

    await act(async () => {
      await validateStage();
    });

    expect(validateStage).toHaveBeenCalledWith('seed');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('updates validation when stage completion changes', () => {
    const { rerender } = render(<WrappedComponent currentStage="series-a" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();

    (useStorage as jest.Mock).mockReturnValue({
      state: {
        stages: {
          ...mockState.stages,
          'series-a': { isComplete: true }
        }
      }
    });

    rerender(<WrappedComponent currentStage="series-b" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles invalid stage names', () => {
    const onInvalidFlow = jest.fn();
    render(
      <WrappedComponent 
        currentStage={'invalid-stage' as Stage}
        onInvalidFlow={onInvalidFlow}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/Invalid stage/);
    expect(onInvalidFlow).toHaveBeenCalled();
  });

  it('maintains proper display name', () => {
    expect(WrappedComponent.displayName).toBe('WithFlowValidation(TestComponent)');
  });

  it('announces validation errors via LiveRegion', () => {
    render(<WrappedComponent currentStage="series-b" />);
    
    const errorMessage = 'Please complete series-a before starting series-b';
    expect(screen.getByText(errorMessage)).toHaveAttribute('aria-live');
  });

  it('handles missing state data gracefully', () => {
    (useStorage as jest.Mock).mockReturnValue({ state: null });
    
    render(<WrappedComponent currentStage="seed" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('respects custom validation results', async () => {
    const validateStage = jest.fn().mockResolvedValue(true);
    
    render(
      <WrappedComponent 
        currentStage="series-a"
        validateStage={validateStage}
      />
    );

    await act(async () => {
      await validateStage();
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});