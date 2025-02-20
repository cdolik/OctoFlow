import React from 'react';
import { render, screen, act } from '@testing-library/react';
import SaveIndicator from '../components/SaveIndicator';

describe('SaveIndicator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows saving state when isSaving is true', () => {
    render(<SaveIndicator isSaving={true} lastSaved={null} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows saved state with timestamp when lastSaved is provided', () => {
    const lastSaved = new Date('2024-01-01T12:00:00');
    render(<SaveIndicator isSaving={false} lastSaved={lastSaved} />);
    expect(screen.getByText('Progress saved')).toBeInTheDocument();
    expect(screen.getByText('12:00:00')).toBeInTheDocument();
  });

  it('hides after 2 seconds when save completes', () => {
    const lastSaved = new Date();
    const { container } = render(<SaveIndicator isSaving={false} lastSaved={lastSaved} />);
    
    expect(screen.getByText('Progress saved')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(container.firstChild).toBeNull();
  });

  it('maintains visibility while saving', () => {
    const { rerender } = render(<SaveIndicator isSaving={true} lastSaved={null} />);
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    // When save completes
    const lastSaved = new Date();
    rerender(<SaveIndicator isSaving={false} lastSaved={lastSaved} />);
    
    expect(screen.getByText('Progress saved')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<SaveIndicator isSaving={true} lastSaved={null} />);
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });
});