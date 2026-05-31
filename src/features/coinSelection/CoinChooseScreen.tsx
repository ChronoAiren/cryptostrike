import React from 'react';
import { useGame, COINS } from '../../context/GameStateContext';

const volStyles: Record<string, { color: string; bg: string }> = {
  LOW: { color: 'var(--color-mint)', bg: 'rgba(147, 229, 177, 0.12)' },
  MEDIUM: { color: 'var(--color-gold)', bg: 'rgba(243, 195, 125, 0.12)' },
  HIGH: { color: '#FFAE7B', bg: 'rgba(255, 174, 123, 0.12)' },
  EXTREME: { color: 'var(--color-coral)', bg: 'rgba(255, 155, 155, 0.12)' },
};

export const CoinChooseScreen: React.FC = () => {
  const { selectedCoin, selectCoin, goToVS, goToItemEquip } = useGame();

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)', display: 'flex', flexDirection: 'column', padding: '20px 16px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 229, 177, 0.06) 0%, transparent 70%)', top: '-15%', right: '-20%', animation: 'pulse 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(243, 195, 125, 0.05) 0%, transparent 70%)', bottom: '-10%', left: '-15%', animation: 'pulse 6s ease-in-out infinite 1.5s' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ marginBottom: '14px', flexShrink: 0 }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-accent)', letterSpacing: '2px', background: 'linear-gradient(135deg, #F3C37D, #93E5B1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
            Choose Your Coin
          </h2>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            Mirror Match — both you and the AI trade the same price updates.
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '10px' }}>
          {COINS.map((c) => {
            const isSelected = selectedCoin?.id === c.id;
            const vs = volStyles[c.volatilityText] || { color: '#FFF', bg: 'rgba(255,255,255,0.1)' };
            return (
              <div
                key={c.id}
                onClick={() => selectCoin(c)}
                style={{
                  background: isSelected ? 'rgba(243,195,125,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isSelected ? '1.5px solid var(--color-gold)' : '1.5px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '22px', background: 'rgba(0,0,0,0.15)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'var(--color-gold)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                  {c.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--font-accent)', margin: 0 }}>
                    {c.name} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({c.symbol})</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                    <span style={{ fontSize: '8px', color: vs.color, backgroundColor: vs.bg, padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>
                      VOL: {c.volatilityText}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-accent)', fontSize: '16px', fontWeight: 700, color: 'var(--color-gold)' }}>
                    ×{c.multiplier.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>Dmg Mult</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flexShrink: 0, paddingTop: '10px', display: 'flex', gap: '8px' }}>
          <button
            onClick={goToItemEquip}
            style={{
              flex: 1, padding: '12px',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-accent)', letterSpacing: '1.5px',
            }}
          >
            ← BACK
          </button>
          <button
            onClick={goToVS}
            disabled={!selectedCoin}
            style={{
              flex: 1, padding: '12px',
              background: selectedCoin ? 'linear-gradient(135deg, #F3C37D 0%, #D4A04A 100%)' : 'rgba(255,255,255,0.04)',
              color: selectedCoin ? '#0a0a1a' : 'var(--text-muted)',
              border: 'none', borderRadius: '12px',
              fontSize: '13px', fontWeight: 700,
              cursor: selectedCoin ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-accent)', letterSpacing: '1.5px',
              opacity: selectedCoin ? 1 : 0.5,
            }}
          >
            ENTER BATTLE →
          </button>
        </div>
      </div>
    </div>
  );
};
