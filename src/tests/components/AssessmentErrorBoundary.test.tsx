import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssessmentErrorBoundary from '../../components/AssessmentErrorBoundary';
import { ErrorReporter } from '../../utils/errorReporting';
import { getAssessmentResponses, getAssessmentMetadata } from '../../utils/storage';
import { trackError, trackCTAClick } from '../../utils/analytics';

jest.mock('../../utils/errorReporting');
jest.mock('../../utils/storage');
jest.mock('../../utils/analytics');

const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe('AssessmentErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAssessmentResponses as jest.Mock).mockReturnValue({
      currentStage: 'pre-seed',
      responses: { 'q1': 3 }
    });
    (ErrorReporter.attemptRecovery as jest.Mock).mockResolvedValue(true);
  });

  it('renders children when no error occurs', () => {
    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <div>Test Content</div>
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows error UI when error occurs', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText(/Assessment Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Try to Recover/i)).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('tracks errors with context', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    expect(trackError).toHaveBeenCalledWith('assessment_error', expect.objectContaining({
      error: 'Test error',
      assessmentStage: 'pre-seed'
    }));
    
    consoleError.mockRestore();
  });

  it('attempts recovery when retry button clicked', async () => {
    const mockOnRecovery = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <AssessmentErrorBoundary onRecovery={mockOnRecovery}>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    const retryButton = screen.getByText(/Try to Recover/i);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(ErrorReporter.attemptRecovery).toHaveBeenCalled();
      expect(trackCTAClick).toHaveBeenCalledWith('assessment_recovery_success');
      expect(mockOnRecovery).toHaveBeenCalled();
    });
    
    consoleError.mockRestore();
  });

  it('shows data error message for storage-related errors', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="storage error occurred" />
      </AssessmentErrorBoundary>
    );

    expect(screen.queryByText(/Try to Recover/i)).not.toBeInTheDocument();
    expect(screen.getByText(/restart the assessment/i)).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('handles failed recovery attempts', async () => {
    (ErrorReporter.attemptRecovery as jest.Mock).mockResolvedValue(false);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    const retryButton = screen.getByText(/Try to Recover/i);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(trackCTAClick).toHaveBeenCalledWith('assessment_recovery_failed');
      expect(screen.getByText(/Due to a data issue/i)).toBeInTheDocument();
    });
    
    consoleError.mockRestore();
  });
});