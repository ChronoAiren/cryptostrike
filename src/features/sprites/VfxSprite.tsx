import React, { useRef, useEffect, useState } from 'react';

const FRAME_W = 16;
const FRAME_H = 16;
const SHEET_PATH = '/vfx_sprites/universal_v1.png';

const ACTION_ROWS: Record<string, number> = {
  attack: 0,
  defense: 1,
  buff: 2,
  debuff: 3,
  heal: 4,
};

export interface VfxSpriteProps {
  action: 'attack' | 'defense' | 'buff' | 'debuff' | 'heal';
  playing?: boolean;
  loop?: boolean;
  size?: number;
  fps?: number;
  frameCount?: number;
  onComplete?: () => void;
}

export const VfxSprite: React.FC<VfxSpriteProps> = ({
  action,
  playing = true,
  loop = false,
  size = 64,
  fps = 12,
  frameCount = 10,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
    };
    img.onerror = () => {
      setImageError(true);
      console.error('Failed to load VFX spritesheet:', SHEET_PATH);
    };
    img.src = SHEET_PATH;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const row = ACTION_ROWS[action] ?? 0;
    const frameDuration = 1000 / fps;

    let rafId: number;
    let lastTime: number | null = null;
    let accumulated = 0;
    let currentFrame = 0;
    let completed = false;

    const draw = (frameIndex: number) => {
      const img = imgRef.current;
      if (!img) return;

      ctx.clearRect(0, 0, FRAME_W, FRAME_H);
      if (!img) {
        // DEBUG: show colored box when image not loaded
        ctx.fillStyle = '#0f08';
        ctx.fillRect(0, 0, FRAME_W, FRAME_H);
        return;
      }

      const srcX = frameIndex * FRAME_W;
      const srcY = row * FRAME_H;
      ctx.drawImage(img, srcX, srcY, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
    };

    const tick = (now: number) => {
      if (lastTime === null) lastTime = now;
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;

      if (playing && !completed) {
        accumulated += delta;
        while (accumulated >= frameDuration) {
          accumulated -= frameDuration;
          currentFrame++;
          if (currentFrame >= frameCount) {
            if (loop) {
              currentFrame = 0;
            } else {
              currentFrame = frameCount - 1;
              completed = true;
              onComplete?.();
            }
          }
        }
      }

      draw(currentFrame);
      rafId = requestAnimationFrame(tick);
    };

    currentFrame = 0;
    accumulated = 0;
    lastTime = null;
    completed = false;

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [action, playing, loop, fps, frameCount, onComplete]);

  if (imageError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: '#300',
          color: '#f66',
          fontSize: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        VFX Err
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        width={FRAME_W}
        height={FRAME_H}
        style={{
          display: 'block',
          width: size,
          height: size,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};
