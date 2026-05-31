import React, { createContext, useContext, useRef } from 'react';

type SoundType =
  | 'select'
  | 'lock'
  | 'confirm'
  | 'hit'
  | 'crit'
  | 'correct'
  | 'wrong'
  | 'tick'
  | 'level'
  | 'buff'
  | 'buy'
  | 'ko'
  | 'cancel';

interface AudioContextProps {
  playSound: (type: SoundType) => void;
  initAudio: () => void;
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    // Resume if suspended (browser security policies)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type: SoundType) => {
    // Initialize lazily on user interaction if not already done
    initAudio();

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const t = ctx.currentTime;

      o.connect(g);
      g.connect(ctx.destination);

      const sounds: Record<
        SoundType,
        { f: number; f2: number; dur: number; shape: OscillatorType; vol: number }
      > = {
        select: { f: 440, f2: 550, dur: 0.08, shape: 'square', vol: 0.04 },
        lock: { f: 660, f2: 660, dur: 0.06, shape: 'square', vol: 0.05 },
        confirm: { f: 523, f2: 659, dur: 0.15, shape: 'sine', vol: 0.06 },
        hit: { f: 200, f2: 80, dur: 0.18, shape: 'sawtooth', vol: 0.08 },
        crit: { f: 880, f2: 220, dur: 0.3, shape: 'sawtooth', vol: 0.1 },
        correct: { f: 523, f2: 784, dur: 0.25, shape: 'sine', vol: 0.07 },
        wrong: { f: 200, f2: 120, dur: 0.2, shape: 'sawtooth', vol: 0.06 },
        tick: { f: 800, f2: 800, dur: 0.04, shape: 'square', vol: 0.03 },
        level: { f: 523, f2: 1047, dur: 0.4, shape: 'sine', vol: 0.08 },
        buff: { f: 659, f2: 880, dur: 0.2, shape: 'sine', vol: 0.06 },
        buy: { f: 440, f2: 659, dur: 0.12, shape: 'sine', vol: 0.05 },
        ko: { f: 150, f2: 50, dur: 0.5, shape: 'sawtooth', vol: 0.12 },
        cancel: { f: 300, f2: 150, dur: 0.15, shape: 'square', vol: 0.04 },
      };

      const s = sounds[type] || sounds.tick;
      o.type = s.shape;
      o.frequency.setValueAtTime(s.f, t);
      o.frequency.exponentialRampToValueAtTime(s.f2, t + s.dur);

      g.gain.setValueAtTime(s.vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + s.dur + 0.05);

      o.start(t);
      o.stop(t + s.dur + 0.1);
    } catch (e) {
      console.warn('Procedural audio playing error:', e);
    }
  };

  return (
    <AudioContext.Provider value={{ playSound, initAudio }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
