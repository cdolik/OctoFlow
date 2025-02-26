import React, { useEffect, useRef } from 'react';
import { LiveRegion } from './LiveRegion';
import type { SoundType } from '../types/keyboard';

interface AudioFeedbackProps {
  children: React.ReactNode;
  enabled?: boolean;
}

const SOUND_URLS = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  info: '/sounds/info.mp3'
};

export const AudioFeedback: React.FC<AudioFeedbackProps> = ({
  children,
  enabled = true
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
<<<<<<< HEAD
  const audioBuffersRef = useRef<Map<SoundType, AudioBuffer>>(new Map());
  const soundQueueRef = useRef<Array<{ type: SoundType; volume?: number }>>([]);
=======
  const gainNodeRef = useRef<GainNode | null>(null);

  const createAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser.');
      }
      audioContextRef.current = new AudioContextClass();
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
    const gainNode = gainNodeRef.current;
    if (!gainNode) return;

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
>>>>>>> 73079e2 (Refactor tests, enhance deployment script, and update ESLint configuration)

  useEffect(() => {
    if (!enabled) return;

    const AudioContextClass = window.AudioContext;
    audioContextRef.current = new AudioContextClass();

    const loadSound = async (type: SoundType) => {
      try {
        const response = await fetch(SOUND_URLS[type]);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        audioBuffersRef.current.set(type, audioBuffer);
      } catch (error) {
        console.warn(`Failed to load sound: ${type}`, error);
      }
    };

    // Preload all sounds
    Object.keys(SOUND_URLS).forEach(type => loadSound(type as SoundType));

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [enabled]);

  const playSound = React.useCallback((type: SoundType, volume = 0.5) => {
    if (!enabled || !audioContextRef.current) return;

    const audioBuffer = audioBuffersRef.current.get(type);
    if (!audioBuffer) {
      soundQueueRef.current.push({ type, volume });
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    source.start(0);
  }, [enabled]);

  // Expose playSound method to parent components
  React.useImperativeHandle(
    { current: { playSound } },
    () => ({ playSound }),
    [playSound]
  );

  return (
    <>
      {children}
      <LiveRegion aria-live="polite">
        {enabled ? 'Sound feedback is enabled' : 'Sound feedback is disabled'}
      </LiveRegion>
    </>
  );
};

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