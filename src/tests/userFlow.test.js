import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { validateUserFlow, validateResponses } from '../utils/flowValidator';
import { getAssessmentResponses } from '../utils/storage';
import { categories } from '../data/categories';

describe('OctoFlow User Journey', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Ensure proper cleanup after each test
  });

  test('Complete user flow validation', async () => {
    render(<App />);
    
    // 1. Hero -> StageSelector
    const startButton = screen.getByText(/Start Free Checkup/i);
    fireEvent.click(startButton);
    expect(screen.getByText(/Select Your Stage/i)).toBeInTheDocument();
    
    // 2. StageSelector -> Assessment
    const preSeedOption = screen.getByText(/Pre-Seed/i);
    fireEvent.click(preSeedOption);
    expect(screen.getByText(/Assessment/i)).toBeInTheDocument();

    // 3. Complete Assessment
    categories.forEach((category) => {
      // Find and answer all questions in each category
      const questions = screen.getAllByRole('radio');
      questions.forEach((question) => {
        if (question.value === '3') { // Select a moderate score for testing
          fireEvent.click(question);
        }
      });
      
      // Click next if available, or submit if it's the last category
      const nextButton = screen.getByText(/Next/i) || screen.getByText(/Submit/i);
      fireEvent.click(nextButton);
    });

    // 4. Verify Results Display
    await waitFor(() => {
      expect(screen.getByText(/Your GitHub Engineering Health Score/i)).toBeInTheDocument();
    });

    // 5. Verify Score Calculations
    const responses = getAssessmentResponses();
    expect(responses).toBeTruthy();
    expect(Object.keys(responses).length).toBeGreaterThan(0);

    // 6. Verify Recommendations
    expect(screen.getByText(/Priority Recommendations/i)).toBeInTheDocument();
    
    // 7. Validate User Flow
    const { issues, hasErrors } = validateUserFlow();
    expect(hasErrors).toBeFalsy();
    expect(issues).toHaveLength(0);

    // 8. Verify Response Validation
    const { isValid } = validateResponses(responses);
    expect(isValid).toBeTruthy();

    // 9. Verify Score Visualization
    const scoreElement = screen.getByText(/Your Score/i);
    expect(scoreElement).toBeInTheDocument();

    // 10. Verify Category Scores Display
    categories.forEach(category => {
      expect(screen.getByText(category.title)).toBeInTheDocument();
    });
  });

  test('Error handling during assessment', async () => {
    render(<App />);
    
    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Try to proceed without answering questions
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);

    // Verify error message
    expect(screen.getByText(/Please answer all questions/i)).toBeInTheDocument();
  });

  test('Progress tracking functionality', () => {
    render(<App />);
    
    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Verify progress tracker exists
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});