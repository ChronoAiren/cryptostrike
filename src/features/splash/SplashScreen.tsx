import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameStateContext';

const TITLE = 'CRYPTOSTRIKE';
const SUBTITLE = 'TRADE. BATTLE. CONQUER.';
const SPLASH_DURATION = 2800;

export const SplashScreen: React.FC = () => {
  const { user, setScreen } = useGame();
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter');
  const [dotIdx, setDotIdx] = useState(0);

  useEffect(() => {
    const enter = setTimeout(() => setPhase('idle'), 600);
    const exit = setTimeout(() => setPhase('exit'), SPLASH_DURATION);
    const advance = setTimeout(() => {
      setScreen(user.username ? 'home' : 'welcome');
    }, SPLASH_DURATION + 400);

    const dots = setInterval(() => setDotIdx(p => (p + 1) % 4), 500);

    return () => {
      clearTimeout(enter);
      clearTimeout(exit);
      clearTimeout(advance);
      clearInterval(dots);
    };
  }, [user.username, setScreen]);

  const handleClick = () => {
    setScreen(user.username ? 'home' : 'welcome');
  };

  const opacity = phase === 'enter' ? 0 : phase === 'exit' ? 0 : 1;
  const blur = phase === 'enter' ? 8 : phase === 'exit' ? 4 : 0;

  return (
    <div
      onClick={handleClick}
      style={{
        height: '100%',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0d1a2d 50%, #0a0a1a 75%, #1a0a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'opacity 0.6s ease, filter 0.6s ease',
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      {/* Gradient orbs */}
      <div style={{
        position: 'absolute',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147, 229, 177, 0.08) 0%, transparent 70%)',
        top: '-10%', left: '-20%',
        animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '250px', height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(243, 195, 125, 0.06) 0%, transparent 70%)',
        bottom: '-5%', right: '-15%',
        animation: 'pulse 5s ease-in-out infinite 1s',
      }} />
      <div style={{
        position: 'absolute',
        width: '200px', height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(159, 186, 255, 0.05) 0%, transparent 70%)',
        top: '40%', left: '60%',
        animation: 'pulse 6s ease-in-out infinite 0.5s',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        animation: phase === 'idle' ? 'float 3s ease-in-out infinite' : undefined,
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '48px',
          lineHeight: 1,
          marginBottom: '4px',
          animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
        }}>
          ⚔️
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 42px)',
          fontFamily: 'var(--font-accent)',
          fontWeight: 700,
          letterSpacing: '6px',
          background: 'linear-gradient(135deg, #F3C37D 0%, #93E5B1 50%, #F3C37D 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 30px rgba(147, 229, 177, 0.3))',
          animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both',
        }}>
          {TITLE}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(11px, 2vw, 14px)',
          fontFamily: 'var(--font-main)',
          fontWeight: 500,
          letterSpacing: '8px',
          color: 'var(--text-secondary)',
          opacity: 0.7,
          animation: 'fadeIn 0.8s ease 0.8s both',
        }}>
          {SUBTITLE}
        </p>

        {/* Loading indicator */}
        <div style={{
          marginTop: '20px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-main)',
          animation: 'fadeIn 0.6s ease 1.2s both',
        }}>
          Loading{'.'.repeat(dotIdx)}
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        fontSize: '9px',
        color: 'var(--text-muted)',
        opacity: 0.4,
        animation: 'fadeIn 0.6s ease 1.5s both',
      }}>
        Tap anywhere to continue
      </div>
    </div>
  );
};
