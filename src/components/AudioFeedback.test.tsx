import React from 'react';
import { render, act } from '@testing-library/react';
import { AudioFeedback, useAudioFeedback } from './AudioFeedback';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';

jest.mock('../contexts/KeyboardShortcutsContext');

describe('AudioFeedback', () => {
  let mockAudioContext: jest.Mock;
  let mockOscillator: any;
  let mockGainNode: any;

  beforeEach(() => {
    // Mock Web Audio API
    mockOscillator = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn()
      },
      type: 'sine'
    };

    mockGainNode = {
      connect: jest.fn(),
      gain: {
        value: 0,
        setValueAtTime: jest.fn()
      }
    };

    mockAudioContext = jest.fn().mockImplementation(() => ({
      createOscillator: () => mockOscillator,
      createGain: () => mockGainNode,
      currentTime: 0,
      destination: {},
      state: 'running',
      close: jest.fn()
    }));

    (window as any).AudioContext = mockAudioContext;
    (window as any).webkitAudioContext = mockAudioContext;
    (useKeyboardShortcuts as jest.Mock).mockReturnValue({ activeShortcut: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test component that uses audio feedback
  const TestComponent = () => {
    const { playSound } = useAudioFeedback();
    return (
      <button onClick={() => playSound('success')}>
        Test Sound
      </button>
    );
  };

  it('initializes audio context when enabled', () => {
    render(
      <AudioFeedback enabled={true}>
        <TestComponent />
      </AudioFeedback>
    );

    expect(mockAudioContext).toHaveBeenCalled();
  });

  it('does not play sound when disabled', () => {
    render(
      <AudioFeedback enabled={false}>
        <TestComponent />
      </AudioFeedback>
    );

    act(() => {
      mockOscillator.start();
    });

    expect(mockOscillator.start).not.toHaveBeenCalled();
  });

  it('configures correct frequencies for success sound', () => {
    const { getByText } = render(
      <AudioFeedback enabled={true}>
        <TestComponent />
      </AudioFeedback>
    );

    act(() => {
      getByText('Test Sound').click();
    });

    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 0);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(1108.73, 0.1);
  });

  it('cleans up audio context on unmount', () => {
    const { unmount } = render(
      <AudioFeedback enabled={true}>
        <TestComponent />
      </AudioFeedback>
    );

    const mockClose = mockAudioContext.mock.results[0].value.close;
    
    unmount();
    
    expect(mockClose).toHaveBeenCalled();
  });

  it('throws error when hook is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAudioFeedback must be used within an AudioFeedback provider');
    
    consoleError.mockRestore();
  });

  it('sets correct gain value for volume control', () => {
    render(
      <AudioFeedback enabled={true}>
        <TestComponent />
      </AudioFeedback>
    );

    expect(mockGainNode.gain.value).toBe(0.3);
  });

  it('correctly configures different sound types', () => {
    const TestWithMultipleSounds = () => {
      const { playSound } = useAudioFeedback();
      return (
        <>
          <button onClick={() => playSound('error')}>Error</button>
          <button onClick={() => playSound('info')}>Info</button>
          <button onClick={() => playSound('navigation')}>Navigation</button>
          <button onClick={() => playSound('complete')}>Complete</button>
        </>
      );
    };

    const { getByText } = render(
      <AudioFeedback enabled={true}>
        <TestWithMultipleSounds />
      </AudioFeedback>
    );

    // Test error sound
    act(() => {
      getByText('Error').click();
    });
    expect(mockOscillator.type).toBe('triangle');
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);

    // Test info sound
    act(() => {
      getByText('Info').click();
    });
    expect(mockOscillator.type).toBe('sine');
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(659.25, 0);

    // Test navigation sound
    act(() => {
      getByText('Navigation').click();
    });
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(523.25, 0);

    // Test complete sound
    act(() => {
      getByText('Complete').click();
    });
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(783.99, 0.2);
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

    expect(mockOscillator).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('respects enabled prop', () => {
    render(<AudioFeedback enabled={false} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    expect(mockOscillator).not.toHaveBeenCalled();
  });

  it('handles timer complete event', () => {
    render(<AudioFeedback enabled={true} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    expect(mockOscillator).toHaveBeenCalled();
  });

  it('handles error event', () => {
    render(<AudioFeedback enabled={true} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    expect(mockOscillator).toHaveBeenCalled();
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

    expect(mockGainNode.gain.value).toBe(0.5);
  });

  it('handles multiple events', () => {
    jest.useFakeTimers();
    render(<AudioFeedback enabled={true} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });

    expect(mockOscillator).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });
});