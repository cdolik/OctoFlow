import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { withAutoSave } from './withAutoSave';
import { useUserPreferences } from './UserPreferences';
import { useAudioFeedback } from './AudioFeedback';

jest.mock('./UserPreferences');
jest.mock('./AudioFeedback');

describe('withAutoSave', () => {
  const mockPlaySound = jest.fn();
  const mockPreferences = {
    autoSave: true,
    autoSaveInterval: 5000
  };

  beforeEach(() => {
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: mockPreferences
    });
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // Test component
  const TestComponent = ({ onSave, isDirty = false, validateBeforeSave }: { 
    onSave: () => Promise<boolean>;
    isDirty?: boolean;
    validateBeforeSave?: () => boolean;
  }) => <div>Test Component</div>;

  const WrappedComponent = withAutoSave(TestComponent);

  it('auto-saves at specified interval when dirty', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={true}
      />
    );

    // Fast-forward past auto-save interval
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('success');
  });

  it('does not auto-save when not dirty', () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={false}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('validates before saving when validator provided', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const mockValidate = jest.fn().mockReturnValue(false);

    render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={true}
        validateBeforeSave={mockValidate}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockValidate).toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('error');
  });

  it('implements exponential backoff on save failures', async () => {
    const mockSave = jest.fn().mockRejectedValue(new Error('Save failed'));

    render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={true}
      />
    );

    // First attempt
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockPlaySound).toHaveBeenCalledWith('error');

    // Second attempt (2 seconds later)
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(mockSave).toHaveBeenCalledTimes(2);

    // Third attempt (4 seconds later)
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(mockSave).toHaveBeenCalledTimes(3);

    // No fourth attempt
    await act(async () => {
      jest.advanceTimersByTime(8000);
    });
    expect(mockSave).toHaveBeenCalledTimes(3);
  });

  it('saves on window blur when dirty', () => {
    const mockSave = jest.fn().mockResolvedValue(true);

    render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={true}
      />
    );

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(mockSave).toHaveBeenCalled();
  });

  it('prevents unload when dirty', () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const preventDefaultMock = jest.fn();

    render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={true}
      />
    );

    const event = new Event('beforeunload') as BeforeUnloadEvent;
    event.preventDefault = preventDefaultMock;

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultMock).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
  });

  it('respects auto-save preference', () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: { ...mockPreferences, autoSave: false }
    });

    render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={true}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('cleans up timers on unmount', () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const { unmount } = render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={true}
      />
    );

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('announces save status via LiveRegion', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const { container } = render(
      <WrappedComponent
        onSave={mockSave}
        isDirty={true}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    const liveRegion = container.querySelector('[aria-live]');
    expect(liveRegion?.textContent).toMatch(/Last auto-saved at/);
  });
});