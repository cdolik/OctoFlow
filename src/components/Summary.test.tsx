import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Summary from './Summary';
import { useStageValidation } from '../hooks/useStageValidation';
import { saveAssessmentResponses, saveMetricsAndRecommendations } from '../utils/storage';
import { trackCTAClick } from '../utils/analytics';
import { getStageQuestions } from '../data/categories';
import { calculateStageScores } from '../utils/scoring';
import { generateRecommendations } from '../utils/recommendations';

jest.mock('../hooks/useStageValidation');
jest.mock('../utils/storage');
jest.mock('../utils/analytics');
jest.mock('../data/categories');
jest.mock('../utils/scoring');
jest.mock('../utils/recommendations');

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

const mockScores = {
  overallScore: 65,
  categoryScores: {
    'github-ecosystem': 3.5,
    'security': 2.8,
    'automation': 3.2
  },
  level: 'Medium'
};

const mockRecommendations = [
  {
    id: 'rec-1',
    title: 'Enable Branch Protection',
    description: 'Set up branch protection rules for your main branch',
    effort: 'Low',
    impact: 8,
    category: 'security',
    stage: 'pre-seed'
  },
  {
    id: 'rec-2',
    title: 'Implement CI/CD Pipelines',
    description: 'Set up GitHub Actions workflows for automated testing',
    effort: 'Medium',
    impact: 9,
    category: 'automation',
    stage: 'pre-seed'
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
    (calculateStageScores as jest.Mock).mockReturnValue(mockScores);
    (generateRecommendations as jest.Mock).mockReturnValue(mockRecommendations);
    (useStageValidation as jest.Mock).mockReturnValue({
      isValidating: false,
      error: null,
      canProgress: true
    });
    (saveMetricsAndRecommendations as jest.Mock).mockResolvedValue(true);
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
      expect(saveAssessmentResponses).toHaveBeenCalled();
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
    expect(screen.getByRole('button', { name: /Proceed to Next Stage/i })).toBeDisabled();
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
    fireEvent.click(screen.getByRole('button', { name: /Proceed to Next Stage/i }));
    expect(trackCTAClick).toHaveBeenCalledWith('view_results');
  });

  it('renders tooltips for questions with tooltipTerms', () => {
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );
    const tooltipTrigger = screen.getByRole('button', { name: /more info/i });
    expect(tooltipTrigger).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: /Proceed to Next Stage/i })).toBeDisabled();
  });

  it('displays accumulated metrics correctly', async () => {
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );
    
    // Check that metrics are displayed
    expect(screen.getByText(/Completion Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Response Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Score/i)).toBeInTheDocument();
    
    // Check that the values are displayed
    await waitFor(() => {
      // Look for the value, considering it might be in different formats like "65.0" or "65"
      expect(screen.getByText(/65/)).toBeInTheDocument();
    });
  });

  it('displays tailored recommendations based on scores', async () => {
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );
    
    // Check recommendation section exists
    expect(screen.getByText(/Tailored GitHub Recommendations/i)).toBeInTheDocument();
    
    // Verify the recommendations are displayed
    await waitFor(() => {
      expect(screen.getByText('Enable Branch Protection')).toBeInTheDocument();
      expect(screen.getByText('Implement CI/CD Pipelines')).toBeInTheDocument();
    });
    
    // Check that effort and impact information is shown
    expect(screen.getByText(/Effort: Low/i)).toBeInTheDocument();
    expect(screen.getByText(/Effort: Medium/i)).toBeInTheDocument();
    expect(screen.getByText(/Impact: 8\/10/i)).toBeInTheDocument();
    expect(screen.getByText(/Impact: 9\/10/i)).toBeInTheDocument();
  });

  it('saves metrics and recommendations to storage', async () => {
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(saveMetricsAndRecommendations).toHaveBeenCalledWith(
        expect.objectContaining({
          averageResponseTime: expect.any(Number),
          completionRate: expect.any(Number)
        }),
        expect.arrayContaining(['rec-1', 'rec-2'])
      );
    });
  });

  it('shows threshold warning when score is below requirement', () => {
    // Override the calculated scores to be below threshold
    (calculateStageScores as jest.Mock).mockReturnValue({
      ...mockScores,
      overallScore: 35 // Below the 40 threshold for pre-seed
    });
    
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Your score is below the required threshold to proceed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Proceed to Next Stage/i })).toBeDisabled();
  });

  it('displays correct button text for final stage', () => {
    render(
      <MemoryRouter>
        <Summary stage="series-b" responses={defaultProps.responses} onStepChange={defaultProps.onStepChange} />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('button', { name: /Complete Assessment/i })).toBeInTheDocument();
  });

  it('displays radar chart with category scores', () => {
    render(
      <MemoryRouter>
        <Summary {...defaultProps} />
      </MemoryRouter>
    );
    
    // The RadarChart component would create a canvas element
    // Since RadarChart is a separate component, we can check for content related to it
    expect(screen.getByText(/Category Performance/i)).toBeInTheDocument();
    
    // Check that category scores are displayed
    Object.entries(mockScores.categoryScores).forEach(([category, score]) => {
      expect(screen.getByText(new RegExp(category, 'i'))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(score.toString(), 'i'))).toBeInTheDocument();
    });
  });
});
