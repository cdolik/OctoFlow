import { renderHook } from '@testing-library/react-hooks';
import { useSessionGuard } from './useSessionGuard';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

// Test wrapper to provide router context
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useSessionGuard', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('should return unauthorized when no session exists', () => {
    const { result } = renderHook(() => useSessionGuard('assessment'), { wrapper });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/stage-select', { replace: true });
  });

  it('should authorize assessment stage with valid session', () => {
    sessionStorage.setItem('currentStage', 'assessment');
    
    const { result } = renderHook(() => useSessionGuard('assessment'), { wrapper });
    
    expect(result.current.isAuthorized).toBe(true);
  });

  it('should not authorize results without completed summary', () => {
    sessionStorage.setItem('currentStage', 'summary');
    sessionStorage.setItem('completedStages', JSON.stringify(['assessment']));
    
    const { result } = renderHook(() => useSessionGuard('results'), { wrapper });
    
    expect(result.current.isAuthorized).toBe(false);
  });

  it('should authorize results with completed summary', () => {
    sessionStorage.setItem('currentStage', 'results');
    sessionStorage.setItem('completedStages', JSON.stringify(['assessment', 'summary']));
    
    const { result } = renderHook(() => useSessionGuard('results'), { wrapper });
    
    expect(result.current.isAuthorized).toBe(true);
  });
});