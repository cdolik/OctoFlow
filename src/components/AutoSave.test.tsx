import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AutoSave } from './AutoSave';
import { useStorage } from '../hooks/useStorage';
import { useError } from '../contexts/ErrorContext';
import { createMockState } from '../utils/testUtils';

jest.mock('../hooks/useStorage');
jest.mock('../contexts/ErrorContext');
jest.mock('../utils/analytics');

describe('AutoSave', () => {
  const mockSaveState = jest.fn();
  const mockHandleError = jest.fn();
  const mockData = { key: 'value' };
  const mockSaveComplete = jest.fn();
  const mockSaveError = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    const mockState = createMockState({ currentStage: 'pre-seed' });

    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: mockSaveState,
      error: null,
      recoverFromBackup: jest.fn().mockResolvedValue(true)
    });

    (useError as jest.Mock).mockReturnValue({
      handleError: mockHandleError
    });

    mockSaveState.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('shows saving status immediately when data changes', () => {
    render(
      <AutoSave
        data={mockData}
        onSaveComplete={mockSaveComplete}
        onSaveError={mockSaveError}
      />
    );

    expect(screen.getByText('Saving changes...')).toBeInTheDocument();
  });

  it('shows saved status after successful save', async () => {
    render(
      <AutoSave
        data={mockData}
        onSaveComplete={mockSaveComplete}
        onSaveError={mockSaveError}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('All changes saved')).toBeInTheDocument();
    expect(mockSaveComplete).toHaveBeenCalled();
  });

  it('attempts recovery on save failure', async () => {
    const mockSaveState = jest.fn().mockRejectedValueOnce(new Error('Save failed'));
    const mockRecoverFromBackup = jest.fn().mockResolvedValueOnce(true);

    (useStorage as jest.Mock).mockReturnValue({
      saveState: mockSaveState,
      error: null,
      recoverFromBackup: mockRecoverFromBackup
    });

    render(
      <AutoSave
        data={mockData}
        onSaveComplete={mockSaveComplete}
        onSaveError={mockSaveError}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRecoverFromBackup).toHaveBeenCalled();
    expect(mockSaveError).toHaveBeenCalledWith(expect.any(Error));
    expect(trackError).toHaveBeenCalled();
  });

  it('shows error status when both save and recovery fail', async () => {
    const mockSaveState = jest.fn().mockRejectedValueOnce(new Error('Save failed'));
    const mockRecoverFromBackup = jest.fn().mockRejectedValueOnce(new Error('Recovery failed'));

    (useStorage as jest.Mock).mockReturnValue({
      saveState: mockSaveState,
      error: null,
      recoverFromBackup: mockRecoverFromBackup
    });

    render(
      <AutoSave
        data={mockData}
        onSaveComplete={mockSaveComplete}
        onSaveError={mockSaveError}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
    expect(trackError).toHaveBeenCalledTimes(2);
  });

  it('performs periodic saves at specified interval', async () => {
    const mockSaveState = jest.fn().mockResolvedValue(true);
    (useStorage as jest.Mock).mockReturnValue({
      saveState: mockSaveState,
      error: null,
      recoverFromBackup: jest.fn()
    });

    render(
      <AutoSave
        data={mockData}
        interval={1000}
        onSaveComplete={mockSaveComplete}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockSaveState).toHaveBeenCalledTimes(4); // Initial + 3 interval calls
  });

  it('updates save status when storage error occurs', () => {
    const storageError = new Error('Storage error');
    (useStorage as jest.Mock).mockReturnValue({
      saveState: jest.fn(),
      error: storageError,
      recoverFromBackup: jest.fn()
    });

    render(
      <AutoSave
        data={mockData}
        onSaveError={mockSaveError}
      />
    );

    expect(screen.getByText('Error saving changes')).toBeInTheDocument();
    expect(mockSaveError).toHaveBeenCalledWith(storageError);
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = render(
      <AutoSave
        data={mockData}
        interval={1000}
      />
    );

    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('auto-saves at specified intervals', async () => {
    render(
      <AutoSave interval={5000}>
        <div>Test Content</div>
      </AutoSave>
    );

    // Fast forward past first interval
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSaveState).toHaveBeenCalledTimes(1);

    // Fast forward past second interval
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSaveState).toHaveBeenCalledTimes(2);
  });

  it('shows save status messages', async () => {
    render(
      <AutoSave>
        <div>Test Content</div>
      </AutoSave>
    );

    // Initial save
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Changes saved/)).toBeInTheDocument();
    });
  });

  it('retries failed saves with exponential backoff', async () => {
    mockSaveState.mockRejectedValueOnce(new Error('Save failed'))
                 .mockRejectedValueOnce(new Error('Save failed'))
                 .mockResolvedValueOnce(true);

    render(
      <AutoSave maxRetries={3} retryDelay={1000}>
        <div>Test Content</div>
      </AutoSave>
    );

    // Initial failed save
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // First retry (after 1000ms)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Second retry (after 2000ms)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockSaveState).toHaveBeenCalledTimes(3);
    expect(screen.getByText(/Changes saved/)).toBeInTheDocument();
  });

  it('handles window blur events', () => {
    render(
      <AutoSave>
        <div>Test Content</div>
      </AutoSave>
    );

    // Simulate window blur
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(mockSaveState).toHaveBeenCalled();
  });

  it('prevents unload during active save', () => {
    mockSaveState.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <AutoSave>
        <div>Test Content</div>
      </AutoSave>
    );

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    const event = new Event('beforeunload') as BeforeUnloadEvent;
    event.preventDefault = jest.fn();

    // Simulate beforeunload event
    window.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('shows error message after max retries', async () => {
    mockSaveState.mockRejectedValue(new Error('Save failed'));

    render(
      <AutoSave maxRetries={2} retryDelay={1000}>
        <div>Test Content</div>
      </AutoSave>
    );

    // Initial save + 2 retries
    act(() => {
      jest.advanceTimersByTime(30000 + 1000 + 2000);
    });

    expect(mockHandleError).toHaveBeenCalled();
    expect(screen.getByText(/Save failed/)).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <AutoSave>
        <div>Test Content</div>
      </AutoSave>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});