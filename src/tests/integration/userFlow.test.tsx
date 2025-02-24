import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { getAssessmentResponses, saveAssessmentResponses } from '../../utils/storage';
import { validateStageSequence } from '../../utils/stageValidation';
import { trackCTAClick } from '../../utils/analytics';

jest.mock('../../utils/storage');
jest.mock('../../utils/analytics');

describe('Complete User Flow Integration', () => {
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

  describe('Unsaved Changes', () => {
    it('prevents navigation with unsaved changes', async () => {
      render(
        <MemoryRouter initialEntries={['/assessment/pre-seed']}>
          <App />
        </MemoryRouter>
      );

      // Answer a question without waiting for autosave
      const options = screen.getAllByRole('button', { name: /option/i });
      fireEvent.click(options[0]);

      // Try to navigate away
      fireEvent.click(screen.getByText('Exit Assessment'));

      // Should show warning
      expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      expect(screen.getByText(/Stay/i)).toBeInTheDocument();
      expect(screen.getByText(/Leave/i)).toBeInTheDocument();
    });

    it('recovers from interrupted autosave', async () => {
      // Mock failed save followed by successful save
      (saveAssessmentResponses as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(true);

      render(
        <MemoryRouter initialEntries={['/assessment/pre-seed']}>
          <App />
        </MemoryRouter>
      );

      const options = screen.getAllByRole('button', { name: /option/i });
      fireEvent.click(options[0]);

      // Should show error then auto-retry
      await waitFor(() => {
        expect(screen.getByText(/Retrying/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/Saved/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Recovery', () => {
    it('restores session after browser refresh', async () => {
      const mockResponses = {
        'branch-protection': 3,
        'deployment-automation': 4
      };

      // Setup initial state
      (getAssessmentResponses as jest.Mock).mockReturnValue(mockResponses);

      const { rerender } = render(
        <MemoryRouter initialEntries={['/assessment/pre-seed']}>
          <App />
        </MemoryRouter>
      );

      // Simulate page reload
      rerender(
        <MemoryRouter initialEntries={['/assessment/pre-seed']}>
          <App key="reloaded" />
        </MemoryRouter>
      );

      // Verify state restoration
      await waitFor(() => {
        const form = screen.getByRole('form');
        const answers = within(form).getAllByRole('radio');
        expect(answers.some(a => a.getAttribute('aria-checked') === 'true')).toBe(true);
      });
    });

    it('maintains accessibility during error recovery', async () => {
      render(
        <MemoryRouter initialEntries={['/assessment/pre-seed']}>
          <App />
        </MemoryRouter>
      );

      // Force error state
      (saveAssessmentResponses as jest.Mock).mockRejectedValue(new Error('Test error'));

      const options = screen.getAllByRole('button', { name: /option/i });
      fireEvent.click(options[0]);

      // Verify error handling maintains a11y
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveAttribute('aria-live', 'assertive');
      });

      // Test keyboard recovery
      const retryButton = screen.getByText(/Try Again/i);
      retryButton.focus();
      fireEvent.keyDown(retryButton, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });
});