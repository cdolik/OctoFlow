import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssessmentErrorBoundary from '../AssessmentErrorBoundary';
import { ErrorScenarioFactory } from '../../tests/factories/errorScenarioFactory';
import { cleanupAfterTest } from '../../tests/utils/cleanup';

describe('AssessmentErrorBoundary Accessibility', () => {
  const ThrowError = ({ message }: { message: string }) => {
    throw new Error(message);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupAfterTest();
  });

  it('maintains focus management during error states', async () => {
    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    // First interactive element should receive focus
    expect(screen.getByText(/try to recover/i)).toHaveFocus();
  });

  it('provides error announcements via ARIA', async () => {
    const error = ErrorScenarioFactory.storage();
    
    render(
      <AssessmentErrorBoundary>
        <ThrowError message={error.message} />
      </AssessmentErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveTextContent(error.message);
  });

  it('supports keyboard navigation through error UI', async () => {
    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    const recoveryButton = screen.getByText(/try to recover/i);
    const startFreshButton = screen.getByText(/start fresh/i);

    // Tab navigation
    userEvent.tab();
    expect(recoveryButton).toHaveFocus();

    userEvent.tab();
    expect(startFreshButton).toHaveFocus();

    // Enter key activation
    userEvent.keyboard('{Enter}');
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('provides progress updates during recovery', async () => {
    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText(/try to recover/i));

    await waitFor(() => {
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveTextContent(/attempting to recover/i);
    });
  });
});