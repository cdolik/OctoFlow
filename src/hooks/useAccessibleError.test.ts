import { renderHook, act } from '@testing-library/react-hooks';
import { useAccessibleError } from './useAccessibleError';
import { useErrorManagement } from './useErrorManagement';
import { AssessmentError } from '../types/errors';

jest.mock('./useErrorManagement');

describe('useAccessibleError', () => {
  const mockRef = { current: document.createElement('div') };
  const mockHandleError = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useErrorManagement as jest.Mock).mockReturnValue({
      error: null,
      handleError: mockHandleError,
      clearError: mockClearError,
      isRecovering: false
    });
  });

  it('initializes with default options', () => {
    const { result } = renderHook(() => useAccessibleError());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isRecovering).toBe(false);
    expect(typeof result.current.handleError).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('announces errors through ref when announceErrors is true', async () => {
    const error = new AssessmentError('Test error', {
      severity: 'medium',
      recoverable: true
    });

    const { result } = renderHook(() =>
      useAccessibleError({
        announceErrors: true,
        politeAnnouncements: true
      })
    );

    // Set up ref
    result.current.announcementRef.current = mockRef.current;

    await act(async () => {
      await result.current.handleError(error);
    });

    expect(mockRef.current.textContent).toContain('Error: Test error');
    expect(mockRef.current.textContent).toContain('The application will attempt to recover');
  });

  it('does not announce errors when announceErrors is false', async () => {
    const error = new Error('Test error');
    const { result } = renderHook(() =>
      useAccessibleError({
        announceErrors: false
      })
    );

    result.current.announcementRef.current = mockRef.current;
    const originalContent = mockRef.current.textContent;

    await act(async () => {
      await result.current.handleError(error);
    });

    expect(mockRef.current.textContent).toBe(originalContent);
  });

  it('handles critical errors appropriately', async () => {
    const error = new AssessmentError('Critical error', {
      severity: 'critical',
      recoverable: false
    });

    const { result } = renderHook(() => useAccessibleError());
    result.current.announcementRef.current = mockRef.current;

    await act(async () => {
      await result.current.handleError(error);
    });

    expect(mockRef.current.textContent).toContain('Critical error');
    expect(mockRef.current.textContent).toContain('This is a critical error');
    expect(mockRef.current.textContent).toContain('Please try again later');
  });

  it('clears error announcements when clearError is called', () => {
    const { result } = renderHook(() => useAccessibleError());
    result.current.announcementRef.current = mockRef.current;

    act(() => {
      result.current.clearError();
    });

    expect(mockRef.current.textContent).toBe('Error cleared');
  });

  it('handles missing ref gracefully', async () => {
    const error = new Error('Test error');
    const { result } = renderHook(() => useAccessibleError());

    // Don't set the ref
    await act(async () => {
      await result.current.handleError(error);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error);
  });

  it('respects autoFocus option when announcing errors', async () => {
    const error = new Error('Test error');
    const { result } = renderHook(() =>
      useAccessibleError({
        autoFocus: true
      })
    );

    const mockFocus = jest.fn();
    mockRef.current.focus = mockFocus;
    result.current.announcementRef.current = mockRef.current;

    await act(async () => {
      await result.current.handleError(error);
    });

    expect(mockFocus).toHaveBeenCalled();
  });

  it('does not focus when autoFocus is false', async () => {
    const error = new Error('Test error');
    const { result } = renderHook(() =>
      useAccessibleError({
        autoFocus: false
      })
    );

    const mockFocus = jest.fn();
    mockRef.current.focus = mockFocus;
    result.current.announcementRef.current = mockRef.current;

    await act(async () => {
      await result.current.handleError(error);
    });

    expect(mockFocus).not.toHaveBeenCalled();
  });

  it('cleans up on unmount when clearOnUnmount is true', () => {
    const { unmount } = renderHook(() =>
      useAccessibleError({
        clearOnUnmount: true
      })
    );

    unmount();
    expect(mockClearError).toHaveBeenCalled();
  });

  it('does not clean up on unmount when clearOnUnmount is false', () => {
    const { unmount } = renderHook(() =>
      useAccessibleError({
        clearOnUnmount: false
      })
    );

    unmount();
    expect(mockClearError).not.toHaveBeenCalled();
  });

  it('prevents duplicate error announcements', async () => {
    const error = new Error('Test error');
    const { result } = renderHook(() => useAccessibleError());
    result.current.announcementRef.current = mockRef.current;

    await act(async () => {
      await result.current.handleError(error);
      await result.current.handleError(error); // Same error twice
    });

    expect(mockRef.current.textContent?.match(/Test error/g)?.length).toBe(1);
  });
});