import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../../context/GameStateContext';
import { WEARABLES, WEARABLE_CATEGORIES, OVERLAY_SPRITES } from '../../data/wearables';
import type { WearableCategory } from '../../data/wearables';

const FRAME_W = 16;
const FRAME_H = 20;
const COLS = 3;

type Direction = 'front' | 'left' | 'right' | 'back';
const DIRECTION_ROW: Record<Direction, number> = { front: 0, left: 1, right: 2, back: 3 };

const spriteSrc: Record<string, string> = { ...OVERLAY_SPRITES };

const SpriteThumb: React.FC<{ src: string; size: number }> = ({ src, size }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, 16, 20, 0, 0, size, size);
    };
    img.src = src;
    return () => { img.onload = null; img.onerror = null; };
  }, [src, size]);
  return <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block', imageRendering: 'pixelated', borderRadius: '6px' }} />;
};

const SIZE_MAX = 160;
const SIZE_MIN = 80;
const SCROLL_RANGE = 300; // px of scroll to go from max to min

function clampSize(scrollTop: number): number {
  return Math.max(SIZE_MIN, SIZE_MAX - (scrollTop / SCROLL_RANGE) * (SIZE_MAX - SIZE_MIN));
}

function parseStatBonus(bonus: string): { atk: number; def: number; spd: number } {
  const atk = bonus.includes('%') && bonus.includes('ATK') ? parseInt(bonus) || 0 : 0;
  const def = bonus.includes('%') && bonus.includes('DEF') ? parseInt(bonus) || 0 : 0;
  const spd = bonus.includes('SPD') ? parseInt(bonus) || 0 : 0;
  return { atk, def, spd };
}

function sumStats(items: string[]): { atk: number; def: number; spd: number } {
  const total = { atk: 0, def: 0, spd: 0 };
  items.forEach(id => {
    const w = WEARABLES.find(x => x.id === id);
    if (w) {
      const s = parseStatBonus(w.statBonus);
      total.atk += s.atk;
      total.def += s.def;
      total.spd += s.spd;
    }
  });
  return total;
}

const PlainSprite: React.FC<{ size: number; direction: Direction; overlaySources: string[]; characterKey?: string }> = ({ size, direction, overlaySources, characterKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);
  const [error, setError] = useState(false);
  const overlayRefs = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    setError(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const src = characterKey ? `/sprites/character_${characterKey}.png` : '/sprites/character_plain.png';
    img.onload = () => { baseRef.current = img; };
    img.onerror = () => setError(true);
    img.src = src;
    return () => { img.onload = null; img.onerror = null; };
  }, [characterKey]);

  useEffect(() => {
    const map = new Map<string, HTMLImageElement>();
    overlaySources.forEach(src => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        map.set(src, img);
        overlayRefs.current = new Map(map);
      };
      img.onerror = () => {};
      img.src = src;
    });
    return () => { overlayRefs.current = new Map(); };
  }, [overlaySources]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const fps = 6;
    const frameDuration = 1000 / fps;
    let rafId: number;
    let lastTime: number | null = null;
    let accumulated = 0;
    let currentFrame = 0;

    const draw = (fi: number) => {
      const base = baseRef.current;
      if (!base) return;
      ctx.clearRect(0, 0, FRAME_W, FRAME_H);
      const actualCols = Math.max(1, Math.floor(base.width / FRAME_W));
      const srcX = Math.min(fi, actualCols - 1) * FRAME_W;
      const srcY = DIRECTION_ROW[direction] * FRAME_H;
      ctx.drawImage(base, srcX, srcY, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
      overlayRefs.current.forEach(ov => {
        const ovCols = Math.max(1, Math.floor(ov.width / FRAME_W));
        ctx.drawImage(ov, Math.min(fi, ovCols - 1) * FRAME_W, srcY, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
      });
    };

    const tick = (now: number) => {
      if (lastTime === null) lastTime = now;
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;
      accumulated += delta;
      while (accumulated >= frameDuration) {
        accumulated -= frameDuration;
        currentFrame = (currentFrame + 1) % COLS;
      }
      draw(currentFrame);
      rafId = requestAnimationFrame(tick);
    };

    currentFrame = 0;
    accumulated = 0;
    lastTime = null;
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [direction, overlaySources]);

  if (error) {
    return <div style={{ width: size, height: size, background: '#ff0000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, borderRadius: 8 }}>Err</div>;
  }

  return (
    <div style={{ width: size, height: size, overflow: 'hidden', flexShrink: 0 }}>
      <canvas ref={canvasRef} width={FRAME_W} height={FRAME_H} style={{ display: 'block', width: size, height: size, imageRendering: 'pixelated' }} />
    </div>
  );
};

export const MyCharacterScreen: React.FC = () => {
  const { user, toggleCosmeticItem, setScreen } = useGame();
  const equipped = user.cosmeticItems;
  const owned = user.purchasedItems;
  const [activeTab, setActiveTab] = useState<WearableCategory>('head');
  const [direction, setDirection] = useState<Direction>('front');
  const [spriteSize, setSpriteSize] = useState(SIZE_MAX);
  const scrollRef = useRef<HTMLDivElement>(null);

  const gearStats = sumStats(equipped);
  const baseAtk = user.baseAtk;
  const baseDef = Math.round(user.baseDef * 100);
  const baseSpd = user.baseSpd;
  const gearAtk = gearStats.atk;
  const gearDef = gearStats.def;
  const gearSpd = gearStats.spd;
  const totalAtk = baseAtk + gearAtk / 100;
  const totalDef = baseDef + gearDef;
  const totalSpd = baseSpd + gearSpd;

  const tabItems = WEARABLES.filter(w => w.category === activeTab && owned.includes(w.id));

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setSpriteSize(clampSize(el.scrollTop));
  }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':    setDirection('back'); break;
      case 'ArrowDown':  setDirection('front'); break;
      case 'ArrowLeft':  setDirection('left'); break;
      case 'ArrowRight': setDirection('right'); break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 229, 177, 0.06) 0%, transparent 70%)', top: '-15%', right: '-20%', animation: 'pulse 5s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(243, 195, 125, 0.05) 0%, transparent 70%)', bottom: '-10%', left: '-15%', animation: 'pulse 6s ease-in-out infinite 1.5s', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '340px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px 14px', gap: '10px', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-accent)', fontWeight: 700, letterSpacing: '2px', background: 'linear-gradient(135deg, #F3C37D, #93E5B1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            MY CHARACTER
          </h2>
        </div>

        {/* Scrollable content area */}
        <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0, paddingRight: '2px' }}>

          {/* Sprite preview */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '240px', transition: 'padding 0.15s ease' }}>
              <div style={{ transition: 'width 0.15s ease, height 0.15s ease' }}>
                <PlainSprite size={spriteSize} direction={direction} overlaySources={equipped.filter(id => OVERLAY_SPRITES[id]).map(id => OVERLAY_SPRITES[id])} />
              </div>

              {/* Username */}
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px' }}>
                {user.avatar} {user.username.toUpperCase()}
              </div>

              {/* D-pad */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <button onClick={() => setDirection('back')} style={{ background: direction === 'back' ? 'rgba(243,195,125,0.15)' : 'rgba(255,255,255,0.04)', border: direction === 'back' ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.08)', borderRadius: '6px', width: '30px', height: '24px', cursor: 'pointer', fontSize: '11px', color: direction === 'back' ? 'var(--color-gold)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}>
                  ↑
                </button>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button onClick={() => setDirection('left')} style={{ background: direction === 'left' ? 'rgba(243,195,125,0.15)' : 'rgba(255,255,255,0.04)', border: direction === 'left' ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.08)', borderRadius: '6px', width: '30px', height: '24px', cursor: 'pointer', fontSize: '11px', color: direction === 'left' ? 'var(--color-gold)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}>
                    ←
                  </button>
                  <button onClick={() => setDirection('front')} style={{ background: direction === 'front' ? 'rgba(243,195,125,0.15)' : 'rgba(255,255,255,0.04)', border: direction === 'front' ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.08)', borderRadius: '6px', width: '30px', height: '24px', cursor: 'pointer', fontSize: '11px', color: direction === 'front' ? 'var(--color-gold)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}>
                    ↓
                  </button>
                  <button onClick={() => setDirection('right')} style={{ background: direction === 'right' ? 'rgba(243,195,125,0.15)' : 'rgba(255,255,255,0.04)', border: direction === 'right' ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.08)', borderRadius: '6px', width: '30px', height: '24px', cursor: 'pointer', fontSize: '11px', color: direction === 'right' ? 'var(--color-gold)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}>
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats preview */}
          <div style={{ flexShrink: 0, display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'HP', base: user.baseHp, bonus: 0, total: user.baseHp, color: '#6EE7A0', fmt: (v: number) => `${v}` },
              { label: 'ATK', base: baseAtk, bonus: gearAtk, total: totalAtk, color: 'var(--color-coral)', fmt: (v: number) => v.toFixed(2) },
              { label: 'DEF', base: baseDef, bonus: gearDef, total: totalDef, color: 'var(--color-periwinkle)', fmt: (v: number) => `${v}%` },
              { label: 'SPD', base: baseSpd, bonus: gearSpd, total: totalSpd, color: 'var(--color-mint)', fmt: (v: number) => `${v}` },
              { label: 'LCK', base: user.baseLk, bonus: 0, total: user.baseLk, color: 'var(--color-gold)', fmt: (v: number) => `${v}` },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '6px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', minWidth: '48px' }}>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-pixel)', color: s.color, letterSpacing: '0.5px' }}>{s.label}</span>
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-accent)', fontWeight: 700, color: s.color }}>
                  {s.fmt(s.total)}
                </span>
                <span style={{ fontSize: '7px', color: 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>
                  {s.fmt(s.base)}{s.bonus > 0 ? ` +${s.label === 'ATK' ? (s.bonus / 100).toFixed(2) : s.bonus}` : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {WEARABLE_CATEGORIES.map(cat => {
              const catEquipped = equipped.filter(id => {
                const w = WEARABLES.find(x => x.id === id);
                return w && w.category === cat.key;
              });
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: activeTab === cat.key ? 'rgba(243,195,125,0.08)' : 'rgba(255,255,255,0.02)',
                    border: activeTab === cat.key ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                  <span style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px', color: activeTab === cat.key ? 'var(--color-gold)' : 'var(--text-muted)' }}>
                    {cat.label}
                  </span>
                  {catEquipped.length > 0 && (
                    <span style={{ fontSize: '7px', color: 'var(--color-mint)', fontWeight: 600 }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Item list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '4px' }}>
            {tabItems.length === 0 ? (
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '20px', fontFamily: 'var(--font-main)' }}>
                No {activeTab} items owned
              </div>
            ) : (
              tabItems.map(w => {
                const isEq = equipped.includes(w.id);
                const hasSprite = OVERLAY_SPRITES[w.id];
                return (
                  <div
                    key={w.id}
                    onClick={() => toggleCosmeticItem(w.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: isEq ? 'rgba(243,195,125,0.06)' : 'rgba(255,255,255,0.02)',
                      border: isEq ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px', padding: '8px 12px',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ background: 'rgba(0,0,0,0.12)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {hasSprite ? (
                        <SpriteThumb src={spriteSrc[w.id]} size={36} />
                      ) : (
                        <span style={{ fontSize: '18px' }}>{w.emoji}</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.3px' }}>{w.name}</div>
                      <div style={{ fontSize: '7px', color: 'var(--color-mint)', marginTop: '1px', fontWeight: 600 }}>{w.statBonus}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: isEq ? 'var(--color-gold)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                      {isEq ? '✓' : '○'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sticky bottom buttons */}
        <div style={{ flexShrink: 0, display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => setScreen('items')}
            style={{
              width: '48px', height: '48px',
              background: 'rgba(255,255,255,0.03)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(243,195,125,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            title="Go to Items"
          >
            🎒
          </button>
          <button onClick={() => setScreen('home')} style={{ flex: 1, maxWidth: '160px', padding: '12px 0', background: 'linear-gradient(135deg, #F3C37D 0%, #D4A04A 100%)', color: '#0a0a1a', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-accent)', letterSpacing: '1.5px' }}>
            HOME
          </button>
        </div>
      </div>
    </div>
  );
};
