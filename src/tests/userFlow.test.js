import React from 'react';
import PropTypes from 'prop-types';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';
import { getAssessmentData, getAssessmentResponses, getAssessmentMetadata } from '../utils/storage';
import { categories } from '../data/categories';

// Component for wrapping tests that need router context
const TestRouter = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

TestRouter.propTypes = {
  children: PropTypes.node.isRequired
};

jest.mock('../utils/analytics', () => ({
  trackStageSelect: jest.fn(),
  trackQuestionAnswer: jest.fn(),
  trackAssessmentComplete: jest.fn(),
  trackError: jest.fn()
}));

// Mock the storage utils
jest.mock('../utils/storage');

describe('OctoFlow User Journey', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('Complete assessment flow with state persistence', async () => {
    render(<App />);
    
    // 1. Stage Selection
    const startButton = screen.getByText(/Start Free Checkup/i);
    fireEvent.click(startButton);
    
    const preSeedOption = screen.getByText(/Pre-Seed/i);
    fireEvent.click(preSeedOption);
    
    // 2. Assessment Questions
    const stageQuestions = Object.values(categories).flatMap(category => 
      category.questions.filter(q => q.stages.includes('pre-seed'))
    );

    for (let currentIdx = 0; currentIdx < stageQuestions.length; currentIdx++) {
      const question = stageQuestions[currentIdx];
      await waitFor(() => {
        expect(screen.getByText(question.text)).toBeInTheDocument();
      });

      // Select answer and verify storage
      const options = screen.getAllByRole('button', { name: /option/i });
      fireEvent.click(options[2]); // Select third option (value 3)
      
      const responses = getAssessmentResponses();
      expect(responses[question.id]).toBe(3);

      // Move to next question
      const nextButton = screen.getByText(
        currentIdx === stageQuestions.length - 1 ? /Complete/i : /Next/i
      );
      fireEvent.click(nextButton);
    }

    // 3. Results Verification
    await waitFor(() => {
      expect(screen.getByText(/Your GitHub Engineering Health Score/i)).toBeInTheDocument();
    });

    // Verify radar chart
    expect(screen.getByRole('img', { name: /score comparison/i })).toBeInTheDocument();

    // Verify recommendations
    const recommendations = screen.getAllByText(/implementation steps/i);
    expect(recommendations.length).toBeGreaterThan(0);

    // 4. Metadata Persistence
    const metadata = getAssessmentMetadata();
    expect(metadata).toEqual(expect.objectContaining({
      lastSaved: expect.any(String),
      questionCount: expect.any(Number)
    }));
  });

  test('Error recovery and state preservation', async () => {
    render(<App />);
    
    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Answer first question
    const options = screen.getAllByRole('button', { name: /option/i });
    fireEvent.click(options[2]);

    // Simulate error
    jest.spyOn(console, 'error').mockImplementation((message) => {
      // Log the error message to the console
      console.log('Error:', message);
    });
    fireEvent.error(window);

    // Verify error boundary
    expect(screen.getByText(/We encountered an issue/i)).toBeInTheDocument();
    
    // Verify response preservation
    const responses = getAssessmentResponses();
    expect(Object.keys(responses).length).toBeGreaterThan(0);

    // Test recovery
    const retryButton = screen.getByText(/Try to Resume/i);
    fireEvent.click(retryButton);

    // Verify state restoration
    await waitFor(() => {
      const savedResponses = getAssessmentResponses();
      expect(savedResponses).toEqual(responses);
    });
  });

  test('Stage-specific question filtering', async () => {
    render(<App />);
    
    // Test each stage
    const stages = ['pre-seed', 'seed', 'series-a'];
    for (const stage of stages) {
      // Start new assessment
      fireEvent.click(screen.getByText(/Start Free Checkup/i));
      fireEvent.click(screen.getByText(stage.label));

      // Verify only stage-appropriate questions
      const questions = Object.values(categories).flatMap(category => 
        category.questions.filter(q => q.stages.includes(stage.id))
      );

      for (const question of questions) {
        expect(screen.getByText(question.text)).toBeInTheDocument();
        
        // Answer and proceed
        const options = screen.getAllByRole('button', { name: /option/i });
        fireEvent.click(options[0]);
        fireEvent.click(screen.getByText(/Next/i));
      }

      // Cleanup for next iteration
      cleanup();
      sessionStorage.clear();
    }
  });

  test('Tooltip functionality', async () => {
    render(<App />);
    
    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Find question with tooltip
    const tooltipTrigger = screen.getByRole('button', { name: /info/i });
    
    // Test mouse interactions
    fireEvent.mouseEnter(tooltipTrigger);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(tooltipTrigger);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Test keyboard interactions
    fireEvent.keyPress(tooltipTrigger, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('App Routing', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock storage to be empty by default
    getAssessmentData.mockReturnValue({});
  });

  it('shows Hero component on initial load', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Welcome to OctoFlow/i)).toBeInTheDocument();
  });

  it('redirects to stage-select when trying to access assessment without stage', async () => {
    window.history.pushState({}, '', '/assessment');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Should redirect to stage select
    expect(window.location.pathname).toBe('/stage-select');
  });

  it('allows access to assessment when stage is selected', async () => {
    // Mock selected stage
    getAssessmentData.mockReturnValue({ stage: 'development' });

    window.history.pushState({}, '', '/assessment');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Should stay on assessment
    expect(window.location.pathname).toBe('/assessment');
  });

  it('redirects to assessment when trying to access summary without responses', async () => {
    window.history.pushState({}, '', '/summary');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Should redirect to assessment
    expect(window.location.pathname).toBe('/assessment');
  });

  it('allows access to results when scores exist', async () => {
    // Mock assessment completion
    getAssessmentData.mockReturnValue({ 
      stage: 'development',
      scores: { technical: 80, process: 90 }
    });

    window.history.pushState({}, '', '/results');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Should stay on results
    expect(window.location.pathname).toBe('/results');
  });
});