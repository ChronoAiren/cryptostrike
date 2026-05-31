import { useEffect, useState, useRef } from 'react';
import type { SpriteState } from '../../types/game';
import { getFrameCount, getFps } from '../../data/spriteManifest';

interface UseSpriteAnimationOptions {
  pose: SpriteState;
  playing?: boolean;
  loop?: boolean;
  onComplete?: () => void;
}

/**
 * Advances sprite frame index using requestAnimationFrame for smooth,
 * drift-free animation. Falls back to correct fps timing without setInterval drift.
 */
export function useSpriteAnimation({
  pose,
  playing = true,
  loop = true,
  onComplete,
}: UseSpriteAnimationOptions) {
  const frameCount = getFrameCount(pose);
  const [frame, setFrame] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset to frame 0 when pose changes
  useEffect(() => {
    setFrame(0);
  }, [pose]);

  useEffect(() => {
    if (!playing) return;

    const fps = getFps(pose);
    const frameDuration = 1000 / fps; // ms per frame
    let rafId: number;
    let lastTime: number | null = null;
    let accumulated = 0;
    let currentFrame = 0;

    const tick = (now: number) => {
      if (lastTime === null) lastTime = now;
      const delta = now - lastTime;
      lastTime = now;
      accumulated += delta;

      // Advance frame(s) if enough time has passed
      while (accumulated >= frameDuration) {
        accumulated -= frameDuration;
        currentFrame++;
        if (currentFrame >= frameCount) {
          if (loop) {
            currentFrame = 0;
          } else {
            currentFrame = frameCount - 1;
            onCompleteRef.current?.();
            setFrame(currentFrame);
            return; // Stop the loop
          }
        }
        setFrame(currentFrame);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [pose, playing, loop, frameCount]);

  return { frame: Math.min(frame, frameCount - 1), frameCount };
}
