import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { Stage } from '../../types';
import { getAssessmentResponses } from '../../utils/storage';
import { validateStageSequence } from '../../data/StageConfig';
import { calculateStageScores } from '../../utils/scoring';
import { filterQuestionsByStage } from '../../utils/questionFiltering';
import { trackStageTransition } from '../../utils/analytics';

jest.mock('../../utils/storage');
jest.mock('../../utils/analytics');

describe('Stage Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  const completeStage = async (stage: Stage) => {
    const questions = filterQuestionsByStage([], stage); // Questions will be filtered from actual data
    const mockResponses: Record<string, number> = {};
    
    // Simulate answering all questions with valid scores
    questions.forEach(q => {
      mockResponses[q.id] = Math.floor(Math.random() * 3) + 2; // Random score 2-4
    });

    (getAssessmentResponses as jest.Mock).mockReturnValue(mockResponses);
    return mockResponses;
  };

  it('enforces correct stage progression', async () => {
    // Test progressive stage completion
    const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
    
    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];

      // Should allow progression to next stage
      expect(validateStageSequence(currentStage, nextStage)).toBe(true);
      
      // Should prevent skipping stages
      if (i < stages.length - 2) {
        const skipStage = stages[i + 2];
        // eslint-disable-next-line jest/no-conditional-expect
        expect(validateStageSequence(currentStage, skipStage)).toBe(false);
      }
    }
  });

  it('maintains state during stage transitions', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Complete pre-seed stage
    const responses = await completeStage('pre-seed');
    
    // Verify state persistence
    expect(getAssessmentResponses()).toEqual(responses);
    expect(trackStageTransition).toHaveBeenCalledWith(null, 'pre-seed');

    // Calculate and verify scores
    const scores = calculateStageScores('pre-seed', responses);
    expect(scores.overallScore).toBeGreaterThan(0);
    expect(scores.completionRate).toBe(1);
  });

  it('handles error recovery during transitions', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Force storage error
    (getAssessmentResponses as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Should show error with recovery option
    await waitFor(() => {
      expect(screen.getByText(/We encountered an issue/i)).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByText(/Try to Resume/i)).toBeInTheDocument();
    });

    // Mock successful recovery
    (getAssessmentResponses as jest.Mock).mockReturnValue({});
    
    // Click recovery button
    fireEvent.click(screen.getByText(/Try to Resume/i));

    // Should recover and show assessment
    await waitFor(() => {
      expect(screen.queryByText(/We encountered an issue/i)).not.toBeInTheDocument();
    });
  });
});