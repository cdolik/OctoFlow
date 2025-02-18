import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import AssessmentErrorBoundary from '../components/AssessmentErrorBoundary';
import { FLOW_STATES } from '../utils/flowValidator';
import { trackError } from '../utils/analytics';

jest.mock('../utils/analytics', () => ({
  trackError: jest.fn()
}));

describe('AssessmentErrorBoundary', () => {
  const ErrorComponent = () => {
    throw new Error('Test error');
  };

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('captures errors and provides recovery options', () => {
    const mockAssessmentState = {
      stage: 'pre-seed',
      currentState: FLOW_STATES.ASSESSMENT,
      responses: { 'test-question': 3 }
    };
    sessionStorage.setItem('octoflow', JSON.stringify(mockAssessmentState));

    render(
      <AssessmentErrorBoundary stage="pre-seed" currentQuestion="test-question">
        <ErrorComponent />
      </AssessmentErrorBoundary>
    );

    // Verify error message
    expect(screen.getByText(/We encountered an issue/i)).toBeInTheDocument();
    expect(screen.getByText(/Try to Resume/i)).toBeInTheDocument();

    // Verify error tracking
    expect(trackError).toHaveBeenCalledWith(
      'assessment_error',
      expect.objectContaining({
        assessmentState: mockAssessmentState,
        recoveryAttempts: 0
      })
    );
  });

  test('handles progressive recovery attempts', () => {
    const { rerender } = render(
      <AssessmentErrorBoundary>
        <ErrorComponent />
      </AssessmentErrorBoundary>
    );

    // First recovery attempt
    fireEvent.click(screen.getByText(/Try to Resume/i));
    rerender(
      <AssessmentErrorBoundary>
        <ErrorComponent />
      </AssessmentErrorBoundary>
    );

    // Second attempt should show restart option
    expect(screen.getByText(/Restart Assessment/i)).toBeInTheDocument();

    // Verify error tracking includes attempts
    expect(trackError).toHaveBeenCalledWith(
      'assessment_error',
      expect.objectContaining({
        recoveryAttempts: 1
      })
    );
  });

  test('preserves valid assessment state during recovery', () => {
    const mockState = {
      stage: 'pre-seed',
      responses: { 'question-1': 3 }
    };
    sessionStorage.setItem('octoflow', JSON.stringify(mockState));

    render(
      <AssessmentErrorBoundary>
        <ErrorComponent />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText(/Try to Resume/i));

    const storedState = JSON.parse(sessionStorage.getItem('octoflow'));
    expect(storedState.responses).toEqual(mockState.responses);
  });

  test('handles complete reset after multiple failures', () => {
    const { rerender } = render(
      <AssessmentErrorBoundary>
        <ErrorComponent />
      </AssessmentErrorBoundary>
    );

    // Simulate multiple recovery attempts
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole('button'));
      rerender(
        <AssessmentErrorBoundary>
          <ErrorComponent />
        </AssessmentErrorBoundary>
      );
    }

    // Verify reset behavior
    fireEvent.click(screen.getByText(/Restart Assessment/i));
    expect(sessionStorage.getItem('octoflow')).toContain(FLOW_STATES.STAGE_SELECT);
  });

  test('provides detailed error context in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <AssessmentErrorBoundary stage="pre-seed" currentQuestion="test-question">
        <ErrorComponent />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText(/Error Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessment Context/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});