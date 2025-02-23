import React from 'react';
import { render, screen, act } from '@testing-library/react';
import AutoSave from './AutoSave';
import { useStorage } from '../hooks/useStorage';
import { trackError } from '../utils/analytics';

jest.mock('../hooks/useStorage');
jest.mock('../utils/analytics');
jest.useFakeTimers();

describe('AutoSave', () => {
  const mockData = { key: 'value' };
  const mockSaveComplete = jest.fn();
  const mockSaveError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({
      saveState: jest.fn().mockResolvedValue(true),
      error: null,
      recoverFromBackup: jest.fn().mockResolvedValue(true)
    });
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
});