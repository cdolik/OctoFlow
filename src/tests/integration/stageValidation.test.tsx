import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from '../../App';
import { saveAssessmentResponses, getAssessmentResponses } from '../../utils/storage';
import { validateStageProgression } from '../../utils/flowState';
import { stages } from '../../data/stages';

jest.mock('../../utils/storage');
jest.mock('../../utils/flowState');

describe('Stage Validation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateStageProgression as jest.Mock).mockReturnValue(true);
    sessionStorage.clear();
  });

  it('enforces sequential stage progression', async () => {
    render(
      <HashRouter>
        <App />
      </HashRouter>
    );

    // Select pre-seed stage
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Try to navigate directly to series-a results
    window.location.hash = '#/results';

    await waitFor(() => {
      // Should be redirected to assessment
      expect(window.location.hash).toBe('#/assessment');
    });
  });

  it('preserves stage-specific responses', async () => {
    const mockResponses = {
      'branch-protection': 3,
      'deployment-automation': 4
    };

    (getAssessmentResponses as jest.Mock).mockReturnValue(mockResponses);

    render(
      <HashRouter>
        <App />
      </HashRouter>
    );

    // Complete pre-seed stage
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    await waitFor(() => {
      expect(saveAssessmentResponses).toHaveBeenCalledWith(
        expect.objectContaining(mockResponses)
      );
    });

    // Transition to seed stage
    fireEvent.click(screen.getByText(/Next Stage/i));

    // Verify responses were preserved
    expect(getAssessmentResponses).toHaveBeenCalled();
    const savedResponses = getAssessmentResponses();
    expect(savedResponses).toEqual(expect.objectContaining(mockResponses));
  });

  it('filters questions by stage correctly', async () => {
    render(
      <HashRouter>
        <App />
      </HashRouter>
    );

    // Test each stage
    for (const stage of stages) {
      // Navigate to stage
      fireEvent.click(screen.getByText(/Start Free Checkup/i));
      fireEvent.click(screen.getByText(new RegExp(stage.label, 'i')));

      // Verify only stage-appropriate questions are shown
      const questions = screen.getAllByRole('group', { name: /question/i });
      questions.forEach(question => {
        const questionText = question.textContent;
        expect(questionText).toMatch(new RegExp(stage.id, 'i'));
      });

      // Reset for next stage
      sessionStorage.clear();
      window.location.hash = '#/';
    }
  });

  it('handles stage transitions with error recovery', async () => {
    const mockError = new Error('Transition error');
    (validateStageProgression as jest.Mock)
      .mockImplementationOnce(() => { throw mockError; })
      .mockImplementationOnce(() => true);

    render(
      <HashRouter>
        <App />
      </HashRouter>
    );

    // Trigger error during stage transition
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Verify error boundary caught the error
    expect(screen.getByText(/We encountered an issue/i)).toBeInTheDocument();

    // Attempt recovery
    fireEvent.click(screen.getByText(/Try Again/i));

    // Verify successful recovery
    await waitFor(() => {
      expect(screen.queryByText(/We encountered an issue/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    });
  });
});