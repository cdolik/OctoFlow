import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    expect(spinner).not.toHaveAttribute('aria-valuenow');
  });

  it('shows custom message', () => {
    render(<LoadingSpinner message="Saving changes..." />);
    expect(screen.getByText('Saving changes...')).toBeInTheDocument();
  });

  it('shows progress when enabled', () => {
    render(
      <LoadingSpinner 
        showProgress={true} 
        progress={75} 
        message="Loading data..." 
      />
    );
    
    const progressText = screen.getByText('75%');
    expect(progressText).toBeInTheDocument();
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toHaveAttribute('aria-valuenow', '75');
  });

  it('applies size classes correctly', () => {
    const { container, rerender } = render(<LoadingSpinner size="small" />);
    expect(container.firstChild).toHaveClass('small');

    rerender(<LoadingSpinner size="large" />);
    expect(container.firstChild).toHaveClass('large');
  });

  it('renders SVG with correct dimensions', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '70');
    expect(svg).toHaveAttribute('height', '70');
  });

  it('renders progress circle when showing progress', () => {
    const { container } = render(
      <LoadingSpinner showProgress={true} progress={50} />
    );
    
    const progressCircle = container.querySelector('.progress-circle');
    expect(progressCircle).toBeInTheDocument();
    expect(progressCircle).toHaveAttribute('stroke-dasharray', expect.stringContaining('63'));
  });
});