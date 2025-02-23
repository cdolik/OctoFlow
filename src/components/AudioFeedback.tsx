import React, { useEffect, useRef, useCallback } from 'react';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';

interface AudioContextRef {
  context: AudioContext | null;
  gainNode: GainNode | null;
}

interface AudioFeedbackProps {
  volume?: number;
  enabled?: boolean;
}

const AudioFeedback: React.FC<AudioFeedbackProps> = ({
  volume = 0.1,
  enabled = true
}) => {
  const audioContextRef = useRef<AudioContextRef>({
    context: null,
    gainNode: null
  });
  const { activeShortcut } = useKeyboardShortcuts();

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current.context) {
      const context = new AudioContext();
      const gainNode = context.createGain();
      gainNode.gain.value = volume;
      gainNode.connect(context.destination);
      
      audioContextRef.current = { context, gainNode };
    }
  }, [volume]);

  const playTone = useCallback((frequency: number, duration: number) => {
    if (!enabled || !audioContextRef.current.context || !audioContextRef.current.gainNode) {
      return;
    }

    const { context, gainNode } = audioContextRef.current;
    const oscillator = context.createOscillator();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.connect(gainNode);
    
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }, [enabled]);

  const playShortcutFeedback = useCallback(() => {
    playTone(440, 0.1); // A4 note, short duration
  }, [playTone]);

  const playTimerCompleteFeedback = useCallback(() => {
    playTone(523.25, 0.2); // C5 note, slightly longer duration
  }, [playTone]);

  const playErrorFeedback = useCallback(() => {
    // Play two tones in sequence for error
    playTone(466.16, 0.1); // Bb4
    setTimeout(() => playTone(415.30, 0.1), 100); // Ab4
  }, [playTone]);

  useEffect(() => {
    const handleUserInteraction = () => {
      initAudioContext();
    };

    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      
      if (audioContextRef.current.context) {
        audioContextRef.current.context.close();
      }
    };
  }, [initAudioContext]);

  // Play feedback when shortcuts are used
  useEffect(() => {
    if (activeShortcut) {
      playShortcutFeedback();
    }
  }, [activeShortcut, playShortcutFeedback]);

  return null; // This is a non-visual component
};

export const playTimerComplete = () => {
  const event = new CustomEvent('timerComplete');
  window.dispatchEvent(event);
};

export const playError = () => {
  const event = new CustomEvent('audioError');
  window.dispatchEvent(event);
};

export default AudioFeedback;