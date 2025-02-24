import React, { useEffect, useRef, useCallback } from 'react';

interface AudioFeedbackProps {
  children: React.ReactNode;
  enabled?: boolean;
}

type SoundType = 'success' | 'error' | 'info' | 'navigation' | 'complete';

export function AudioFeedback({ children, enabled = true }: AudioFeedbackProps): JSX.Element {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const createAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.3; // Set volume to 30%
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;

    const ctx = createAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = gainNodeRef.current!;

    // Configure sound based on type
    switch (type) {
      case 'success':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
        oscillator.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1); // C#6
        break;
      case 'error':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
        oscillator.frequency.setValueAtTime(415.30, ctx.currentTime + 0.1); // G#4
        break;
      case 'info':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        break;
      case 'navigation':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        break;
      case 'complete':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        break;
    }

    oscillator.connect(gainNode);
    oscillator.start();
    oscillator.stop(ctx.currentTime + (type === 'complete' ? 0.3 : 0.15));
  }, [enabled, createAudioContext]);

  useEffect(() => {
    // Cleanup audio context on unmount
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // Create context to provide playSound to children
  const audioContext = React.useMemo(() => ({
    playSound,
    enabled
  }), [playSound, enabled]);

  return (
    <AudioFeedbackContext.Provider value={audioContext}>
      {children}
    </AudioFeedbackContext.Provider>
  );
}

// Context for audio feedback
interface AudioFeedbackContextType {
  playSound: (type: SoundType) => void;
  enabled: boolean;
}

export const AudioFeedbackContext = React.createContext<AudioFeedbackContextType | null>(null);

// Custom hook for using audio feedback
export function useAudioFeedback() {
  const context = React.useContext(AudioFeedbackContext);
  if (!context) {
    throw new Error('useAudioFeedback must be used within an AudioFeedback provider');
  }
  return context;
}