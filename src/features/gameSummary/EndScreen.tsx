import React from 'react';
import { useGame } from '../../context/GameStateContext';

export const EndScreen: React.FC = () => {
  const {
    winRecord, round, correctTradesCount, totalTradesCount, damageDealtCount,
    enemyState, user, restartGame, changeClass, goHome,
  } = useGame();

  const isWin = winRecord === true;
  const accuracy = totalTradesCount > 0 ? Math.round((correctTradesCount / totalTradesCount) * 100) : 0;
  const goldReward = isWin ? 50 + round * 10 : 0;
  const xpReward = isWin ? 100 + round * 10 : 25;

  return (
    <div style={{
      height: '100%', background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', textAlign: 'center', position: 'relative', overflow: 'auto',
    }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 229, 177, 0.06) 0%, transparent 70%)', top: '-15%', right: '-20%', animation: 'pulse 5s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(243, 195, 125, 0.05) 0%, transparent 70%)', bottom: '-10%', left: '-15%', animation: 'pulse 6s ease-in-out infinite 1.5s', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', letterSpacing: '1px', marginBottom: '10px' }}>
          {user.avatar} {user.username.toUpperCase()}
        </div>

        <div style={{ fontSize: '64px', marginBottom: '6px', lineHeight: 1, animation: 'popIn 0.4s cubic-bezier(.34,1.56,.64,1)' }}>{isWin ? '🏆' : '💀'}</div>

        <h1 style={{
          fontSize: '28px', fontFamily: 'var(--font-accent)', letterSpacing: '3px', marginBottom: '4px',
          background: isWin ? 'linear-gradient(135deg, #F3C37D, #93E5B1)' : 'none',
          WebkitBackgroundClip: isWin ? 'text' : 'unset',
          WebkitTextFillColor: isWin ? 'transparent' : 'unset',
          backgroundClip: isWin ? 'text' : 'unset',
          color: isWin ? 'transparent' : 'var(--text-secondary)',
        }}>
          {isWin ? 'VICTORY!' : 'DEFEATED'}
        </h1>

        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {isWin ? `You defeated ${enemyState?.name || 'the opponent'}!` : `${enemyState?.name || 'The opponent'} won this match.`}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px', width: '100%' }}>
          {[
            { v: round, l: 'Rounds', c: 'var(--color-gold)' },
            { v: accuracy + '%', l: 'Accuracy', c: 'var(--color-mint)' },
            { v: damageDealtCount, l: 'Dmg Dealt', c: 'var(--color-coral)' },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 4px' }}>
              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '18px', fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '12px 16px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>💰 Gold earned:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>+{goldReward}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>⭐ XP earned:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-mint)' }}>+{xpReward}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Accuracy Rating:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>
              {accuracy >= 80 ? 'EXPERT' : accuracy >= 50 ? 'TRADER' : 'HODLER'}
            </span>
          </div>
        </div>

        <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '10px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {[
            { v: user.gamesPlayed, l: 'GAMES', c: 'var(--color-gold)' },
            { v: user.wins, l: 'WINS', c: 'var(--color-mint)' },
            { v: user.totalDamage, l: 'DAMAGE', c: 'var(--color-coral)' },
            { v: user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) + '%' : '—', l: 'WIN RATE', c: 'var(--color-periwinkle)' },
          ].map(s => (
            <div key={s.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
              <span style={{ fontFamily: 'var(--font-accent)', fontSize: '14px', fontWeight: 700, color: s.c }}>{s.v}</span>
              <span style={{ fontSize: '6px', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px' }}>{s.l}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <button
            onClick={restartGame}
            style={{
              width: '100%', padding: '12px',
              background: 'linear-gradient(135deg, #F3C37D 0%, #D4A04A 100%)',
              color: '#0a0a1a', border: 'none', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-accent)', letterSpacing: '1.5px',
            }}
          >
            PLAY AGAIN
          </button>
          <button
            onClick={changeClass}
            style={{
              width: '100%', padding: '10px',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '12px',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-accent)', letterSpacing: '1px',
            }}
          >
            CHANGE FIGHTER
          </button>
          <button
            onClick={goHome}
            style={{
              width: '100%', padding: '10px',
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-main)',
            }}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
