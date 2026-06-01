import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameStateContext';
import { WEARABLES, WEARABLE_CATEGORIES } from '../../data/wearables';
import type { WearableCategory, WearableItem } from '../../data/wearables';
import { PurchaseModal } from '../../components/feedback/PurchaseModal';

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
  return <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block', imageRendering: 'pixelated', borderRadius: '8px' }} />;
};

const spriteItems = ['head1', 'body1', 'boots1', 'head2', 'body2', 'boots2'];
const spriteSrc: Record<string, string> = {
  head1: '/sprite_head/head_1.png',
  body1: '/sprite_body/body_1.png',
  boots1: '/sprite_shoes/shoes_1.png',
  head2: '/sprite_head/head_2.png',
  body2: '/sprite_body/body_2.png',
  boots2: '/sprite_shoes/shoes_2.png',
};

export const ItemsScreen: React.FC = () => {
  const { user, toggleCosmeticItem, purchaseItem, setScreen } = useGame();
  const { gold, gems } = user;
  const equipped = user.cosmeticItems;
  const owned = user.purchasedItems;
  const [activeTab, setActiveTab] = useState<WearableCategory>('head');
  const [buyTarget, setBuyTarget] = useState<WearableItem | null>(null);

  const filtered = WEARABLES.filter(w => w.category === activeTab);

  const ownedCount = owned.filter(id => WEARABLES.some(w => w.id === id)).length;

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)', display: 'flex', flexDirection: 'column', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 229, 177, 0.06) 0%, transparent 70%)', top: '-15%', right: '-20%', animation: 'pulse 5s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(243, 195, 125, 0.05) 0%, transparent 70%)', bottom: '-10%', left: '-15%', animation: 'pulse 6s ease-in-out infinite 1.5s', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '340px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-accent)', fontWeight: 700, letterSpacing: '2px', background: 'linear-gradient(135deg, #F3C37D, #93E5B1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ITEMS
          </h2>
        </div>

        {/* Currency / owned summary bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexShrink: 0, fontSize: '9px', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px' }}>
          <span>💰 <span style={{ color: 'var(--color-gold)' }}>{gold}</span></span>
          <span>💎 <span style={{ color: 'var(--color-purple)' }}>{gems}</span></span>
          <span>Owned: <span style={{ color: 'var(--color-mint)' }}>{ownedCount}</span>/{WEARABLES.length}</span>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {WEARABLE_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              style={{
                flex: 1, padding: '10px 0',
                background: activeTab === cat.key ? 'rgba(243,195,125,0.08)' : 'rgba(255,255,255,0.02)',
                border: activeTab === cat.key ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{cat.icon}</span>
              <span style={{ fontSize: '8px', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px', color: activeTab === cat.key ? 'var(--color-gold)' : 'var(--text-muted)' }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Items list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingBottom: '4px' }}>
          {filtered.map(w => {
            const isOwned = owned.includes(w.id);
            const isEq = equipped.includes(w.id);
            const isFree = w.price === 0;
            const canAfford = gold >= w.price;

            return (
              <div
                key={w.id}
                onClick={() => {
                  if (isOwned) toggleCosmeticItem(w.id);
                  else if (!isFree) setBuyTarget(w);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: isEq ? 'rgba(243,195,125,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isEq ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', padding: '12px 14px',
                  cursor: isOwned ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                  opacity: isOwned ? 1 : 0.5,
                }}
              >
                <div style={{ background: 'rgba(0,0,0,0.12)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {spriteItems.includes(w.id) ? (
                    <SpriteThumb src={spriteSrc[w.id]} size={44} />
                  ) : (
                    <span style={{ fontSize: '24px' }}>{w.emoji}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.3px' }}>{w.name}</div>
                  <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '1px', fontFamily: 'var(--font-main)' }}>{w.description}</div>
                  <div style={{ fontSize: '8px', color: 'var(--color-mint)', marginTop: '2px', fontWeight: 600, fontFamily: 'var(--font-accent)' }}>{w.statBonus}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {isOwned ? (
                    <div style={{ fontSize: '14px', color: isEq ? 'var(--color-gold)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                      {isEq ? '✓' : '○'}
                    </div>
                  ) : isFree ? (
                    <div style={{ fontSize: '8px', fontFamily: 'var(--font-pixel)', color: 'var(--color-mint)', background: 'rgba(147,229,177,0.15)', padding: '3px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                      FREE
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-accent)', fontWeight: 700, color: canAfford ? 'var(--color-gold)' : 'var(--color-coral)' }}>
                        💰{w.price}
                      </div>
                      <div style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 5px', borderRadius: '3px', letterSpacing: '0.3px' }}>
                        WIP
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', flexShrink: 0 }} />

        {/* Bottom buttons */}
        <div style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
          <button onClick={() => setScreen('home')} style={{ flex: 1, padding: '12px', background: 'transparent', color: 'var(--text-secondary)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-accent)', letterSpacing: '1.5px' }}>
            ← BACK
          </button>
          <button onClick={() => setScreen('myCharacter')} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #7B8FD4 0%, #5D6FA8 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-accent)', letterSpacing: '1.5px' }}>
            MY CHAR →
          </button>
        </div>
      </div>

      {buyTarget && (
        <PurchaseModal
          item={buyTarget}
          gold={gold}
          gems={gems}
          onBuy={(currency) => {
            purchaseItem(buyTarget.id, currency);
            setBuyTarget(null);
          }}
          onClose={() => setBuyTarget(null)}
        />
      )}
    </div>
  );
};
