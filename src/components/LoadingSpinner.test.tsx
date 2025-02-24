import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';
import { useAudioFeedback } from './AudioFeedback';

jest.mock('./AudioFeedback');

describe('LoadingSpinner', () => {
  const mockPlaySound = jest.fn();

  beforeEach(() => {
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays custom message', () => {
    render(<LoadingSpinner message="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('shows progress when enabled', () => {
    render(
      <LoadingSpinner 
        showProgress={true}
        progress={45}
        message="Loading data"
      />
    );

    expect(screen.getByText('Loading data (45% complete)')).toBeInTheDocument();
  });

  it('plays sound on significant progress changes', () => {
    const { rerender } = render(
      <LoadingSpinner 
        showProgress={true}
        progress={0}
      />
    );

    // Progress jump of 25%
    rerender(<LoadingSpinner showProgress={true} progress={25} />);
    expect(mockPlaySound).toHaveBeenCalledWith('info');

    // Progress jump of less than 25%
    rerender(<LoadingSpinner showProgress={true} progress={30} />);
    expect(mockPlaySound).toHaveBeenCalledTimes(1);

    // Progress completion
    rerender(<LoadingSpinner showProgress={true} progress={100} />);
    expect(mockPlaySound).toHaveBeenCalledWith('complete');
  });

  it('adjusts size based on prop', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('status').querySelector('svg'))
      .toHaveAttribute('width', '24');

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('status').querySelector('svg'))
      .toHaveAttribute('width', '64');
  });

  it('applies inline styling when specified', () => {
    render(<LoadingSpinner inline={true} />);
    expect(screen.getByRole('status')).toHaveClass('inline');
  });

  it('updates ARIA label with progress', () => {
    const { rerender } = render(
      <LoadingSpinner 
        showProgress={true}
        progress={25}
        message="Loading content"
      />
    );

    expect(screen.getByRole('status'))
      .toHaveAttribute('aria-label', 'Loading content (25% complete)');

    rerender(
      <LoadingSpinner 
        showProgress={true}
        progress={50}
        message="Loading content"
      />
    );

    expect(screen.getByRole('status'))
      .toHaveAttribute('aria-label', 'Loading content (50% complete)');
  });

  it('only plays sounds when showProgress is true', () => {
    const { rerender } = render(
      <LoadingSpinner 
        showProgress={false}
        progress={0}
      />
    );

    rerender(<LoadingSpinner showProgress={false} progress={25} />);
    expect(mockPlaySound).not.toHaveBeenCalled();

    rerender(<LoadingSpinner showProgress={false} progress={100} />);
    expect(mockPlaySound).not.toHaveBeenCalled();
  });

  it('announces progress changes via LiveRegion', () => {
    const { rerender } = render(
      <LoadingSpinner 
        showProgress={true}
        progress={0}
        message="Loading data"
      />
    );

    expect(screen.getByText('Loading data (0% complete)')).toBeInTheDocument();

    rerender(
      <LoadingSpinner 
        showProgress={true}
        progress={50}
        message="Loading data"
      />
    );

    expect(screen.getByText('Loading data (50% complete)')).toBeInTheDocument();
  });

  it('accepts custom color prop', () => {
    render(<LoadingSpinner color="#ff0000" />);
    const progressCircle = screen.getByRole('status')
      .querySelector('.spinner-progress');
    
    expect(progressCircle).toHaveStyle({ stroke: '#ff0000' });
  });
});