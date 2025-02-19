import { renderHook } from '@testing-library/react';
import { useSessionGuard } from './useSessionGuard';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { getAssessmentData, getAssessmentResponses } from '../utils/storage';

// Mock the storage utils
jest.mock('../utils/storage');

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

const wrapper = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useSessionGuard', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    getAssessmentData.mockReturnValue({});
    getAssessmentResponses.mockReturnValue({});
  });

  it('redirects to stage-select when accessing assessment without stage', () => {
    renderHook(() => useSessionGuard('assessment'), { wrapper });
    expect(mockNavigate).toHaveBeenCalledWith('/stage-select', { replace: true });
  });

  it('allows access to assessment with selected stage', () => {
    getAssessmentData.mockReturnValue({ stage: 'pre-seed' });
    const { result } = renderHook(() => useSessionGuard('assessment'), { wrapper });
    expect(result.current.isAuthorized).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to assessment when accessing summary without responses', () => {
    renderHook(() => useSessionGuard('summary'), { wrapper });
    expect(mockNavigate).toHaveBeenCalledWith('/assessment', { replace: true });
  });

  it('allows access to summary with responses', () => {
    getAssessmentResponses.mockReturnValue({ q1: 3, q2: 4 });
    const { result } = renderHook(() => useSessionGuard('summary'), { wrapper });
    expect(result.current.isAuthorized).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to summary when accessing results without scores', () => {
    renderHook(() => useSessionGuard('results'), { wrapper });
    expect(mockNavigate).toHaveBeenCalledWith('/summary', { replace: true });
  });

  it('allows access to results with scores', () => {
    getAssessmentData.mockReturnValue({ scores: { technical: 80, process: 90 } });
    const { result } = renderHook(() => useSessionGuard('results'), { wrapper });
    expect(result.current.isAuthorized).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to home for unknown stages', () => {
    renderHook(() => useSessionGuard('unknown'), { wrapper });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});

import { renderHook } from '@testing-library/react-hooks';
import { useSessionGuard } from './useSessionGuard';

describe('useSessionGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should return unauthorized when no session exists', () => {
    const { result } = renderHook(() => useSessionGuard('assessment'));
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(false);
  });

  it('should authorize user for current stage', () => {
    sessionStorage.setItem('currentStage', 'assessment');
    sessionStorage.setItem('completedStages', JSON.stringify(['assessment']));
    
    const { result } = renderHook(() => useSessionGuard('assessment'));
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(true);
  });

  it('should not authorize user for future stages', () => {
    sessionStorage.setItem('currentStage', 'assessment');
    sessionStorage.setItem('completedStages', JSON.stringify(['assessment']));
    
    const { result } = renderHook(() => useSessionGuard('results'));
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(false);
  });
});