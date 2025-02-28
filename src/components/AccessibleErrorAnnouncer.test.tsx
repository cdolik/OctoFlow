import React from 'react';
import { render, screen } from '@testing-library/react';
import { AccessibleErrorAnnouncer } from './AccessibleErrorAnnouncer';
import { AssessmentError } from '../types/errors';

describe('AccessibleErrorAnnouncer', () => {
  it('renders error message for standard error', () => {
    const error = new Error('Test error message');
    render(<AccessibleErrorAnnouncer error={error} />);
    
    expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
  });

  it('renders structured message for AssessmentError', () => {
    const error = new AssessmentError('Critical system error', {
      severity: 'critical',
      recoverable: false
    });
    
    render(<AccessibleErrorAnnouncer error={error} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Critical system error');
    expect(alert).toHaveTextContent('This is a critical error');
    expect(alert).toHaveTextContent('Please try again later');
  });

  it('shows recovery status when isRecovering is true', () => {
    const error = new AssessmentError('Network error', {
      severity: 'medium',
      recoverable: true
    });
    
    render(<AccessibleErrorAnnouncer error={error} isRecovering={true} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Attempting to recover');
  });

  it('uses correct aria-live value based on polite prop', () => {
    const error = new Error('Test error');
    
    const { rerender } = render(
      <AccessibleErrorAnnouncer error={error} polite={true} />
    );
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    
    rerender(<AccessibleErrorAnnouncer error={error} polite={false} />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders nothing when error is null', () => {
    const { container } = render(<AccessibleErrorAnnouncer error={null} />);
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('applies custom className', () => {
    const error = new Error('Test error');
    render(
      <AccessibleErrorAnnouncer
        error={error}
        className="custom-error"
      />
    );
    
    expect(screen.getByRole('alert')).toHaveClass('custom-error');
  });
});