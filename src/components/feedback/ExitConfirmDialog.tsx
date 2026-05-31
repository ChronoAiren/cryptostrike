import React from 'react';

interface ExitConfirmProps {
  visible: boolean;
  onStay: () => void;
  onExit: () => void;
}

export const ExitConfirmDialog: React.FC<ExitConfirmProps> = ({ visible, onStay, onExit }) => {
  if (!visible) return null;

  return (
    <div
      onClick={onStay}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 8000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-dim)',
          borderRadius: '16px',
          padding: '24px 20px 18px',
          width: '280px',
          maxWidth: '85vw',
          animation: 'popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '28px', lineHeight: 1 }}>🚪</div>

        <div style={{
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: 'var(--font-accent)',
          letterSpacing: '1px',
          color: 'var(--text-primary)',
        }}>
          EXIT BATTLE?
        </div>

        <div style={{
          fontSize: '10px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          lineHeight: 1.4,
          fontFamily: 'var(--font-main)',
        }}>
          Progress in this round will be lost. Your fighter won't gain rewards.
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          width: '100%',
          marginTop: '6px',
        }}>
          <button
            onClick={onStay}
            style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)',
              border: '1.5px solid var(--border-dim)',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '1px',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            STAY
          </button>

          <button
            onClick={onExit}
            style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(255, 100, 100, 0.12)',
              color: '#FF6B6B',
              border: '1.5px solid rgba(255, 100, 100, 0.25)',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '1px',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 100, 100, 0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 100, 100, 0.12)'; }}
          >
            EXIT
          </button>
        </div>
      </div>
    </div>
  );
};
