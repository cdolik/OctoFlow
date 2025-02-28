import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssessmentErrorBoundary from '../AssessmentErrorBoundary';
import { ErrorScenarioFactory } from '../../tests/factories/errorScenarioFactory';
import { cleanupAfterTest } from '../../tests/utils/cleanup';
import { ErrorReporter } from '../../utils/errorReporting';
import { trackError } from '../../utils/analytics';

jest.mock('../../utils/errorReporting');
jest.mock('../../utils/analytics');

describe('AssessmentErrorBoundary Recovery', () => {
  const ThrowError = ({ message }: { message: string }) => {
    throw new Error(message);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupAfterTest();
  });

  it('attempts recovery for recoverable errors', async () => {
    const error = ErrorScenarioFactory.storage();
    (ErrorReporter.attemptRecovery as jest.Mock).mockResolvedValue(true);

    render(
      <AssessmentErrorBoundary>
        <ThrowError message={error.message} />
      </AssessmentErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText(/trying to recover/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/try to recover/i));

    await waitFor(() => {
      expect(ErrorReporter.attemptRecovery).toHaveBeenCalled();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it('shows permanent error UI for unrecoverable errors', async () => {
    const error = ErrorScenarioFactory.critical();
    
    render(
      <AssessmentErrorBoundary>
        <ThrowError message={error.message} />
      </AssessmentErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText(/start fresh/i)).toBeInTheDocument();
      expect(screen.queryByText(/try to recover/i)).not.toBeInTheDocument();
    });
  });

  it('handles failed recovery attempts', async () => {
    const error = ErrorScenarioFactory.storage();
    (ErrorReporter.attemptRecovery as jest.Mock).mockResolvedValue(false);

    render(
      <AssessmentErrorBoundary>
        <ThrowError message={error.message} />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText(/try to recover/i));

    await waitFor(() => {
      expect(screen.getByText(/unable to recover/i)).toBeInTheDocument();
      expect(trackError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          action: 'recovery_failed'
        })
      );
    });
  });
});