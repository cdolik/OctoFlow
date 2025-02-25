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
  const audioBuffersRef = useRef<Map<SoundType, AudioBuffer>>(new Map());
  const soundQueueRef = useRef<Array<{ type: SoundType; volume?: number }>>([]);

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