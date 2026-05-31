import React, { useState } from 'react';
import { useGame } from '../../context/GameStateContext';

const FEATURES = [
  { icon: '📊', title: 'Real-Time Markets', desc: 'Predict crypto price moves to power your attacks' },
  { icon: '⚔️', title: 'Turn-Based Combat', desc: 'Use CALL, PUT, or HOLD as your battle actions' },
  { icon: '🎭', title: '6 Unique Classes', desc: 'Each with a distinct passive and playstyle' },
  { icon: '🛡️', title: 'Gear & Items', desc: 'Equip gear and use active items mid-battle' },
];

export const WelcomeScreen: React.FC = () => {
  const { setUsername } = useGame();
  const [name, setName] = useState('');
  const [step, setStep] = useState<'intro' | 'name'>('intro');
  const [submitting, setSubmitting] = useState(false);

  const handleStart = () => {
    setStep('name');
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 16) return;
    setSubmitting(true);
    // brief artificial delay to feel intentional
    setTimeout(() => setUsername(trimmed), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const valid = name.trim().length >= 2 && name.trim().length <= 16;
  const charCount = name.trim().length;

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
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

      {step === 'intro' ? (
        /* ── INTRO STEP ── */
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '340px',
          animation: 'fadeIn 0.5s ease',
        }}>
          {/* Logo mark */}
          <div style={{
            fontSize: '40px',
            marginBottom: '16px',
            animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            ⚔️
          </div>

          <h2 style={{
            fontSize: '22px',
            fontFamily: 'var(--font-accent)',
            fontWeight: 700,
            letterSpacing: '3px',
            background: 'linear-gradient(135deg, #F3C37D, #93E5B1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '6px',
          }}>
            WELCOME
          </h2>

          <p style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}>
            Where crypto trading meets turn-based RPG combat.
          </p>

          {/* Feature cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%',
            marginBottom: '24px',
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '10px 8px',
                textAlign: 'center',
                animation: `slideUp 0.4s ease ${0.1 + i * 0.08}s both`,
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{f.icon}</div>
                <div style={{
                  fontSize: '8px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                  fontFamily: 'var(--font-accent)',
                  letterSpacing: '0.5px',
                }}>
                  {f.title}
                </div>
                <div style={{
                  fontSize: '7px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.3,
                }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #F3C37D 0%, #D4A04A 100%)',
              color: '#0a0a1a',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '2px',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(243, 195, 125, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            GET STARTED
          </button>

          <p style={{
            marginTop: '12px',
            fontSize: '8px',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}>
            Offline · No account needed · Progress saved locally
          </p>
        </div>
      ) : (
        /* ── NAME STEP ── */
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '320px',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{
            fontSize: '36px',
            marginBottom: '12px',
            animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            🎮
          </div>

          <h2 style={{
            fontSize: '20px',
            fontFamily: 'var(--font-accent)',
            fontWeight: 700,
            letterSpacing: '2px',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            NAME YOURSELF
          </h2>

          <p style={{
            fontSize: '10px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: '20px',
            lineHeight: 1.4,
          }}>
            Choose a callsign for the arena.
          </p>

          {/* Input */}
          <div style={{
            width: '100%',
            position: 'relative',
            marginBottom: '8px',
          }}>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your name..."
              maxLength={16}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: charCount >= 2
                  ? '1.5px solid rgba(147, 229, 177, 0.4)'
                  : '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontFamily: 'var(--font-accent)',
                fontWeight: 600,
                outline: 'none',
                letterSpacing: '0.5px',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: charCount >= 2
                  ? '0 0 0 3px rgba(147, 229, 177, 0.1)'
                  : 'none',
              }}
            />
            {/* Character count */}
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '9px',
              fontFamily: 'var(--font-main)',
              color: valid ? 'var(--color-mint)' : 'var(--text-muted)',
            }}>
              {charCount}/16
            </div>
          </div>

          {name.length > 0 && name.trim().length < 2 && (
            <p style={{
              fontSize: '8px',
              color: 'var(--color-coral)',
              marginBottom: '12px',
              fontFamily: 'var(--font-main)',
            }}>
              Name must be at least 2 characters
            </p>
          )}

          <button
            onClick={valid ? handleSubmit : undefined}
            disabled={!valid || submitting}
            style={{
              width: '100%',
              padding: '14px',
              background: valid
                ? 'linear-gradient(135deg, #93E5B1 0%, #6BC48A 100%)'
                : 'rgba(255,255,255,0.05)',
              color: valid ? '#0a0a1a' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: valid ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '2px',
              opacity: valid ? 1 : 0.5,
              transition: 'all 0.2s ease',
            }}
          >
            {submitting ? 'ENTERING...' : 'ENTER THE ARENA'}
          </button>

          <p style={{
            marginTop: '12px',
            fontSize: '8px',
            color: 'var(--text-muted)',
          }}>
            2–16 characters
          </p>
        </div>
      )}
    </div>
  );
};
