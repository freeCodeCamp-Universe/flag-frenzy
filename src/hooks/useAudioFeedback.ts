import { useCallback, useRef } from 'react';

import type { MatchFeedback } from '../game/types';

type AudioFeedback = MatchFeedback | 'complete';

const toneByFeedback: Record<AudioFeedback, { duration: number; frequency: number }> = {
  complete: {
    duration: 0.18,
    frequency: 660,
  },
  correct: {
    duration: 0.12,
    frequency: 520,
  },
  incorrect: {
    duration: 0.1,
    frequency: 180,
  },
  pending: {
    duration: 0.06,
    frequency: 320,
  },
};

export function useAudioFeedback() {
  const audioContextRef = useRef<AudioContext | undefined>(undefined);

  return useCallback((feedback: AudioFeedback) => {
    const audioWindow = window as Window & {
      AudioContext?: typeof AudioContext;
    };
    const AudioContextConstructor = audioWindow.AudioContext;

    if (AudioContextConstructor === undefined) {
      return;
    }

    const audioContext = audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = audioContext;

    const tone = toneByFeedback[feedback];
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startsAt = audioContext.currentTime;

    oscillator.frequency.value = tone.frequency;
    oscillator.type = feedback === 'incorrect' ? 'square' : 'sine';
    gain.gain.setValueAtTime(0.0001, startsAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startsAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + tone.duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + tone.duration);
  }, []);
}
