import React from 'react';
import { useGame } from '../../context/GameStateContext';

const MENU_ITEMS = [
  {
    key: 'vs',
    icon: '🤖',
    title: 'VS AI',
    subtitle: 'Quick battle against an AI opponent',
    gradient: 'linear-gradient(135deg, #F3C37D 0%, #D4A04A 100%)',
    glow: 'rgba(243, 195, 125, 0.25)',
  },
  {
    key: 'campaign',
    icon: '🗺️',
    title: 'CAMPAIGN',
    subtitle: 'Story-driven adventure mode',
    gradient: 'linear-gradient(135deg, #5D597A 0%, #3D3960 100%)',
    glow: 'rgba(93, 89, 122, 0.25)',
    disabled: true,
  },
  {
    key: 'myCharacter',
    icon: '🎨',
    title: 'MY CHARACTER',
    subtitle: 'Dress up your fighter with gear',
    gradient: 'linear-gradient(135deg, #7B8FD4 0%, #5D6FA8 100%)',
    glow: 'rgba(123, 143, 212, 0.25)',
  },
  {
    key: 'items',
    icon: '📦',
    title: 'ITEMS',
    subtitle: 'Browse wearables — head, body & boots',
    gradient: 'linear-gradient(135deg, #93E5B1 0%, #6BC48A 100%)',
    glow: 'rgba(147, 229, 177, 0.25)',
  },
];

export const HomeScreen: React.FC = () => {
  const { user, setScreen } = useGame();

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }} />

      {/* Gradient orbs */}
      <div style={{
        position: 'absolute',
        width: '280px', height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147, 229, 177, 0.06) 0%, transparent 70%)',
        top: '-15%', right: '-20%',
        animation: 'pulse 5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '200px', height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(243, 195, 125, 0.05) 0%, transparent 70%)',
        bottom: '-10%', left: '-15%',
        animation: 'pulse 6s ease-in-out infinite 1.5s',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '340px',
        flex: 1,
      }}>
        {/* Title */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '32px',
          marginTop: '8px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '6px', lineHeight: 1 }}>⚔️</div>
          <h1 style={{
            fontSize: '24px',
            fontFamily: 'var(--font-accent)',
            fontWeight: 700,
            letterSpacing: '4px',
            background: 'linear-gradient(135deg, #F3C37D 0%, #93E5B1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '2px',
          }}>
            CRYPTOSTRIKE
          </h1>
          <div
            onClick={() => setScreen('profile')}
            style={{
              fontSize: '9px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-pixel)',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {user.avatar} {user.username.toUpperCase()}
          </div>
        </div>

        {/* Balance bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px', flexShrink: 0,
          fontSize: '10px', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px', padding: '8px 16px', margin: '0 auto 4px',
          width: 'fit-content', maxWidth: '100%',
        }}>
          <span>💰 <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontFamily: 'var(--font-accent)' }}>{user.gold}</span></span>
          <span>💎 <span style={{ color: 'var(--color-purple)', fontWeight: 700, fontFamily: 'var(--font-accent)' }}>{user.gems}</span></span>
        </div>

        {/* Menu items */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          flex: 1,
          justifyContent: 'center',
        }}>
          {MENU_ITEMS.map((item, i) => {
            const disabled = item.disabled;
            return (
              <div
                key={item.key}
                onClick={disabled ? undefined : () => item.key === 'myCharacter' ? setScreen('myCharacter') : item.key === 'items' ? setScreen('items') : setScreen('classSelect')}
                style={{
                  background: disabled
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.03)',
                  border: disabled
                    ? '1.5px solid rgba(255,255,255,0.05)'
                    : '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                  opacity: disabled ? 0.45 : 1,
                  animation: `slideUp 0.4s ease ${0.1 + i * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (disabled) return;
                  e.currentTarget.style.borderColor = 'rgba(243, 195, 125, 0.25)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  if (disabled) return;
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                {/* Icon */}
                <div style={{
                  fontSize: '28px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: disabled
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-accent)',
                    letterSpacing: '1.5px',
                    color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
                    marginBottom: '2px',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-main)',
                  }}>
                    {item.subtitle}
                  </div>
                </div>

                {/* Arrow / badge */}
                {disabled ? (
                  <div style={{
                    fontSize: '7px',
                    fontFamily: 'var(--font-pixel)',
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}>
                    WIP
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-gold)', fontSize: '16px' }}>→</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick stats strip */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          padding: '16px 0',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          marginTop: 'auto',
          animation: 'fadeIn 0.6s ease 0.5s both',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-accent)', fontSize: '16px', fontWeight: 700, color: 'var(--color-gold)' }}>
              {user.gamesPlayed}
            </div>
            <div style={{ fontSize: '7px', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px', marginTop: '2px' }}>
              GAMES
            </div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-accent)', fontSize: '16px', fontWeight: 700, color: 'var(--color-mint)' }}>
              {user.wins}
            </div>
            <div style={{ fontSize: '7px', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px', marginTop: '2px' }}>
              WINS
            </div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-accent)', fontSize: '16px', fontWeight: 700, color: 'var(--color-coral)' }}>
              {user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) + '%' : '—'}
            </div>
            <div style={{ fontSize: '7px', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px', marginTop: '2px' }}>
              WIN RATE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
