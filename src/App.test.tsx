import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { getAssessmentState, clearAssessmentState } from './utils/storage';
import { Stage } from './types';

jest.mock('./utils/storage');

const renderApp = () => {
  return render(
    <HashRouter>
      <App />
    </HashRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAssessmentState();
  });

  it('renders hero view by default', () => {
    renderApp();
    expect(screen.getByText(/Start Free Checkup/i)).toBeInTheDocument();
  });

  it('navigates to stage selection on hero CTA click', () => {
    renderApp();
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    expect(window.location.hash).toBe('#/stage-select');
  });

  it('preserves stage responses across navigation', async () => {
    const mockState = {
      currentStage: 'pre-seed' as Stage,
      responses: { 'q1': 3, 'q2': 4 },
      version: '1.1'
    };

    (getAssessmentState as jest.Mock).mockReturnValue(mockState);
    
    renderApp();
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Pre-Seed/i)).toBeInTheDocument();
    });
  });

  it('handles assessment completion flow', async () => {
    renderApp();
    
    // Start assessment
    fireEvent.click(screen.getByText(/Start Free Checkup/i));
    fireEvent.click(screen.getByText(/Pre-Seed/i));

    await waitFor(() => {
      expect(window.location.hash).toBe('#/assessment');
    });

    // Verify stage persistence
    const state = getAssessmentState();
    expect(state?.currentStage).toBe('pre-seed');
  });

  it('handles errors gracefully', async () => {
    (getAssessmentState as jest.Mock).mockImplementation(() => {
      throw new Error('Storage error');
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });
});