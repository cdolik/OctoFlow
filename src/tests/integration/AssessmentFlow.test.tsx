import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { useStorage } from '../../hooks/useStorage';
import { useAudioFeedback } from '../../components/AudioFeedback';
import { useUserPreferences } from '../../components/UserPreferences';

jest.mock('../../hooks/useStorage');
jest.mock('../../components/AudioFeedback');
jest.mock('../../components/UserPreferences');

describe('Assessment Flow Integration', () => {
  const mockStorage = {
    state: {
      stages: {},
      currentStage: 'pre-seed',
      metadata: { lastSaved: new Date().toISOString() }
    },
    saveState: jest.fn(),
    clearState: jest.fn(),
    isSessionActive: true,
    timeUntilExpiration: 3600000
  };

  const mockPreferences = {
    theme: 'light',
    soundEnabled: true,
    keyboardMode: 'basic'
  };

  beforeEach(() => {
    (useStorage as jest.Mock).mockReturnValue(mockStorage);
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: jest.fn()
    });
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: mockPreferences
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('completes full assessment flow with stage transitions', async () => {
    render(
      <MemoryRouter initialEntries={['/assessment/pre-seed']}>
        <App />
      </MemoryRouter>
    );

    // Pre-seed stage
    expect(screen.getByRole('heading', { name: /Pre-seed Assessment/i }))
      .toBeInTheDocument();

    // Complete pre-seed stage
    await act(async () => {
      // Fill out assessment form
      const form = screen.getByRole('form');
      const inputs = within(form).getAllByRole('textbox');
      inputs.forEach(input => {
        fireEvent.change(input, { target: { value: 'Test response' } });
      });

      // Submit form
      fireEvent.submit(form);
    });

    // Verify state update
    expect(mockStorage.saveState).toHaveBeenCalledWith(
      expect.objectContaining({
        stages: expect.objectContaining({
          'pre-seed': expect.objectContaining({ isComplete: true })
        })
      })
    );

    // Progress to seed stage
    const nextButton = screen.getByRole('button', { name: /Next Stage/i });
    fireEvent.click(nextButton);

    // Verify stage transition
    expect(screen.getByRole('heading', { name: /Seed Assessment/i }))
      .toBeInTheDocument();

    // Complete seed stage
    await act(async () => {
      const form = screen.getByRole('form');
      const inputs = within(form).getAllByRole('textbox');
      inputs.forEach(input => {
        fireEvent.change(input, { target: { value: 'Test response' } });
      });
      fireEvent.submit(form);
    });

    // Verify final state
    expect(mockStorage.saveState).toHaveBeenCalledWith(
      expect.objectContaining({
        stages: expect.objectContaining({
          'seed': expect.objectContaining({ isComplete: true })
        })
      })
    );
  });

  it('handles validation errors during stage progression', async () => {
    mockStorage.state.stages = {
      'pre-seed': { isComplete: false }
    };

    render(
      <MemoryRouter initialEntries={['/assessment/seed']}>
        <App />
      </MemoryRouter>
    );

    // Verify error message
    expect(screen.getByText(/Please complete pre-seed/i)).toBeInTheDocument();
  });

  it('recovers from errors with session restoration', async () => {
    const savedState = {
      ...mockStorage.state,
      stages: {
        'pre-seed': { 
          isComplete: true,
          responses: { question1: 'Saved response' }
        }
      }
    };

    // Simulate error and recovery
    (useStorage as jest.Mock)
      .mockReturnValueOnce({ ...mockStorage, state: null })
      .mockReturnValueOnce({ ...mockStorage, state: savedState });

    render(
      <MemoryRouter initialEntries={['/assessment/pre-seed']}>
        <App />
      </MemoryRouter>
    );

    // Verify session recovery
    await act(async () => {
      const recoveryButton = screen.getByRole('button', { name: /Restore Session/i });
      fireEvent.click(recoveryButton);
    });

    // Verify restored state
    const input = screen.getByDisplayValue('Saved response');
    expect(input).toBeInTheDocument();
  });

  it('maintains accessibility throughout flow', async () => {
    render(
      <MemoryRouter initialEntries={['/assessment/pre-seed']}>
        <App />
      </MemoryRouter>
    );

    // Verify ARIA landmarks
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Verify focus management
    const form = screen.getByRole('form');
    const inputs = within(form).getAllByRole('textbox');
    
    inputs.forEach(input => {
      fireEvent.focus(input);
      expect(document.activeElement).toBe(input);
    });

    // Verify announcements
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
  });

  it('persists user preferences across stages', async () => {
    const updatedPreferences = {
      ...mockPreferences,
      theme: 'dark'
    };

    render(
      <MemoryRouter initialEntries={['/assessment/pre-seed']}>
        <App />
      </MemoryRouter>
    );

    // Update preferences
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: updatedPreferences
    });

    // Progress to next stage
    const nextButton = screen.getByRole('button', { name: /Next Stage/i });
    fireEvent.click(nextButton);

    // Verify preferences maintained
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('theme-dark');
  });
});