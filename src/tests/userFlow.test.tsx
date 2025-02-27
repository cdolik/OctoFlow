import React, { PropsWithChildren } from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';
import { AssessmentErrorBoundary } from '../components/AssessmentErrorBoundary';
import { getAssessmentData, getAssessmentResponses, getAssessmentMetadata } from '../utils/storage';
import { categories } from '../data/categories';
import { Stage, Category, Question } from '../types';

// Component for wrapping tests that need router context
const TestRouter: React.FC<PropsWithChildren> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

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
    const stageQuestions = Object.values(categories as Record<string, Category>).flatMap(category => 
      (category.questions as Question[]).filter(q => q.stages.includes('pre-seed'))
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
    const stages: Stage[] = ['pre-seed', 'seed', 'series-a'];
    
    for (const stage of stages) {
      // Start new assessment
      fireEvent.click(screen.getByText(/Start Free Checkup/i));
      fireEvent.click(screen.getByText(new RegExp(stage, 'i')));

      // Verify only stage-appropriate questions
      const questions = Object.values(categories as Record<string, Category>).flatMap(category => 
        (category.questions as Question[]).filter(q => q.stages.includes(stage))
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

  test('Verify accumulated metrics and tailored recommendations', async () => {
    render(<App />);
    
    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Answer questions
    const stageQuestions = Object.values(categories as Record<string, Category>).flatMap(category => 
      (category.questions as Question[]).filter(q => q.stages.includes('pre-seed'))
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

    // Verify summary screen
    const summaryButton = screen.getByText(/Summary/i);
    fireEvent.click(summaryButton);
    await waitFor(() => {
      expect(screen.getByText(/Review Your Responses/i)).toBeInTheDocument();
    });

    // Verify accumulated metrics
    expect(screen.getByText(/Average Response Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Completion Rate/i)).toBeInTheDocument();

    // Verify tailored recommendations
    const recommendations = screen.getAllByText(/implementation steps/i);
    expect(recommendations.length).toBeGreaterThan(0);
  });
});

describe('Stage-specific validation', () => {
  test('filters questions correctly for each stage', () => {
    const allStages: Stage[] = ['pre-seed', 'seed', 'series-a'];
    
    allStages.forEach(stage => {
      render(<App />);
      
      // Start assessment
      fireEvent.click(screen.getByText(/Start Free Checkup/i));
      fireEvent.click(screen.getByText(new RegExp(stage, 'i')));

      // Get questions that should be shown for this stage
      const stageQuestions = Object.values(categories as Record<string, Category>)
        .flatMap(cat => cat.questions as Question[])
        .filter(q => q.stages.includes(stage));

      // Get questions that shouldn't be shown
      const otherQuestions = Object.values(categories as Record<string, Category>)
        .flatMap(cat => cat.questions as Question[])
        .filter(q => !q.stages.includes(stage));

      // Verify correct questions are shown
      stageQuestions.forEach(question => {
        expect(screen.getByText(question.text)).toBeInTheDocument();
      });

      // Verify other questions are not shown
      otherQuestions.forEach(question => {
        expect(screen.queryByText(question.text)).not.toBeInTheDocument();
      });

      cleanup();
    });
  });

  test('autosave functionality preserves stage-specific responses', async () => {
    render(<App />);
    
    // Start pre-seed assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    // Answer first question
    const options = screen.getAllByRole('button', { name: /option/i });
    fireEvent.click(options[2]); // Select third option

    // Wait for autosave
    await waitFor(() => {
      const savedResponses = getAssessmentResponses();
      expect(Object.keys(savedResponses).length).toBeGreaterThan(0);
    });

    // Reload page
    cleanup();
    render(<App />);

    // Verify responses were restored
    const savedResponses = getAssessmentResponses();
    expect(savedResponses).toBeTruthy();
    expect(Object.values(savedResponses)[0]).toBe(3);
  });

  test('error boundary handles invalid stage transitions', () => {
    const mockError = new Error('Invalid stage transition');
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssessmentErrorBoundary>
        <div onClick={() => { throw mockError; }}>Trigger Error</div>
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Trigger Error'));
    expect(screen.getByText(/We encountered an issue/i)).toBeInTheDocument();
    expect(screen.getByText(/Try to Resume/i)).toBeInTheDocument();
  });
});

describe('App Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAssessmentData as jest.Mock).mockReturnValue({});
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
    
    expect(window.location.pathname).toBe('/stage-select');
  });

  it('allows access to assessment when stage is selected', async () => {
    (getAssessmentData as jest.Mock).mockReturnValue({ stage: 'development' });
    window.history.pushState({}, '', '/assessment');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(window.location.pathname).toBe('/assessment');
  });

  it('redirects to assessment when trying to access summary without responses', async () => {
    window.history.pushState({}, '', '/summary');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(window.location.pathname).toBe('/assessment');
  });

  it('allows access to results when scores exist', async () => {
    (getAssessmentData as jest.Mock).mockReturnValue({ 
      stage: 'development',
      scores: { technical: 80, process: 90 }
    });
    window.history.pushState({}, '', '/results');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(window.location.pathname).toBe('/results');
  });
});
