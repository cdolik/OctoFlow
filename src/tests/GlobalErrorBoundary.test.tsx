import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';

describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const ThrowError = ({ message }: { message: string }) => {
    throw new Error(message);
  };

  it('renders children when there is no error', () => {
    render(
      <GlobalErrorBoundary>
        <div>Test Content</div>
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows error UI when an error occurs', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError message="Test error" />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset application/i })).toBeInTheDocument();
  });

  it('clears storage and resets when reset button is clicked', async () => {
    const mockClear = jest.spyOn(window.localStorage, 'clear');
    const mockReload = jest.spyOn(window.location, 'reload').mockImplementation(() => {});

    render(
      <GlobalErrorBoundary>
        <ThrowError message="Test error" />
      </GlobalErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /reset application/i }));

    expect(mockClear).toHaveBeenCalled();
    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });

    mockReload.mockRestore();
  });

  it('handles critical errors appropriately', () => {
    const criticalError = new Error('QuotaExceededError: Storage full');
    
    render(
      <GlobalErrorBoundary>
        <ThrowError message={criticalError.message} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/please try refreshing/i)).toBeInTheDocument();
  });
});