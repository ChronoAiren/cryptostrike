import React from 'react';
import { useGame } from '../../context/GameStateContext';

export const SettingsScreen: React.FC = () => {
  const { user, updateVolume, goHome } = useGame();

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={goHome}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'var(--font-pixel)',
          }}
        >
          ← BACK
        </button>
        <h1 style={{
          fontSize: '16px', fontFamily: 'var(--font-accent)', fontWeight: 700,
          letterSpacing: '2px',
          background: 'linear-gradient(135deg, #F3C37D 0%, #93E5B1 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', margin: 0,
        }}>
          SETTINGS
        </h1>
      </div>

      {/* BGM Volume */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '8px', fontSize: '11px', fontFamily: 'var(--font-pixel)',
          color: 'var(--text-secondary)', letterSpacing: '0.5px',
        }}>
          <span>BGM (Background Music)</span>
          <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontFamily: 'var(--font-accent)' }}>
            {Math.round(user.bgmVolume * 100)}%
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={user.bgmVolume}
          onChange={e => updateVolume('bgmVolume', Number(e.target.value))}
          style={{ width: '100%', accentColor: '#F3C37D' }}
        />
      </div>

      {/* VFX Volume */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '8px', fontSize: '11px', fontFamily: 'var(--font-pixel)',
          color: 'var(--text-secondary)', letterSpacing: '0.5px',
        }}>
          <span>VFX (Sound Effects)</span>
          <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontFamily: 'var(--font-accent)' }}>
            {Math.round(user.vfxVolume * 100)}%
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={user.vfxVolume}
          onChange={e => updateVolume('vfxVolume', Number(e.target.value))}
          style={{ width: '100%', accentColor: '#93E5B1' }}
        />
      </div>
    </div>
  );
};
