import React, { useState, useEffect, useRef } from 'react';
import type { SpriteState } from '../../types/game';
import {
  SPRITE_MANIFEST,
  getBodySheetPath,
  getFrameCount,
  getFps,
} from '../../data/spriteManifest';

// Fixed pixel dimensions for a single sprite frame
const FRAME_W = 16;
const FRAME_H = 20;

// Maps pose to the row index in the 48×80 spritesheet (3 cols × 4 rows of 16×20)
// Row layout: 0=front, 1=left, 2=right, 3=back
// Player (left side) faces right via row 2; enemy (right side) is CSS-flipped to face left
const POSE_ROW_MAP: Record<string, number> = {
  idle: 0,
  victory: 0,
  attack: 2,
  defend: 0,
  hurt: 3,
};

export interface FighterSpriteProps {
  characterKey: string;
  equippedItems?: string[];
  overlaySources?: string[];
  pose?: SpriteState;
  frame?: number;
  playing?: boolean;
  loop?: boolean;
  isEnemy?: boolean;
  flipX?: boolean;
  status?: 'buffed' | 'debuffed' | 'none';
  size?: number;
  className?: string;
  impact?: boolean;
}

// ─── Internal canvas-driven sprite ───────────────────────────────────────────
// Owns its own rAF loop. Never triggers React re-renders for frame changes,
// which eliminates the clear→draw gap that caused visible blinking.
const ReferenceSprite: React.FC<{
  src: string;
  pose: SpriteState;
  externalFrame?: number;
  playing: boolean;
  loop: boolean;
  displaySize: number;
  flipX: boolean;
  overlaySources?: string[];
}> = ({ src, pose, externalFrame, playing, loop, displaySize, flipX, overlaySources = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const overlayImgRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imageError, setImageError] = useState(false);

  // Load base sprite
  useEffect(() => {
    setImageError(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
    };
    img.onerror = () => {
      setImageError(true);
    };
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Load overlay sprites
  useEffect(() => {
    const map = new Map<string, HTMLImageElement>();
    overlaySources.forEach(ovSrc => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        map.set(ovSrc, img);
        overlayImgRefs.current = new Map(map);
      };
      img.onerror = () => {};
      img.src = ovSrc;
    });
    return () => { overlayImgRefs.current = new Map(); };
  }, [overlaySources]);

  // Single rAF loop — draws directly to canvas, zero React state updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp pixel art — disable anti-aliasing once
    ctx.imageSmoothingEnabled = false;

    const frameCount = getFrameCount(pose);
    const fps = getFps(pose);
    const frameDuration = 1000 / fps;

    let rafId: number;
    let lastTime: number | null = null;
    let accumulated = 0;
    let currentFrame = 0;

    const draw = (frameIndex: number) => {
      const img = imgRef.current;
      if (!img) return;
      const actualCols = Math.max(1, Math.floor(img.width / FRAME_W));
      const poseRow = POSE_ROW_MAP[pose] ?? 0;
      const col = frameIndex % actualCols;
      const srcX = col * FRAME_W;
      const srcY = poseRow * FRAME_H;
      ctx.clearRect(0, 0, FRAME_W, FRAME_H);
      ctx.drawImage(img, srcX, srcY, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
      overlayImgRefs.current.forEach(ov => {
        const ovCols = Math.max(1, Math.floor(ov.width / FRAME_W));
        ctx.drawImage(ov, Math.min(frameIndex, ovCols - 1) * FRAME_W, srcY, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
      });
    };

    const tick = (now: number) => {
      // If an external frame is pinned, just draw it and stop
      if (externalFrame !== undefined) {
        draw(externalFrame % frameCount);
        return;
      }

      if (lastTime === null) lastTime = now;
      // Clamp delta to 100ms so a tab-switch doesn't skip many frames at once
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;

      if (playing) {
        accumulated += delta;
        while (accumulated >= frameDuration) {
          accumulated -= frameDuration;
          currentFrame++;
          if (currentFrame >= frameCount) {
            if (loop) {
              currentFrame = 0;
            } else {
              currentFrame = frameCount - 1;
            }
          }
        }
      }

      draw(currentFrame);
      rafId = requestAnimationFrame(tick);
    };

    // Reset frame on pose change
    currentFrame = 0;
    accumulated = 0;
    lastTime = null;

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [src, pose, playing, loop, externalFrame, overlaySources]);

  if (imageError) {
    return (
      <div
        style={{
          width: displaySize,
          height: displaySize,
          background: '#ff0000',
          color: 'white',
          fontSize: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Err
      </div>
    );
  }

  return (
    <div
      style={{
        width: displaySize,
        height: displaySize,
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
          width: displaySize,
          height: displaySize,
          imageRendering: 'pixelated',
          transform: flipX ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
};

// ─── Public FighterSprite ─────────────────────────────────────────────────────
export const FighterSprite: React.FC<FighterSpriteProps> = ({
  characterKey,
  equippedItems = [],
  overlaySources = [],
  pose = 'idle',
  frame: externalFrame,
  playing = true,
  loop = true,
  isEnemy = false,
  flipX,
  status = 'none',
  size = 120,
  className = '',
  impact = false,
}) => {
  const shouldFlip = flipX ?? isEnemy;
  const useReferenceSprite = SPRITE_MANIFEST.useReferenceSprite === true;
  const spriteSrc = getBodySheetPath(characterKey, pose);

  return (
    <div
      className={`fighter-sprite ${className}`.trim()}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        overflow: 'hidden',
        ...(impact ? { animation: 'sprite-impact 0.3s ease-in-out' } : {}),
      }}
    >
      {/* Status glow rings */}
      {status === 'buffed' && (
        <div
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(147, 229, 177, 0.3) 0%, transparent 70%)',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
      )}
      {status === 'debuffed' && (
        <div
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 155, 155, 0.3) 0%, transparent 70%)',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {useReferenceSprite ? (
          <ReferenceSprite
            src={spriteSrc}
            pose={pose}
            externalFrame={externalFrame}
            playing={playing}
            loop={loop}
            displaySize={size}
            flipX={shouldFlip}
            overlaySources={overlaySources}
          />
        ) : (
          <div
            style={{
              fontSize: size * 0.6,
              lineHeight: 1,
              transform: shouldFlip ? 'scaleX(-1)' : undefined,
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            }}
          >
            ❓
          </div>
        )}
      </div>

      {/* Equipment badge */}
      {equippedItems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            left: -8,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            border: '2px solid #fff',
          }}
        >
          {equippedItems.length}
        </div>
      )}
    </div>
  );
};
