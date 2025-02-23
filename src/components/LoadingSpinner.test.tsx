import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('status')).toHaveClass('size-small');

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('status')).toHaveClass('size-large');
  });

  it('shows custom message', () => {
    render(<LoadingSpinner message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Please wait...');
  });

  it('uses custom aria-label when provided', () => {
    render(
      <LoadingSpinner 
        message="Loading..." 
        aria-label="Processing your request" 
      />
    );
    
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Processing your request');
  });

  it('renders svg with correct dimensions', () => {
    const { container, rerender } = render(<LoadingSpinner size="small" />);
    let svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');

    rerender(<LoadingSpinner size="medium" />);
    svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');

    rerender(<LoadingSpinner size="large" />);
    svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('hides loading text from screen readers', () => {
    render(<LoadingSpinner message="Loading content" />);
    const loadingText = screen.getByText('Loading content');
    expect(loadingText).toHaveAttribute('aria-hidden', 'true');
  });
});