import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssessmentErrorBoundary from '../components/AssessmentErrorBoundary';
import { ErrorReporter } from '../utils/errorReporting';
import { trackCTAClick, trackError } from '../utils/analytics';
import { clearAssessmentData } from '../utils/storage';

// Mock dependencies
jest.mock('../utils/analytics', () => ({
  trackCTAClick: jest.fn(),
  trackError: jest.fn()
}));

jest.mock('../utils/storage', () => ({
  clearAssessmentData: jest.fn()
}));

jest.mock('../utils/assessmentState', () => ({
  getAssessmentState: jest.fn()
}));

const { getAssessmentState } = jest.requireMock('../utils/assessmentState');

jest.mock('../utils/errorReporting', () => ({
  ErrorReporter: {
    report: jest.fn(),
    attemptRecovery: jest.fn()
  }
}));

describe('AssessmentErrorBoundary', () => {
  const ThrowError = ({ message }: { message: string }) => {
    throw new Error(message);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAssessmentState as jest.Mock).mockReturnValue({
      currentStage: 'seed',
      responses: { 'pre-seed': { complete: true } }
    });
  });

  it('renders children when there is no error', () => {
    render(
      <AssessmentErrorBoundary>
        <div>Test Content</div>
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows error UI when an error occurs', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* intentionally left empty */ });
    
    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText('Assessment Error')).toBeInTheDocument();
    expect(trackError).toHaveBeenCalledWith('assessment_error', expect.any(Object));
    
    consoleError.mockRestore();
  });

  it('handles retry action correctly', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* intentionally left empty */ });
    
    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try Again'));
    expect(trackCTAClick).toHaveBeenCalledWith('assessment_retry');
    
    consoleError.mockRestore();
  });

  it('handles reset action correctly', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* intentionally left empty */ });
    
    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Restart Assessment'));
    expect(clearAssessmentData).toHaveBeenCalled();
    expect(trackCTAClick).toHaveBeenCalledWith('assessment_reset');
    
    consoleError.mockRestore();
  });

  it('shows data corruption message for storage-related errors', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* intentionally left empty */ });
    
    render(
      <AssessmentErrorBoundary>
        <ThrowError message="storage corrupted" />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText(/due to a data issue/i)).toBeInTheDocument();
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('shows loading state during recovery attempt', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* intentionally left empty */ });
    (ErrorReporter.attemptRecovery as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));

    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try to Recover'));
    
    expect(screen.getByText('Attempting to recover...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('restores normal state after successful recovery', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* intentionally left empty */ });
    (ErrorReporter.attemptRecovery as jest.Mock).mockResolvedValue(true);

    const TestComponent = () => <div>Recovered Content</div>;

    const { rerender } = render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try to Recover'));

    rerender(
      <AssessmentErrorBoundary>
        <TestComponent />
      </AssessmentErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Recovered Content')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  it('shows reload button when recovery fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* intentionally left empty */ });
    (ErrorReporter.attemptRecovery as jest.Mock).mockResolvedValue(false);

    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try to Recover'));

    await waitFor(() => {
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  it('reports errors with component stack', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { /* intentionally left empty */ });
    
    render(
      <AssessmentErrorBoundary>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    expect(ErrorReporter.report).toHaveBeenCalledWith(
      expect.any(Error),
      expect.stringContaining('ThrowError')
    );

    consoleError.mockRestore();
  });
});