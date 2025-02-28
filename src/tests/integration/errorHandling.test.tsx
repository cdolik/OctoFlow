import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { errorScenarios, withErrorCleanup } from '../utils/errorTestUtils';
import { ErrorAggregator } from '../../utils/errorAggregator';

const errorAggregator = new ErrorAggregator();

describe('Error Handling Integration', () => {
  describe('Storage Errors', () => {
    it('recovers from storage quota errors', async () => {
      await withErrorCleanup(async () => {
        // Mock storage quota error
        const mockQuotaError = jest.spyOn(Storage.prototype, 'setItem')
          .mockImplementation(() => {
            throw errorScenarios.storage.quotaExceeded();
          });

        render(
          <MemoryRouter>
            <App />
          </MemoryRouter>
        );

        // Trigger storage operation
        fireEvent.click(screen.getByText(/Start Free Checkup/i));
        
        // Verify error handling
        await waitFor(() => {
          expect(screen.getByText(/storage space is full/i)).toBeInTheDocument();
          expect(screen.getByText(/trying to free up space/i)).toBeInTheDocument();
        });

        // Verify recovery attempt
        fireEvent.click(screen.getByText(/Try to Recover/i));

        await waitFor(() => {
          const aggregates = errorAggregator.getAggregates();
          const quotaError = aggregates.find(e => e.message.includes('quota'));
          expect(quotaError?.metrics.recoveryAttempts).toBe(1);
        });

        mockQuotaError.mockRestore();
      });
    });

    it('handles corrupted storage state', async () => {
      await withErrorCleanup(async () => {
        // Inject corrupted data
        sessionStorage.setItem('octoflow', 'invalid json{');

        render(
          <MemoryRouter>
            <App />
          </MemoryRouter>
        );

        // Attempt to load corrupted state
        fireEvent.click(screen.getByText(/Resume Assessment/i));

        await waitFor(() => {
          expect(screen.getByText(/data corruption/i)).toBeInTheDocument();
          expect(screen.getByText(/Start Fresh/i)).toBeInTheDocument();
        });

        // Verify error is tracked
        const aggregates = errorAggregator.getAggregates();
        expect(aggregates.some(e => e.message.includes('corrupted'))).toBe(true);
      });
    });
  });

  describe('Network Errors', () => {
    it('handles offline scenarios', async () => {
      await withErrorCleanup(async () => {
        // Simulate offline
        Object.defineProperty(navigator, 'onLine', { value: false });

        render(
          <MemoryRouter>
            <App />
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
        });

        // Verify error aggregation
        const aggregates = errorAggregator.getAggregates();
        expect(aggregates.some(e => e.message.includes('offline'))).toBe(true);

        // Restore online state
        Object.defineProperty(navigator, 'onLine', { value: true });
      });
    });
  });

  describe('State Transition Errors', () => {
    it('prevents invalid stage transitions', async () => {
      await withErrorCleanup(async () => {
        render(
          <MemoryRouter initialEntries={['/assessment/series-a']}>
            <App />
          </MemoryRouter>
        );

        await waitFor(() => {
          expect(screen.getByText(/invalid stage transition/i)).toBeInTheDocument();
        });

        // Verify error tracking
        const aggregates = errorAggregator.getAggregates();
        const transitionError = aggregates.find(e => 
          e.message.includes('transition') && e.contexts[0]?.stage === 'series-a'
        );
        expect(transitionError).toBeDefined();
      });
    });
  });
});