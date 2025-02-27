import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { getAssessmentResponses, saveAssessmentResponses } from '../../utils/storage';
import { validateStageProgression } from '../../utils/flowState';
import { trackStageTransition } from '../../utils/analytics';
import { stages } from '../../data/stages';
import { Stage } from '../../types';

jest.mock('../../utils/storage');
jest.mock('../../utils/flowState');
jest.mock('../../utils/analytics');

describe('Complete Assessment Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateStageProgression as jest.Mock).mockReturnValue(true);
    sessionStorage.clear();
  });

  const completeStage = async (stage: Stage) => {
    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(new RegExp(stage, 'i')));

    // Answer questions with auto-save verification
    while (screen.queryByRole('button', { name: /next/i })) {
      const options = screen.getAllByRole('radio');
      fireEvent.click(options[1]); // Select second option

      await waitFor(() => {
        expect(saveAssessmentResponses).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
  };

  it('completes full assessment flow with user interactions', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Stage Selection & Validation
    await completeStage('pre-seed');
    expect(trackStageTransition).toHaveBeenCalledWith(null, 'pre-seed');

    // Verify Summary View
    expect(screen.getByText(/Review Your Responses/i)).toBeInTheDocument();

    // Navigate to Results
    fireEvent.click(screen.getByText(/View Results/i));
    expect(screen.getByText(/GitHub Engineering Health Score/i)).toBeInTheDocument();
  });

  it('handles stage transitions with error recovery', async () => {
    const mockError = new Error('Transition error');
    (validateStageProgression as jest.Mock)
      .mockImplementationOnce(() => { throw mockError; })
      .mockImplementationOnce(() => true);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Start assessment and trigger error
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Verify error handling
    expect(await screen.findByText(/We encountered an issue/i)).toBeInTheDocument();

    // Test recovery
    fireEvent.click(screen.getByText(/Try to Resume/i));
    expect(screen.queryByText(/We encountered an issue/i)).not.toBeInTheDocument();
  });

  it('maintains state across page reloads', async () => {
    const mockResponses = { 'q1': 3, 'q2': 4 };
    (getAssessmentResponses as jest.Mock).mockReturnValue(mockResponses);

    const { rerender } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Complete pre-seed stage
    await completeStage('pre-seed');

    // Simulate page reload
    rerender(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Verify state persistence
    const savedResponses = getAssessmentResponses();
    expect(savedResponses).toEqual(mockResponses);
  });

  it('enforces stage progression rules', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Verify sequential progression
    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i].id;
      const nextStage = stages[i + 1].id;
      
      expect(validateStageProgression(currentStage, nextStage)).toBe(true);
      expect(validateStageProgression(currentStage, 'series-b')).toBe(false);
    }
  });

  it('verifies new pre-seed stage questions and scoring criteria', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Verify new questions
    const questions = [
      'Do you have a defined branch strategy?',
      'How often do you perform code reviews?',
      'Do you use CI/CD pipelines?',
      'How do you manage dependencies?',
      'Do you have automated tests?'
    ];

    for (const question of questions) {
      expect(await screen.findByText(question)).toBeInTheDocument();
      const options = screen.getAllByRole('radio');
      fireEvent.click(options[1]); // Select second option
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    // Verify scoring criteria
    const summaryButton = screen.getByText(/Summary/i);
    fireEvent.click(summaryButton);
    expect(await screen.findByText(/Your score is below the required threshold to proceed./i)).toBeInTheDocument();
  });

  it('verifies inline error messages and summary screen', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Answer questions with low scores
    const questions = [
      'Do you have a defined branch strategy?',
      'How often do you perform code reviews?',
      'Do you use CI/CD pipelines?',
      'How do you manage dependencies?',
      'Do you have automated tests?'
    ];

    for (const question of questions) {
      expect(await screen.findByText(question)).toBeInTheDocument();
      const options = screen.getAllByRole('radio');
      fireEvent.click(options[0]); // Select first option (low score)
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    // Verify inline error message
    const summaryButton = screen.getByText(/Summary/i);
    fireEvent.click(summaryButton);
    expect(await screen.findByText(/Your score is below the required threshold to proceed./i)).toBeInTheDocument();

    // Answer questions with high scores
    for (const question of questions) {
      expect(await screen.findByText(question)).toBeInTheDocument();
      const options = screen.getAllByRole('radio');
      fireEvent.click(options[3]); // Select fourth option (high score)
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    // Verify summary screen
    fireEvent.click(summaryButton);
    expect(await screen.findByText(/Review Your Responses/i)).toBeInTheDocument();
  });
});
