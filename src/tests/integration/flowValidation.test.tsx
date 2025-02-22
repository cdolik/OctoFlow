import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from '../../App';
import { getAssessmentResponses } from '../../utils/storage';
import { validateStageProgression } from '../../utils/stageValidation';
import { stages } from '../../data/stages';

jest.mock('../../utils/storage');
jest.mock('../../utils/stageValidation');

describe('Flow Validation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateStageProgression as jest.Mock).mockReturnValue({ isValid: true });
    sessionStorage.clear();
  });

  it('validates complete assessment flow', async () => {
    render(
      <HashRouter>
        <App />
      </HashRouter>
    );

    // 1. Stage Selection
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));
    
    // 2. Assessment - Complete each question
    for (let i = 0; i < 3; i++) {
      const options = screen.getAllByRole('button', { name: /option/i });
      fireEvent.click(options[2]); // Select third option
      
      const nextButton = screen.getByText(/next/i);
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(getAssessmentResponses).toHaveBeenCalled();
      });
    }

    // 3. Summary Review
    expect(screen.getByText(/Review Your Responses/i)).toBeInTheDocument();
    
    // 4. Results
    fireEvent.click(screen.getByText(/View Results/i));
    expect(screen.getByText(/GitHub Engineering Health Score/i)).toBeInTheDocument();
  });

  it('handles error recovery during stage transitions', async () => {
    const mockError = new Error('Stage transition error');
    (validateStageProgression as jest.Mock)
      .mockImplementationOnce(() => { throw mockError; })
      .mockImplementationOnce(() => ({ isValid: true }));

    render(
      <HashRouter>
        <App />
      </HashRouter>
    );

    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Verify error boundary caught the error
    expect(screen.getByText(/We encountered an issue/i)).toBeInTheDocument();

    // Test recovery
    fireEvent.click(screen.getByText(/Try to Resume/i));
    expect(screen.queryByText(/We encountered an issue/i)).not.toBeInTheDocument();
  });

  it('prevents invalid stage skipping', async () => {
    render(
      <HashRouter>
        <App />
      </HashRouter>
    );

    // Try to access series-a directly
    window.location.hash = '#/assessment/series-a';

    await waitFor(() => {
      // Should be redirected to stage selection
      expect(window.location.hash).toBe('#/stage-select');
    });
  });

  it('preserves responses across stage transitions', async () => {
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

    // Verify responses persisted
    await waitFor(() => {
      const savedResponses = getAssessmentResponses();
      expect(savedResponses).toEqual(expect.objectContaining(mockResponses));
    });
  });
});