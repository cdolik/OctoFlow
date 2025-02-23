import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveIndicator from './SaveIndicator';
import { AssessmentSaveStatus } from '../types/assessment';

describe('SaveIndicator', () => {
  const mockReload = jest.fn();
  Object.defineProperty(window, 'location', {
    value: { reload: mockReload }
  });

  beforeEach(() => {
    mockReload.mockClear();
  });

  it('displays correct text for saved status', () => {
    const status: AssessmentSaveStatus = {
      status: 'saved',
      timestamp: Date.now()
    };

    render(<SaveIndicator status={status} />);
    expect(screen.getByText('All changes saved')).toBeInTheDocument();
  });

  it('displays correct text for saving status', () => {
    const status: AssessmentSaveStatus = { status: 'saving' };

    render(<SaveIndicator status={status} />);
    expect(screen.getByText('Saving changes...')).toBeInTheDocument();
  });

  it('displays error message and retry button for error status', () => {
    const status: AssessmentSaveStatus = {
      status: 'error',
      error: new Error('Save failed')
    };

    render(<SaveIndicator status={status} />);
    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry saving changes' })).toBeInTheDocument();
  });

  it('triggers page reload on retry button click', () => {
    const status: AssessmentSaveStatus = {
      status: 'error',
      error: new Error('Save failed')
    };

    render(<SaveIndicator status={status} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry saving changes' }));
    expect(mockReload).toHaveBeenCalled();
  });

  it('applies correct CSS classes based on status', () => {
    const { rerender } = render(
      <SaveIndicator 
        status={{ status: 'saved', timestamp: Date.now() }} 
      />
    );
    expect(screen.getByRole('status')).toHaveClass('save-status--saved');

    rerender(<SaveIndicator status={{ status: 'saving' }} />);
    expect(screen.getByRole('status')).toHaveClass('save-status--saving');

    rerender(
      <SaveIndicator 
        status={{ status: 'error', error: new Error('Save failed') }} 
      />
    );
    expect(screen.getByRole('status')).toHaveClass('save-status--error');
  });

  it('maintains accessibility attributes', () => {
    const status: AssessmentSaveStatus = {
      status: 'saved',
      timestamp: Date.now()
    };

    render(<SaveIndicator status={status} />);
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('accepts and applies custom className', () => {
    const status: AssessmentSaveStatus = {
      status: 'saved',
      timestamp: Date.now()
    };

    render(<SaveIndicator status={status} className="custom-class" />);
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });
});