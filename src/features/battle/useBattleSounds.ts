import { useRef, useCallback } from 'react';

const BASE = '/battle_sound';

// Each action type maps to a subdirectory containing {action}_start.wav and {action}_end.wav
const SOUND_DIRS: Record<string, string> = {
  attack: 'attack_vfx',
  defense: 'defense_vfx',
  buff: 'buff_vfx',
  debuff: 'debuff_vfx',
  heal: 'heal_vfx',
};

export function useBattleSounds() {
  const cache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const volumeRef = useRef(0.5);

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
  }, []);

  const getAudio = useCallback((key: string): HTMLAudioElement | null => {
    let a = cache.current.get(key);
    if (!a) {
      const path = `${BASE}/${key}`;
      a = new Audio(path);
      a.preload = 'auto';
      cache.current.set(key, a);
    }
    a.currentTime = 0;
    a.volume = volumeRef.current;
    return a;
  }, []);

  const play = useCallback((action: string, phase: 'start' | 'end') => {
    const dir = SOUND_DIRS[action];
    if (!dir) return;
    const key = `${dir}/${action}_${phase}.wav`;
    const a = getAudio(key);
    if (a) a.play().catch(() => {});
  }, [getAudio]);

  return { play, setVolume };
}
