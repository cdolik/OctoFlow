import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Summary from './Summary';
import { useStageValidation } from '../hooks/useStageValidation';
import { saveAssessmentResponses } from '../utils/storage';
import { trackCTAClick } from '../utils/analytics';
import { getStageQuestions } from '../data/categories';

jest.mock('../hooks/useStageValidation');
jest.mock('../utils/storage');
jest.mock('../utils/analytics');
jest.mock('../data/categories');

const mockQuestions = [
  {
    id: 'q1',
    text: 'Question 1',
    tooltipTerm: 'term1',
    options: [
      { value: 1, text: 'Option 1' },
      { value: 2, text: 'Option 2' },
      { value: 3, text: 'Option 3' }
    ]
  },
  {
    id: 'q2',
    text: 'Question 2',
    options: [
      { value: 1, text: 'Option 1' },
      { value: 2, text: 'Option 2' },
      { value: 3, text: 'Option 3' }
    ]
  }
];

describe('Summary', () => {
  const defaultProps = {
    stage: 'pre-seed' as const,
    responses: { q1: 2, q2: 3 },
    onStepChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getStageQuestions as jest.Mock).mockReturnValue(mockQuestions);
    (useStageValidation as jest.Mock).mockReturnValue({
      isValidating: false,
      error: null,
      canProgress: true
    });
  });

  it('renders all questions with responses', () => {
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getAllByText(/Your answer:/i)).toHaveLength(2);
  });

  it('allows editing responses', async () => {
    (saveAssessmentResponses as jest.Mock).mockResolvedValue(true);

    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );

    // Click edit on first question
    const editButtons = screen.getAllByText(/Edit Answer/i);
    fireEvent.click(editButtons[0]);

    // Select new answer
    const options = screen.getAllByRole('button');
    fireEvent.click(options[0]);

    await waitFor(() => {
      expect(saveAssessmentResponses).toHaveBeenCalledWith(
        expect.objectContaining({ q1: 1 }),
        'pre-seed'
      );
      expect(defaultProps.onStepChange).toHaveBeenCalled();
    });
  });

  it('shows validation errors', () => {
    (useStageValidation as jest.Mock).mockReturnValue({
      isValidating: false,
      error: 'Validation failed',
      canProgress: false
    });

    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Results/i })).toBeDisabled();
  });

  it('handles save errors during response edit', async () => {
    (saveAssessmentResponses as jest.Mock).mockResolvedValue(false);

    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText(/Edit Answer/i)[0]);
    fireEvent.click(screen.getAllByRole('button')[0]);

    await waitFor(() => {
      expect(screen.getByText(/Failed to save response changes/i)).toBeInTheDocument();
    });
  });

  it('tracks results view click', () => {
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/View Results/i));
    expect(trackCTAClick).toHaveBeenCalledWith('view_results');
  });

  it('renders tooltips for questions with tooltipTerms', () => {
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );

    const tooltipTriggers = screen.getAllByRole('button', { name: /info/i });
    expect(tooltipTriggers).toHaveLength(1); // Only q1 has tooltipTerm
  });

  it('disables results button while validating', () => {
    (useStageValidation as jest.Mock).mockReturnValue({
      isValidating: true,
      error: null,
      canProgress: true
    });

    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /View Results/i })).toBeDisabled();
  });
});