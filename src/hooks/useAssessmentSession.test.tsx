import { renderHook, act } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { useAssessmentSession } from './useAssessmentSession';
import { trackSessionRecovery } from '../utils/analytics';
import { useStorage } from './useStorage';
import { questions } from '../data/questions';
import { trackError, trackAssessmentComplete } from '../utils/analytics';
import { Stage, AssessmentState, AssessmentResponse } from '../types';

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

jest.mock('./useStorage');
jest.useFakeTimers();

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

describe('useAssessmentSession Hook', () => {
  const mockState: AssessmentState = {
    stage: 'pre-seed',
    responses: {},
    progress: {
      questionIndex: 0,
      totalQuestions: 5,
      isComplete: false,
      lastUpdated: new Date().toISOString()
    },
    metadata: {
      startTime: Date.now(),
      lastInteraction: Date.now(),
      completedCategories: [],
      categoryScores: {}
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null,
      recoverFromBackup: jest.fn().mockResolvedValue(true)
    });
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAssessmentSession());
    
    expect(result.current.state).toEqual(mockState);
    expect(result.current.saveStatus).toEqual({
      status: 'saved',
      timestamp: expect.any(Number)
    });
  });

  it('saves responses correctly', async () => {
    const { result } = renderHook(() => useAssessmentSession());

    await act(async () => {
      const success = await result.current.saveResponse('question-1', 3, 1000);
      expect(success).toBe(true);
    });

    expect(result.current.saveStatus).toEqual({
      status: 'saved',
      timestamp: expect.any(Number)
    });
  });

  it('handles save failures', async () => {
    (useStorage as jest.Mock).mockReturnValue({
      ...mockState,
      saveState: jest.fn().mockRejectedValue(new Error('Storage error'))
    });

    const { result } = renderHook(() => useAssessmentSession());

    await act(async () => {
      const success = await result.current.saveResponse('question-1', 3, 1000);
      expect(success).toBe(false);
    });

    expect(result.current.saveStatus).toEqual({
      status: 'error',
      error: expect.any(Error)
    });
    expect(trackError).toHaveBeenCalled();
  });

  it('validates session completion', async () => {
    const completeMockState = {
      ...mockState,
      responses: {
        'question-1': { value: 3, timestamp: Date.now() } as AssessmentResponse,
        'question-2': { value: 4, timestamp: Date.now() } as AssessmentResponse
      }
    };

    (useStorage as jest.Mock).mockReturnValue({
      state: completeMockState,
      saveState: jest.fn().mockResolvedValue(true),
      isLoading: false,
      error: null
    });

    const { result } = renderHook(() => useAssessmentSession());

    await act(async () => {
      const success = await result.current.completeSession();
      expect(success).toBe(true);
    });

    expect(trackAssessmentComplete).toHaveBeenCalledWith(
      completeMockState.responses,
      completeMockState.stage
    );
  });

  it('attempts recovery on storage failure', async () => {
    const mockRecoverFromBackup = jest.fn().mockResolvedValue(true);
    (useStorage as jest.Mock).mockReturnValue({
      state: null,
      saveState: jest.fn().mockRejectedValue(new Error('Storage error')),
      isLoading: false,
      error: new Error('Storage error'),
      recoverFromBackup: mockRecoverFromBackup
    });

    const { result } = renderHook(() => useAssessmentSession());

    await act(async () => {
      await result.current.recoverFromBackup();
    });

    expect(mockRecoverFromBackup).toHaveBeenCalled();
  });

  it('initializes new session with provided stage', () => {
    const initialStage: Stage = 'seed';
    const mockSaveState = jest.fn().mockResolvedValue(true);

    (useStorage as jest.Mock).mockReturnValue({
      state: null,
      saveState: mockSaveState,
      isLoading: false,
      error: null
    });

    renderHook(() => useAssessmentSession({ initialStage }));

    expect(mockSaveState).toHaveBeenCalledWith(expect.objectContaining({
      stage: initialStage,
      responses: {},
      progress: expect.any(Object),
      metadata: expect.any(Object)
    }));
  });
});