import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Assessment from './Assessment';
import { useStageManager } from '../hooks/useStageManager';
import { useStorage } from '../hooks/useStorage';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { filterQuestionsByStage } from '../utils/questionFiltering';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));
jest.mock('../hooks/useStageManager');
jest.mock('../hooks/useStorage');
jest.mock('../hooks/useErrorManagement');
jest.mock('../utils/questionFiltering');

describe('Assessment', () => {
  const mockQuestions = [
    {
      id: 'q1',
      text: 'Question 1',
      options: [
        { value: 1, text: 'Option 1' },
        { value: 2, text: 'Option 2' }
      ]
    },
    {
      id: 'q2',
      text: 'Question 2',
      options: [
        { value: 1, text: 'Option 1' },
        { value: 2, text: 'Option 2' }
      ]
    }
  ];

  const mockState = {
    responses: {},
    currentStage: 'pre-seed'
  };

  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(navigate);
    (filterQuestionsByStage as jest.Mock).mockReturnValue(mockQuestions);
    (useStageManager as jest.Mock).mockReturnValue({
      isTransitioning: false,
      error: null,
      transition: jest.fn()
    });
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockResolvedValue(true),
      isLoading: false
    });
    (useErrorManagement as jest.Mock).mockReturnValue({
      handleError: jest.fn(),
      activeErrorCount: 0,
      isHandlingError: false
    });
  });

  it('renders questions and handles responses', async () => {
    const onStepChange = jest.fn();
    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" onStepChange={onStepChange} />
      </MemoryRouter>
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();

    const firstOption = screen.getAllByRole('radio')[0];
    fireEvent.click(firstOption);

    await waitFor(() => {
      const storage = (useStorage as jest.Mock).mock.results[0].value;
      expect(storage.saveState).toHaveBeenCalled();
      expect(onStepChange).toHaveBeenCalled();
    });
  });

  it('handles keyboard navigation', () => {
    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    // Simulate arrow key navigation
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Question 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('handles numeric shortcuts for answers', async () => {
    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    fireEvent.keyDown(window, { key: '1' });

    await waitFor(() => {
      const storage = (useStorage as jest.Mock).mock.results[0].value;
      expect(storage.saveState).toHaveBeenCalledWith(expect.objectContaining({
        responses: expect.objectContaining({
          q1: 1
        })
      }));
    });
  });

  it('shows loading state', () => {
    (useStorage as jest.Mock).mockReturnValue({
      ...mockState,
      isLoading: true
    });

    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles errors gracefully', () => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      handleError: jest.fn(),
      activeErrorCount: 1,
      isHandlingError: false
    });

    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    expect(screen.getByText(/Assessment error/i)).toBeInTheDocument();
  });

  it('maintains proper aria attributes', () => {
    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-labelledby', 'question-title');
  });

  it('disables interaction during transitions', () => {
    (useStageManager as jest.Mock).mockReturnValue({
      isTransitioning: true,
      error: null,
      transition: jest.fn()
    });

    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    const options = screen.getAllByRole('radio');
    options.forEach(option => {
      expect(option).toBeDisabled();
    });
  });

  it('shows keyboard shortcuts help', () => {
    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    expect(screen.getByText(/Keyboard Shortcuts/i)).toBeInTheDocument();
    expect(screen.getByText(/Select first option/i)).toBeInTheDocument();
  });

  it('navigates to summary on completion', async () => {
    const { transition } = (useStageManager as jest.Mock).mock.results[0].value;

    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    // Answer last question
    const lastOption = screen.getAllByRole('radio')[0];
    fireEvent.click(lastOption);

    await waitFor(() => {
      expect(transition).toHaveBeenCalledWith('summary');
    });
  });
});