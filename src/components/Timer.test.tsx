import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from './Timer';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { useAudioFeedback } from './AudioFeedback';

jest.mock('../hooks/useTimeTracker');
jest.mock('./AudioFeedback');

describe('Timer', () => {
  const mockTimeTracker = {
    elapsedTime: 0,
    isIdle: false,
    canProgress: false,
    resume: jest.fn()
  };

  const mockPlaySound = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (useTimeTracker as jest.Mock).mockReturnValue(mockTimeTracker);
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays formatted time correctly', () => {
    (useTimeTracker as jest.Mock).mockReturnValue({
      ...mockTimeTracker,
      elapsedTime: 65000 // 1:05
    });

    render(<Timer />);
    expect(screen.getByRole('timer')).toHaveTextContent('1:05');
  });

  it('shows progress bar when below minimum time', () => {
    render(<Timer minTime={10000} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('hides progress bar when minimum time reached', () => {
    (useTimeTracker as jest.Mock).mockReturnValue({
      ...mockTimeTracker,
      canProgress: true,
      elapsedTime: 10000
    });

    render(<Timer minTime={10000} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows resume button when idle', () => {
    (useTimeTracker as jest.Mock).mockReturnValue({
      ...mockTimeTracker,
      isIdle: true
    });

    render(<Timer />);
    
    const resumeButton = screen.getByRole('button', { name: 'Resume assessment' });
    expect(resumeButton).toBeInTheDocument();

    fireEvent.click(resumeButton);
    expect(mockTimeTracker.resume).toHaveBeenCalled();
  });

  it('calls onMinTimeReached when minimum time is met', () => {
    const mockOnMinTimeReached = jest.fn();
    
    (useTimeTracker as jest.Mock).mockReturnValue({
      ...mockTimeTracker,
      canProgress: true
    });

    render(<Timer onMinTimeReached={mockOnMinTimeReached} />);
    expect(mockOnMinTimeReached).toHaveBeenCalled();
  });

  it('updates remaining time message', () => {
    (useTimeTracker as jest.Mock).mockReturnValue({
      ...mockTimeTracker,
      elapsedTime: 5000
    });

    render(<Timer minTime={10000} />);
    
    const message = screen.getByText(/Please review for 5 more seconds/);
    expect(message).toHaveAttribute('aria-live', 'polite');
  });

  it('adds idle class when inactive', () => {
    (useTimeTracker as jest.Mock).mockReturnValue({
      ...mockTimeTracker,
      isIdle: true
    });

    render(<Timer />);
    expect(screen.getByRole('timer')).toHaveClass('timer--idle');
  });

  it('updates time display with aria-live', () => {
    const { rerender } = render(<Timer />);

    (useTimeTracker as jest.Mock).mockReturnValue({
      ...mockTimeTracker,
      elapsedTime: 30000
    });

    rerender(<Timer />);
    
    const display = screen.getByText('0:30');
    expect(display).toHaveAttribute('aria-live', 'polite');
  });

  it('calculates progress percentage correctly', () => {
    (useTimeTracker as jest.Mock).mockReturnValue({
      ...mockTimeTracker,
      elapsedTime: 5000
    });

    render(<Timer minTime={10000} />);
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    
    const progressBarFill = progressbar.querySelector('.timer__progress-bar');
    expect(progressBarFill).toHaveStyle({ width: '50%' });
  });

  it('calls onTimeUpdate when time changes', () => {
    const mockOnTimeUpdate = jest.fn();
    
    render(<Timer onTimeUpdate={mockOnTimeUpdate} />);
    
    expect(useTimeTracker).toHaveBeenCalledWith(expect.objectContaining({
      onTimeUpdate: mockOnTimeUpdate
    }));
  });

  it('starts automatically when autoStart is true', () => {
    render(<Timer autoStart={true} duration={60000} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('0:59')).toBeInTheDocument();
  });

  it('remains paused when autoStart is false', () => {
    render(<Timer autoStart={false} duration={60000} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('toggles timer state on button click', () => {
    render(<Timer autoStart={false} duration={60000} />);
    
    const startButton = screen.getByLabelText('Start timer');
    fireEvent.click(startButton);
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('0:59')).toBeInTheDocument();

    const pauseButton = screen.getByLabelText('Pause timer');
    fireEvent.click(pauseButton);
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');
  });

  it('resets timer to initial duration', () => {
    render(<Timer duration={60000} />);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const resetButton = screen.getByLabelText('Reset timer');
    fireEvent.click(resetButton);

    expect(screen.getByText('1:00')).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('info');
  });

  it('triggers warning at threshold', () => {
    const onWarning = jest.fn();
    render(
      <Timer 
        duration={60000}
        warningThreshold={30000}
        onWarning={onWarning}
      />
    );

    act(() => {
      jest.advanceTimersByTime(31000);
    });

    expect(onWarning).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('info');
    expect(screen.getByRole('timer')).toHaveClass('warning');
  });

  it('triggers critical at threshold', () => {
    const onCritical = jest.fn();
    render(
      <Timer 
        duration={60000}
        criticalThreshold={10000}
        onCritical={onCritical}
      />
    );

    act(() => {
      jest.advanceTimersByTime(51000);
    });

    expect(onCritical).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('error');
    expect(screen.getByRole('timer')).toHaveClass('critical');
  });

  it('calls onComplete when timer finishes', () => {
    const onComplete = jest.fn();
    render(
      <Timer 
        duration={5000}
        onComplete={onComplete}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onComplete).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('complete');
  });

  it('updates progress bar correctly', () => {
    render(<Timer duration={100000} showRemaining={true} />);
    
    const progressBar = screen.getByRole('progressbar');
    
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');

    act(() => {
      jest.advanceTimersByTime(50000);
    });

    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('announces time remaining via LiveRegion', () => {
    render(<Timer duration={120000} />);

    expect(screen.getByText('2 minutes 0 seconds remaining')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(61000);
    });

    expect(screen.getByText('59 seconds remaining')).toBeInTheDocument();
  });

  it('handles pause state in LiveRegion', () => {
    render(<Timer autoStart={true} duration={60000} />);
    
    const pauseButton = screen.getByLabelText('Pause timer');
    fireEvent.click(pauseButton);

    expect(screen.getByText('Timer paused')).toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = render(<Timer duration={60000} />);
    
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});