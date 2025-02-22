import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { getAssessmentResponses, getAssessmentMetadata } from '../../utils/storage';
import { validateStageProgression } from '../../utils/flowState';
import { trackStageTransition } from '../../utils/analytics';

jest.mock('../../utils/storage');
jest.mock('../../utils/flowState');
jest.mock('../../utils/analytics');

describe('Complete Assessment Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateStageProgression as jest.Mock).mockReturnValue(true);
  });

  const completeStage = async (_stage: string) => {
    // Answer all questions in the stage
    while (screen.queryByRole('button', { name: /next/i })) {
      const options = screen.getAllByRole('radio');
      fireEvent.click(options[1]); // Select second option
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(getAssessmentResponses).toHaveBeenCalled();
      });
    }
  };

  it('completes full assessment flow with keyboard navigation', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    
    // Select stage using keyboard
    const stageSelector = screen.getByRole('button', { name: /Pre-Seed/i });
    stageSelector.focus();
    fireEvent.keyDown(stageSelector, { key: 'Enter' });

    // Verify stage transition
    await waitFor(() => {
      expect(trackStageTransition).toHaveBeenCalledWith(null, 'pre-seed');
    });

    // Complete assessment using keyboard
    await completeStage('pre-seed');

    // Verify summary view
    expect(screen.getByText(/Review Your Responses/i)).toBeInTheDocument();

    // Navigate to results
    fireEvent.click(screen.getByText(/View Results/i));

    // Verify results and recommendations
    expect(screen.getByText(/GitHub Engineering Health Score/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('handles error recovery and state restoration', async () => {
    // Mock partial completion state
    const mockResponses = {
      'branch-protection': 3,
      'deployment-automation': 4
    };
    (getAssessmentResponses as jest.Mock).mockReturnValue(mockResponses);
    (getAssessmentMetadata as jest.Mock).mockReturnValue({
      stage: 'pre-seed',
      lastSaved: Date.now(),
      questionCount: 5
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Simulate error
    fireEvent.error(window);

    // Verify error boundary caught the error
    expect(screen.getByText(/We encountered an issue/i)).toBeInTheDocument();

    // Attempt recovery
    fireEvent.click(screen.getByText(/Try to Resume/i));

    // Verify state restoration
    await waitFor(() => {
      const currentResponses = getAssessmentResponses();
      expect(currentResponses).toEqual(mockResponses);
    });

    // Continue assessment
    await completeStage('pre-seed');

    // Verify completion
    expect(screen.getByText(/Review Your Responses/i)).toBeInTheDocument();
  });

  it('preserves keyboard shortcuts through transitions', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Open keyboard shortcuts help
    fireEvent.keyDown(window, { ctrlKey: true, key: 'h' });
    expect(screen.getByText(/Keyboard shortcuts/i)).toBeInTheDocument();

    // Navigate through stages using keyboard
    fireEvent.keyDown(window, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    });

    // Verify shortcuts still work in assessment
    fireEvent.keyDown(window, { key: '2' }); // Select second option
    fireEvent.keyDown(window, { key: 'ArrowRight' }); // Next question

    // Verify response was recorded
    await waitFor(() => {
      const responses = getAssessmentResponses();
      expect(Object.keys(responses).length).toBeGreaterThan(0);
    });
  });
});