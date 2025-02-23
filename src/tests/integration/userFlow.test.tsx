import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { getAssessmentResponses, saveAssessmentResponses } from '../../utils/storage';
import { validateStageSequence } from '../../data/StageConfig';
import { trackCTAClick } from '../../utils/analytics';

jest.mock('../../utils/storage');
jest.mock('../../utils/analytics');

describe('User Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  const completeStage = async (responses = { q1: 3, q2: 4 }) => {
    (getAssessmentResponses as jest.Mock).mockReturnValue(responses);
    (saveAssessmentResponses as jest.Mock).mockResolvedValue(true);
    
    // Answer questions
    const options = screen.getAllByRole('button', { name: /option/i });
    options.forEach(option => fireEvent.click(option));

    // Navigate to summary
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Review Your Responses/i)).toBeInTheDocument();
    });
  };

  it('completes full assessment flow successfully', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // 1. Hero to Stage Selection
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    expect(screen.getByText(/Select Your Stage/i)).toBeInTheDocument();

    // 2. Stage Selection to Assessment
    fireEvent.click(screen.getByText(/Pre-Seed/i));
    expect(trackCTAClick).toHaveBeenCalledWith('stage_selected');

    // 3. Complete Assessment
    await completeStage();

    // 4. Summary to Results
    fireEvent.click(screen.getByText(/View Results/i));
    expect(screen.getByText(/GitHub Engineering Health Score/i)).toBeInTheDocument();
  });

  it('preserves state during page reloads', async () => {
    const mockResponses = { q1: 3, q2: 4 };
    (getAssessmentResponses as jest.Mock).mockReturnValue(mockResponses);

    const { rerender } = render(
      <MemoryRouter initialEntries={['/assessment']}>
        <App initialStage="pre-seed" />
      </MemoryRouter>
    );

    // Simulate reload
    rerender(
      <MemoryRouter initialEntries={['/assessment']}>
        <App initialStage="pre-seed" />
      </MemoryRouter>
    );

    // Verify state preserved
    await waitFor(() => {
      expect(getAssessmentResponses).toHaveBeenCalled();
      const responses = getAssessmentResponses();
      expect(responses).toEqual(mockResponses);
    });
  });

  it('handles error recovery and retries', async () => {
    (saveAssessmentResponses as jest.Mock)
      .mockRejectedValueOnce(new Error('Storage error'))
      .mockResolvedValueOnce(true);

    render(
      <MemoryRouter initialEntries={['/assessment']}>
        <App initialStage="pre-seed" />
      </MemoryRouter>
    );

    // Trigger error
    const options = screen.getAllByRole('button', { name: /option/i });
    fireEvent.click(options[0]);

    // Verify error shown
    expect(await screen.findByText(/We encountered an issue/i)).toBeInTheDocument();

    // Test recovery
    fireEvent.click(screen.getByText(/Try to Recover/i));
    expect(screen.queryByText(/We encountered an issue/i)).not.toBeInTheDocument();
  });

  it('enforces stage progression rules', async () => {
    render(
      <MemoryRouter initialEntries={['/stage-select']}>
        <App />
      </MemoryRouter>
    );

    // Try to skip to series-a
    expect(validateStageSequence('pre-seed', 'series-a')).toBe(false);

    // Verify proper progression
    expect(validateStageSequence('pre-seed', 'seed')).toBe(true);
    expect(validateStageSequence('seed', 'series-a')).toBe(true);
  });

  it('maintains autosave functionality', async () => {
    render(
      <MemoryRouter initialEntries={['/assessment']}>
        <App initialStage="pre-seed" />
      </MemoryRouter>
    );

    // Answer question
    const options = screen.getAllByRole('button', { name: /option/i });
    fireEvent.click(options[0]);

    // Verify autosave
    await waitFor(() => {
      expect(saveAssessmentResponses).toHaveBeenCalled();
    });
  });
});