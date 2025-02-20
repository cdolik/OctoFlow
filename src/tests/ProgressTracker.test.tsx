import { render, screen } from '@testing-library/react';
import ProgressTracker from '../components/ProgressTracker';

describe('ProgressTracker', () => {
  const defaultProps = {
    progress: 50,
    currentQuestion: 5,
    totalQuestions: 10
  };

  it('renders progress bar with correct percentage', () => {
    render(<ProgressTracker {...defaultProps} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('shows current question and total', () => {
    render(<ProgressTracker {...defaultProps} />);
    expect(screen.getByText('Question 5 of 10')).toBeInTheDocument();
  });

  it('shows completion percentage', () => {
    render(<ProgressTracker {...defaultProps} />);
    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  it('calculates remaining time estimate correctly', () => {
    render(<ProgressTracker {...defaultProps} />);
    // 6 questions remaining * 0.5 minutes per question = 3 minutes
    expect(screen.getByText('Est. 3 min remaining')).toBeInTheDocument();
  });

  it('rounds up time estimates', () => {
    render(
      <ProgressTracker
        progress={80}
        currentQuestion={8}
        totalQuestions={10}
      />
    );
    // 3 questions * 0.5 = 1.5 minutes, should round up to 2
    expect(screen.getByText('Est. 2 min remaining')).toBeInTheDocument();
  });

  it('handles edge cases correctly', () => {
    // Test start of assessment
    const { rerender } = render(
      <ProgressTracker
        progress={0}
        currentQuestion={1}
        totalQuestions={10}
      />
    );
    expect(screen.getByText('Est. 5 min remaining')).toBeInTheDocument();

    // Test end of assessment
    rerender(
      <ProgressTracker
        progress={100}
        currentQuestion={10}
        totalQuestions={10}
      />
    );
    expect(screen.getByText('Est. 1 min remaining')).toBeInTheDocument();
  });
});