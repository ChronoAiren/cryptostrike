import React from 'react';
import { VfxSprite } from './VfxSprite';

export const VfxTestScreen: React.FC = () => {
  return (
    <div
      style={{
        padding: 24,
        background: '#111',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: 'monospace',
      }}
    >
      <h2>VFX Sprite Extraction Test</h2>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
        Each row shows a 10-frame animated strip from universal_v1.png (16×16 frames, scaled to 64px)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {(['attack', 'defense', 'buff', 'debuff', 'heal'] as const).map((action) => (
          <div
            key={action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#1a1a2e',
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #333',
            }}
          >
            <span
              style={{
                width: 80,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                  color:
                    action === 'attack'
                      ? '#EF4444'
                      : action === 'defense'
                        ? '#38BDF8'
                        : action === 'buff'
                          ? '#22C55E'
                          : action === 'debuff'
                            ? '#A855F7'
                            : '#34D399',
              }}
            >
              {action}
            </span>

            <span style={{ fontSize: 10, color: '#666', width: 80 }}>
              row {['attack', 'defense', 'buff', 'debuff', 'heal'].indexOf(action)} · 10 frames
            </span>

            <VfxSprite
              action={action}
              playing
              loop
              size={64}
              fps={12}
              frameCount={10}
            />

            <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <VfxSprite
                  key={i}
                  action={action}
                  playing={false}
                  frameCount={10}
                  size={32}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 32,
          padding: 12,
          background: '#1a1a2e',
          borderRadius: 8,
          border: '1px solid #333',
        }}
      >
        <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
          Source: <code>public/vfx_sprites/universal_v1.png</code>
        </p>
        <p style={{ fontSize: 11, color: '#888' }}>
          Layout: 1536×1024 · 96×64 grid of 16×16 frames
        </p>
      </div>
    </div>
  );
};
