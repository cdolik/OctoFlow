import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { KeyboardShortcutsProvider } from '../contexts/KeyboardShortcutsContext';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { trackCTAClick } from '../utils/analytics';
import Assessment from './Assessment';
import { useStageManager } from '../hooks/useStageManager';
import { useStorage } from '../hooks/useStorage';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { filterQuestionsByStage } from '../utils/questionFiltering';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { createMockState } from '../utils/testUtils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));
jest.mock('../hooks/useStageManager');
jest.mock('../hooks/useStorage');
jest.mock('../hooks/useErrorManagement');
jest.mock('../utils/questionFiltering');
jest.mock('../hooks/useAssessmentSession');
jest.mock('../utils/analytics');
jest.mock('../hooks/useKeyboardNavigation');

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
    currentStage: 'pre-seed',
    stage: 'pre-seed',
    progress: {
      questionIndex: 0,
      totalQuestions: 5,
      isComplete: false,
      lastUpdated: new Date().toISOString()
    }
  };

  const mockSaveResponse = jest.fn();
  const mockCompleteSession = jest.fn();
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
    (useAssessmentSession as jest.Mock).mockReturnValue({
      state: mockState,
      saveStatus: { status: 'saved', timestamp: Date.now() },
      saveResponse: mockSaveResponse,
      completeSession: mockCompleteSession,
      isLoading: false
    });
    (useKeyboardNavigation as jest.Mock).mockReturnValue({
      isEnabled: true
    });
  });

  const renderWithProviders = (stage = 'pre-seed') => {
    return render(
      <MemoryRouter initialEntries={[`/assessment/${stage}`]}>
        <KeyboardShortcutsProvider>
          <Routes>
            <Route path="/assessment/:stage" element={<Assessment />} />
          </Routes>
        </KeyboardShortcutsProvider>
      </MemoryRouter>
    );
  };

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

  it('handles keyboard navigation between questions', () => {
    renderWithProviders();

    // Next question
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(trackCTAClick).toHaveBeenCalledWith('next_question');

    // Previous question
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(trackCTAClick).toHaveBeenCalledWith('previous_question');
  });

  it('handles keyboard score selection', async () => {
    renderWithProviders();

    for (let score = 1; score <= 4; score++) {
      fireEvent.keyDown(document, { key: score.toString() });
      expect(mockSaveResponse).toHaveBeenCalledWith(0, score, 0);
    }
  });

  it('handles assessment completion with Enter key', async () => {
    const { container } = renderWithProviders();
    mockCompleteSession.mockResolvedValue(true);

    fireEvent.keyDown(document, { key: 'Enter' });

    await waitFor(() => {
      expect(mockCompleteSession).toHaveBeenCalled();
    });
  });

  it('shows keyboard shortcut helper when ? is pressed', () => {
    renderWithProviders();

    fireEvent.keyDown(document, { key: '?' });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('shows save indicator with correct status', () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      state: mockState,
      saveStatus: { status: 'saving' },
      saveResponse: mockSaveResponse,
      completeSession: mockCompleteSession,
      isLoading: false
    });

    renderWithProviders();

    expect(screen.getByText('Saving changes...')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      state: null,
      saveStatus: { status: 'saved', timestamp: Date.now() },
      saveResponse: mockSaveResponse,
      completeSession: mockCompleteSession,
      isLoading: true
    });

    renderWithProviders();

    expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
  });

  it('handles error state when assessment not found', () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      state: null,
      saveStatus: { status: 'saved', timestamp: Date.now() },
      saveResponse: mockSaveResponse,
      completeSession: mockCompleteSession,
      isLoading: false
    });

    renderWithProviders();

    expect(screen.getByText('Assessment not found')).toBeInTheDocument();
  });

  it('disables keyboard navigation at boundaries', () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      state: {
        ...mockState,
        progress: {
          ...mockState.progress,
          questionIndex: 0
        }
      },
      saveStatus: { status: 'saved', timestamp: Date.now() },
      saveResponse: mockSaveResponse,
      completeSession: mockCompleteSession,
      isLoading: false
    });

    renderWithProviders();

    // At first question, previous should be disabled
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(trackCTAClick).not.toHaveBeenCalled();

    // Move to last question
    (useAssessmentSession as jest.Mock).mockReturnValue({
      state: {
        ...mockState,
        progress: {
          ...mockState.progress,
          questionIndex: 4 // Last question
        }
      },
      saveStatus: { status: 'saved', timestamp: Date.now() },
      saveResponse: mockSaveResponse,
      completeSession: mockCompleteSession,
      isLoading: false
    });

    // At last question, next should be disabled
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(trackCTAClick).not.toHaveBeenCalledWith('next_question');
  });

  const mockOnStepChange = jest.fn();
  const mockOnComplete = jest.fn();

  it('renders loading state', () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      isLoading: true,
      state: null,
      error: null
    });

    render(<Assessment stage="pre-seed" />);
    expect(screen.getByText(/Loading assessment/)).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      isLoading: false,
      state: null,
      error: new Error('Test error')
    });

    render(<Assessment stage="pre-seed" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Test error');
  });

  it('handles navigation between questions', () => {
    render(
      <Assessment 
        stage="pre-seed" 
        onStepChange={mockOnStepChange}
      />
    );

    fireEvent.click(screen.getByText('Next'));
    expect(mockOnStepChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('Previous'));
    expect(mockOnStepChange).toHaveBeenCalledWith(-1);
  });

  it('shows keyboard shortcuts when enabled', () => {
    render(<Assessment stage="pre-seed" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts for pre-seed')).toBeInTheDocument();
  });

  it('shows correct save status', () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      ...useAssessmentSession(),
      saveStatus: { status: 'saving' }
    });

    render(<Assessment stage="pre-seed" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('completes session on last question', async () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      ...useAssessmentSession(),
      state: {
        ...createMockState({ currentStage: 'pre-seed' }),
        progress: {
          questionIndex: 9,
          totalQuestions: 10,
          isComplete: false
        }
      }
    });

    mockCompleteSession.mockResolvedValue(true);

    render(
      <Assessment 
        stage="pre-seed" 
        onComplete={mockOnComplete}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Complete'));
    });

    expect(mockCompleteSession).toHaveBeenCalled();
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('shows progress percentage', () => {
    render(<Assessment stage="pre-seed" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveTextContent('0% Complete');
  });

  it('prevents navigation when at boundaries', () => {
    (useAssessmentSession as jest.Mock).mockReturnValue({
      ...useAssessmentSession(),
      state: {
        ...createMockState({ currentStage: 'pre-seed' }),
        progress: {
          questionIndex: 0,
          totalQuestions: 10,
          isComplete: false
        }
      }
    });

    render(<Assessment stage="pre-seed" />);
    expect(screen.getByText('Previous')).toBeDisabled();
  });

  it('prevents progression when score is below threshold', async () => {
    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

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
  });

  it('allows progression when score meets threshold', async () => {
    render(
      <MemoryRouter>
        <Assessment stage="pre-seed" />
      </MemoryRouter>
    );

    // Answer questions with high scores
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
      fireEvent.click(options[3]); // Select fourth option (high score)
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    // Verify summary allows progression
    const summaryButton = screen.getByText(/Summary/i);
    fireEvent.click(summaryButton);
    
    // Should not show error
    expect(screen.queryByText(/Your score is below the required threshold to proceed./i)).not.toBeInTheDocument();
    
    // Should allow navigation to results
    const resultsButton = screen.getByText(/View Results/i);
    expect(resultsButton).not.toBeDisabled();
  });
});
