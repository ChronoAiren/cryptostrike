import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameStateContext';
import { FighterSprite } from '../sprites/FighterSprite';
import { OVERLAY_SPRITES } from '../../data/wearables';

export const VSScreen: React.FC = () => {
  const { selectedClass, selectedCoin, playerState, enemyState, startBattle, user } = useGame();
  const [cd, setCd] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setCd((p) => {
        if (p <= 1) { clearInterval(t); startBattle(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [startBattle]);

  if (!selectedClass || !selectedCoin) return null;

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(243, 195, 125, 0.06) 0%, transparent 70%)', top: '-10%', left: '-15%', animation: 'pulse 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 229, 177, 0.05) 0%, transparent 70%)', bottom: '-10%', right: '-15%', animation: 'pulse 5s ease-in-out infinite 1s' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '400px', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FighterSprite
              characterKey={playerState?.spriteKey || 'char_one'}
              pose="idle"
              playing
              loop
              overlaySources={user.cosmeticItems.filter(id => OVERLAY_SPRITES[id]).map(id => OVERLAY_SPRITES[id])}
              size={80}
            />
            <div style={{ fontFamily: 'var(--font-accent)', fontSize: '15px', fontWeight: 700, color: 'var(--color-gold)', marginTop: '4px' }}>{user.username.toUpperCase()}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>{playerState?.name || 'Fighter'}</div>
          </div>

          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(16px, 4vw, 26px)', color: 'var(--color-gold)', textShadow: '0 0 30px rgba(243,195,125,.5)', animation: 'popIn .5s cubic-bezier(.34,1.56,.64,1) .1s both' }}>
            VS
          </div>

          <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FighterSprite
              characterKey={enemyState?.spriteKey || 'char_two'}
              pose="idle"
              playing
              loop
              isEnemy
              size={80}
            />
            <div style={{ fontFamily: 'var(--font-accent)', fontSize: '15px', fontWeight: 700, color: 'var(--color-coral)', marginTop: '4px' }}>{enemyState?.name || 'AI'}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>AI Opponent</div>
          </div>
        </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px solid rgba(243, 195, 125, 0.2)', borderRadius: '12px', padding: '10px 20px', textAlign: 'center', animation: 'fadeIn 0.6s ease 0.2s both', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--font-accent)', fontSize: '15px', fontWeight: 700, color: 'var(--color-gold)' }}>{selectedCoin.symbol}/USDT</div>
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Volatility: {selectedCoin.volatilityText} · ×{selectedCoin.multiplier} damage multiplier
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-secondary)', animation: 'fadeIn 0.6s ease 0.4s both', position: 'relative', zIndex: 1 }}>
        Starting in <span style={{ color: 'var(--color-gold)' }}>{cd}</span>s
      </div>

      <button
        onClick={startBattle}
        style={{
          width: '100%',
          maxWidth: '260px',
          padding: '12px',
          background: 'linear-gradient(135deg, #F3C37D 0%, #D4A04A 100%)',
          color: '#0a0a1a',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'var(--font-accent)',
          letterSpacing: '2px',
          animation: 'fadeIn 0.6s ease 0.5s both',
          position: 'relative',
          zIndex: 1,
        }}
      >
        FIGHT NOW
      </button>
    </div>
  );
};
