import React from 'react';
import { render, act } from '@testing-library/react';
import AudioFeedback, { playTimerComplete, playError } from './AudioFeedback';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';

jest.mock('../contexts/KeyboardShortcutsContext');

describe('AudioFeedback', () => {
  let mockAudioContext: jest.Mock;
  let mockCreateOscillator: jest.Mock;
  let mockCreateGain: jest.Mock;
  let mockConnect: jest.Mock;
  let mockStart: jest.Mock;
  let mockStop: jest.Mock;

  beforeEach(() => {
    mockStart = jest.fn();
    mockStop = jest.fn();
    mockConnect = jest.fn();
    mockCreateOscillator = jest.fn(() => ({
      connect: mockConnect,
      start: mockStart,
      stop: mockStop,
      frequency: {
        setValueAtTime: jest.fn()
      },
      type: 'sine'
    }));
    mockCreateGain = jest.fn(() => ({
      connect: mockConnect,
      gain: { value: 0 }
    }));
    mockAudioContext = jest.fn(() => ({
      createOscillator: mockCreateOscillator,
      createGain: mockCreateGain,
      currentTime: 0,
      destination: {},
      close: jest.fn()
    }));

    global.AudioContext = mockAudioContext;
    (useKeyboardShortcuts as jest.Mock).mockReturnValue({ activeShortcut: null });
  });

  it('initializes audio context on user interaction', () => {
    render(<AudioFeedback />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    expect(mockAudioContext).toHaveBeenCalled();
  });

  it('plays tone when shortcut is activated', () => {
    (useKeyboardShortcuts as jest.Mock).mockReturnValue({
      activeShortcut: { key: 'n', description: 'Next', action: jest.fn() }
    });

    render(<AudioFeedback enabled={true} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    expect(mockCreateOscillator).toHaveBeenCalled();
    expect(mockStart).toHaveBeenCalled();
    expect(mockStop).toHaveBeenCalled();
  });

  it('respects enabled prop', () => {
    render(<AudioFeedback enabled={false} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
      playTimerComplete();
      playError();
    });

    expect(mockCreateOscillator).not.toHaveBeenCalled();
  });

  it('handles timer complete event', () => {
    render(<AudioFeedback enabled={true} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
      playTimerComplete();
    });

    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('handles error event', () => {
    render(<AudioFeedback enabled={true} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
      playError();
    });

    expect(mockCreateOscillator).toHaveBeenCalled();
  });

  it('cleans up audio context on unmount', () => {
    const { unmount } = render(<AudioFeedback />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    const mockClose = mockAudioContext.mock.results[0].value.close;
    unmount();
    expect(mockClose).toHaveBeenCalled();
  });

  it('sets correct volume', () => {
    render(<AudioFeedback volume={0.5} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    expect(mockCreateGain.mock.results[0].value.gain.value).toBe(0.5);
  });

  it('handles multiple events', () => {
    jest.useFakeTimers();
    render(<AudioFeedback enabled={true} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
      playTimerComplete();
      playError();
      jest.runAllTimers();
    });

    expect(mockCreateOscillator).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });
});