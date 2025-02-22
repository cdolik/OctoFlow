import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { getAssessmentResponses, getAssessmentMetadata } from '../../utils/storage';
import { ErrorReporter } from '../../utils/errorReporting';

jest.mock('../../utils/errorReporting');
jest.mock('../../utils/storage');

describe('State Preservation Integration', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('preserves state through the entire assessment flow', async () => {
    // Mock initial stage
    (getAssessmentMetadata as jest.Mock).mockReturnValue({ stage: 'pre-seed' });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Stage selection
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Answer first question
    const options = screen.getAllByRole('button', { name: /option/i });
    fireEvent.click(options[2]);

    // Simulate page reload
    const savedResponses = getAssessmentResponses();

    // Re-render app
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Verify state restoration
    await waitFor(() => {
      expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
      const selectedOption = screen.getByRole('radio', { checked: true });
      expect(selectedOption).toBeInTheDocument();
    });
  });

  it('recovers from errors while preserving stage context', async () => {
    // Start with pre-existing responses
    const mockResponses = {
      'branch-protection': 3,
      'deployment-automation': 4
    };
    (getAssessmentResponses as jest.Mock).mockReturnValue(mockResponses);
    (ErrorReporter.attemptRecovery as jest.Mock).mockResolvedValue(true);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Simulate error
    fireEvent.error(window);

    // Verify error display
    expect(screen.getByText(/We encountered an issue/i)).toBeInTheDocument();

    // Attempt recovery
    fireEvent.click(screen.getByText(/Try to Resume/i));

    // Verify state preservation
    await waitFor(() => {
      const currentResponses = getAssessmentResponses();
      expect(currentResponses).toEqual(mockResponses);
    });
  });
});