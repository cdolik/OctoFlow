import { renderHook, act } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { useAssessmentSession } from './useAssessmentSession';
import { trackSessionRecovery } from '../utils/analytics';

jest.mock('../utils/analytics');
jest.mock('./useSessionGuard', () => ({
  useSessionGuard: () => ({
    isLoading: false,
    isAuthorized: true,
    error: null
  })
}));

jest.mock('./useStateRecovery', () => ({
  useStateRecovery: () => ({
    isRecovering: false,
    recoveredStage: 'pre-seed',
    recoveredResponses: { 'question1': 3 },
    error: null,
    attemptRecovery: jest.fn().mockResolvedValue(true),
    clearRecoveredState: jest.fn()
  })
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HashRouter>{children}</HashRouter>
);

describe('useAssessmentSession', () => {
  const mockOnRecoveryComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('attempts auto-recovery when configured', async () => {
    const { result } = renderHook(
      () => useAssessmentSession({
        autoRecover: true,
        onRecoveryComplete: mockOnRecoveryComplete
      }),
      { wrapper }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockOnRecoveryComplete).toHaveBeenCalledWith(
      'pre-seed',
      expect.objectContaining({ 'question1': 3 })
    );
    expect(trackSessionRecovery).toHaveBeenCalledWith(true, false);
  });

  it('skips auto-recovery when disabled', async () => {
    const { result } = renderHook(
      () => useAssessmentSession({
        autoRecover: false,
        onRecoveryComplete: mockOnRecoveryComplete
      }),
      { wrapper }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockOnRecoveryComplete).not.toHaveBeenCalled();
  });

  it('allows manual session restoration', async () => {
    const { result } = renderHook(
      () => useAssessmentSession({
        autoRecover: false,
        onRecoveryComplete: mockOnRecoveryComplete
      }),
      { wrapper }
    );

    await act(async () => {
      const success = await result.current.restoreSession();
      expect(success).toBe(true);
    });

    expect(mockOnRecoveryComplete).toHaveBeenCalled();
  });

  it('handles session clearing', async () => {
    const { result } = renderHook(
      () => useAssessmentSession(),
      { wrapper }
    );

    act(() => {
      result.current.clearSession();
    });

    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(result.current.recoveredStage).toBe('pre-seed'); // Initial state from mock
  });

  it('prevents recovery when not authorized', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Override useSessionGuard mock for this test
    jest.requireMock('./useSessionGuard').useSessionGuard = () => ({
      isLoading: false,
      isAuthorized: false,
      error: null
    });

    const { result } = renderHook(
      () => useAssessmentSession({
        onRecoveryComplete: mockOnRecoveryComplete
      }),
      { wrapper }
    );

    await act(async () => {
      const success = await result.current.restoreSession();
      expect(success).toBe(false);
    });

    expect(mockOnRecoveryComplete).not.toHaveBeenCalled();
  });

  it('combines loading states correctly', () => {
    // Override both hooks to test loading state combination
    jest.requireMock('./useSessionGuard').useSessionGuard = () => ({
      isLoading: true,
      isAuthorized: true,
      error: null
    });

    jest.requireMock('./useStateRecovery').useStateRecovery = () => ({
      isRecovering: true,
      recoveredStage: null,
      recoveredResponses: {},
      error: null,
      attemptRecovery: jest.fn(),
      clearRecoveredState: jest.fn()
    });

    const { result } = renderHook(
      () => useAssessmentSession(),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);
  });
});