import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { StageTransition } from './StageTransition';
import { useAudioFeedback } from './AudioFeedback';
import { StageConfig } from '../data/StageConfig';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));
jest.mock('./AudioFeedback');

describe('StageTransition', () => {
  const mockNavigate = jest.fn();
  const mockPlaySound = jest.fn();
  const mockOnTransitionComplete = jest.fn();
  const mockOnTransitionFail = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
    // Mock performance.now
    jest.spyOn(performance, 'now').mockImplementation(() => 0);
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      setTimeout(() => cb(performance.now()), 16);
      return 1;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('executes transition phases in correct order', async () => {
    render(
      <StageTransition
        fromStage="pre-seed"
        toStage="seed"
        onTransitionComplete={mockOnTransitionComplete}
      />
    );

    // Initial preparing phase
    expect(screen.getByText(/Preparing transition/)).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('info');

    // Transitioning phase
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Transitioning from/)).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');

    // Completing phase
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Finalizing/)).toBeInTheDocument();

    // Final completion
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/assessment/seed');
    expect(mockPlaySound).toHaveBeenCalledWith('complete');
    expect(mockOnTransitionComplete).toHaveBeenCalled();
  });

  it('displays progress information when provided', () => {
    render(
      <StageTransition
        fromStage="pre-seed"
        toStage="seed"
        progressData={{
          fromStageProgress: 100,
          toStageProgress: 0
        }}
      />
    );

    const progressBars = screen.getAllByRole('status');
    expect(progressBars).toHaveLength(1);
    expect(screen.getByText('pre-seed:')).toBeInTheDocument();
    expect(screen.getByText('seed:')).toBeInTheDocument();
  });

  it('handles transition errors', async () => {
    const mockError = new Error('Transition failed');
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error log
    
    const failingNavigate = jest.fn().mockRejectedValue(mockError);
    (useNavigate as jest.Mock).mockReturnValue(failingNavigate);

    render(
      <StageTransition
        fromStage="pre-seed"
        toStage="seed"
        onTransitionFail={mockOnTransitionFail}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(2100);
    });

    expect(screen.getByText('Transition Failed')).toBeInTheDocument();
    expect(screen.getByText(mockError.message)).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('error');
    expect(mockOnTransitionFail).toHaveBeenCalledWith(mockError);
  });

  it('allows retry after failure', async () => {
    const mockError = new Error('Transition failed');
    const failingNavigate = jest.fn()
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce(undefined);
    (useNavigate as jest.Mock).mockReturnValue(failingNavigate);

    render(
      <StageTransition
        fromStage="pre-seed"
        toStage="seed"
      />
    );

    // Wait for initial failure
    await act(async () => {
      jest.advanceTimersByTime(2100);
    });

    // Retry
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // Check that transition restarts
    expect(screen.getByText(/Preparing transition/)).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('info');
  });

  it('announces transition states via LiveRegion', async () => {
    render(
      <StageTransition
        fromStage="pre-seed"
        toStage="seed"
        progressData={{
          fromStageProgress: 100,
          toStageProgress: 0
        }}
      />
    );

    const liveRegion = screen.getByText(/Preparing transition.*pre-seed progress: 100%/);
    expect(liveRegion).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Transitioning from.*pre-seed progress: 100%/)).toBeInTheDocument();
  });

  it('updates progress correctly during transition', async () => {
    render(
      <StageTransition
        fromStage="pre-seed"
        toStage="seed"
      />
    );

    const spinner = screen.getByRole('status');
    
    // Initial state
    expect(spinner).toHaveTextContent(/Preparing/);

    // Progress updates
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(spinner).toHaveTextContent(/Transitioning/);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(spinner).toHaveTextContent(/Finalizing/);
  });

  it('passes children through to render', () => {
    render(
      <StageTransition
        fromStage="pre-seed"
        toStage="seed"
      >
        <div>Child content</div>
      </StageTransition>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders transition between stages', () => {
    const handleComplete = jest.fn();
    
    render(
      <StageTransition
        currentStage="pre-seed"
        nextStage="seed"
        onTransitionComplete={handleComplete}
        duration={1000}
      />
    );

    expect(screen.getByText(StageConfig['pre-seed'].title)).toBeInTheDocument();
    expect(screen.getByText(StageConfig.seed.title)).toBeInTheDocument();
  });

  it('shows focus areas for both stages', () => {
    render(
      <StageTransition
        currentStage="pre-seed"
        nextStage="seed"
        onTransitionComplete={jest.fn()}
      />
    );

    StageConfig['pre-seed'].focus.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });

    StageConfig.seed.focus.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('completes transition after duration', () => {
    const handleComplete = jest.fn();
    
    render(
      <StageTransition
        currentStage="pre-seed"
        nextStage="seed"
        onTransitionComplete={handleComplete}
        duration={1000}
      />
    );

    // Fast forward past animation duration
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(handleComplete).toHaveBeenCalled();
  });

  it('updates progress bar during transition', () => {
    render(
      <StageTransition
        currentStage="pre-seed"
        nextStage="seed"
        onTransitionComplete={jest.fn()}
        duration={1000}
      />
    );

    const progressBar = screen.getByRole('progressbar');

    // Check progress at different points
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('announces transition for screen readers', () => {
    render(
      <StageTransition
        currentStage="pre-seed"
        nextStage="seed"
        onTransitionComplete={jest.fn()}
      />
    );

    const announcement = screen.getByText(
      `Transitioning from ${StageConfig['pre-seed'].title} to ${StageConfig.seed.title}`,
      { selector: '#stage-transition-status' }
    );
    expect(announcement).toHaveAttribute('aria-live', 'assertive');
  });

  it('cleans up animation frame on unmount', () => {
    const cancelAnimationFrame = jest.spyOn(window, 'cancelAnimationFrame');
    
    const { unmount } = render(
      <StageTransition
        currentStage="pre-seed"
        nextStage="seed"
        onTransitionComplete={jest.fn()}
      />
    );

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('handles custom duration', () => {
    const handleComplete = jest.fn();
    
    render(
      <StageTransition
        currentStage="pre-seed"
        nextStage="seed"
        onTransitionComplete={handleComplete}
        duration={2000}
      />
    );

    // Should not complete at 1000ms
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(handleComplete).not.toHaveBeenCalled();

    // Should complete at 2000ms
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(handleComplete).toHaveBeenCalled();
  });
});