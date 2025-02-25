import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { useStorage } from '../hooks/useStorage';
import { trackError } from '../utils/analytics';
import { StorageManager } from '../utils/storage/storageManager';

jest.mock('../hooks/useStorage');
jest.mock('../utils/analytics');
jest.mock('../utils/storage/storageManager');

describe('Extended Integration Tests', () => {
  const mockState = {
    currentStage: 'pre-seed',
    responses: {},
    version: '1.1',
    metadata: {
      lastSaved: new Date().toISOString(),
      timeSpent: 0,
      attemptCount: 1
    },
    progress: {
      questionIndex: 0,
      totalQuestions: 10,
      isComplete: false
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockResolvedValue(true),
      error: null,
      isLoading: false
    });
  });

  describe('Offline Functionality', () => {
    it('handles offline mode gracefully', async () => {
      // Simulate offline
      const originalOnline = window.navigator.onLine;
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        configurable: true
      });

      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );

      // Verify offline indicator is shown
      expect(await screen.findByText(/You are offline/i)).toBeInTheDocument();

      // Attempt to save changes
      fireEvent.click(screen.getByText(/Start Free Checkup/i));
      fireEvent.click(screen.getByText(/Pre-Seed/i));

      // Verify changes are queued
      expect(screen.getByText(/Changes will sync when online/i)).toBeInTheDocument();

      // Simulate coming back online
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        configurable: true
      });
      window.dispatchEvent(new Event('online'));

      // Verify sync started
      await waitFor(() => {
        expect(screen.getByText(/Syncing changes/i)).toBeInTheDocument();
      });

      // Restore original online state
      Object.defineProperty(window.navigator, 'onLine', {
        value: originalOnline,
        configurable: true
      });
    });
  });

  describe('Error Recovery', () => {
    it('recovers from storage errors', async () => {
      const mockError = new Error('Storage error');
      (useStorage as jest.Mock).mockReturnValueOnce({
        state: null,
        saveState: jest.fn().mockRejectedValueOnce(mockError),
        error: mockError,
        isLoading: false
      });

      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );

      // Verify error boundary caught the error
      expect(await screen.findByText(/We encountered an issue/i)).toBeInTheDocument();

      // Attempt recovery
      fireEvent.click(screen.getByText(/Try to recover/i));

      // Verify recovery attempt
      expect(trackError).toHaveBeenCalledWith(
        mockError,
        expect.objectContaining({
          action: 'recovery_attempt'
        })
      );
    });

    it('handles failed network requests', async () => {
      const mockNetworkError = new Error('Network error');
      global.fetch = jest.fn().mockRejectedValueOnce(mockNetworkError);

      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );

      // Trigger network request
      fireEvent.click(screen.getByText(/Start Free Checkup/i));

      // Verify error handling
      expect(await screen.findByText(/Unable to connect/i)).toBeInTheDocument();

      // Verify retry mechanism
      const retryButton = screen.getByText(/Try again/i);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Session Management', () => {
    it('preserves session state across page reloads', async () => {
      // Mock storage state
      const storedState = {
        ...mockState,
        responses: { 'question-1': 3 }
      };
      
      (StorageManager.getInstance as jest.Mock).mockReturnValue({
        getState: jest.fn().mockResolvedValue(storedState),
        saveState: jest.fn().mockResolvedValue(true)
      });

      const { rerender } = render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );

      // Start assessment
      fireEvent.click(screen.getByText(/Start Free Checkup/i));
      fireEvent.click(screen.getByText(/Pre-Seed/i));

      // Answer a question
      const options = screen.getAllByRole('radio');
      fireEvent.click(options[2]);

      // Simulate page reload
      rerender(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );

      // Verify state restoration
      await waitFor(() => {
        const selectedOption = screen.getByRole('radio', { checked: true });
        expect(selectedOption).toBeInTheDocument();
      });
    });

    it('handles session expiration gracefully', async () => {
      // Mock expired session
      (useStorage as jest.Mock).mockReturnValue({
        state: {
          ...mockState,
          metadata: {
            ...mockState.metadata,
            lastSaved: new Date(Date.now() - 31 * 60 * 1000).toISOString() // 31 minutes ago
          }
        },
        error: null,
        isLoading: false
      });

      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );

      // Verify session expired message
      expect(await screen.findByText(/Session expired/i)).toBeInTheDocument();

      // Verify new session option
      const newSessionButton = screen.getByText(/Start new session/i);
      fireEvent.click(newSessionButton);

      // Verify return to initial state
      await waitFor(() => {
        expect(screen.getByText(/Start Free Checkup/i)).toBeInTheDocument();
      });
    });
  });
});