import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from './Timer';
import { useTimeTracker } from '../hooks/useTimeTracker';

jest.mock('../hooks/useTimeTracker');

describe('Timer', () => {
  const mockTimeTracker = {
    elapsedTime: 0,
    isIdle: false,
    canProgress: false,
    resume: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTimeTracker as jest.Mock).mockReturnValue(mockTimeTracker);
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
});