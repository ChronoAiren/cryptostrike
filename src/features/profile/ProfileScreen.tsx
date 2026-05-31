import React, { useState } from 'react';
import { useGame } from '../../context/GameStateContext';

const AVATARS = ['⚔️', '❄️', '🌿', '🌑', '🔥', '🌸', '🤖', '👾', '🦊', '🐉', '🧙', '🦇', '🦅', '🐺', '🦈', '🐲', '🎭', '💀'];

export const ProfileScreen: React.FC = () => {
  const { user, updateProfile, setScreen } = useGame();
  const [name, setName] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [saved, setSaved] = useState(false);

  const valid = name.trim().length >= 2 && name.trim().length <= 16;
  const charCount = name.trim().length;
  const dirty = name !== user.username || bio !== user.bio || avatar !== user.avatar;

  const handleSave = () => {
    if (!valid) return;
    updateProfile({ username: name.trim(), avatar, bio: bio.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
  };

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      position: 'relative',
      overflow: 'auto',
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '340px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <h2 style={{
            fontSize: '18px',
            fontFamily: 'var(--font-accent)',
            fontWeight: 700,
            letterSpacing: '2px',
            background: 'linear-gradient(135deg, #F3C37D, #93E5B1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            PROFILE
          </h2>
        </div>

        {/* Avatar picker */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}>
          {/* Current avatar preview */}
          <div style={{
            fontSize: '48px',
            width: '72px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '2px solid rgba(243, 195, 125, 0.2)',
            lineHeight: 1,
          }}>
            {avatar}
          </div>

          <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-main)', letterSpacing: '0.5px' }}>
            CHOOSE ICON
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '6px',
            width: '100%',
          }}>
            {AVATARS.map(a => (
              <div
                key={a}
                onClick={() => setAvatar(a)}
                style={{
                  fontSize: '22px',
                  padding: '6px 0',
                  textAlign: 'center',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: avatar === a ? 'rgba(243, 195, 125, 0.12)' : 'rgba(255,255,255,0.02)',
                  border: avatar === a
                    ? '1.5px solid rgba(243, 195, 125, 0.3)'
                    : '1.5px solid transparent',
                  transition: 'all 0.1s ease',
                  lineHeight: 1,
                }}
              >
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* Name input */}
        <div style={{ flexShrink: 0 }}>
          <label style={{
            fontSize: '8px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-pixel)',
            letterSpacing: '0.5px',
            marginBottom: '6px',
            display: 'block',
          }}>
            CALLSIGN
          </label>
          <div style={{ position: 'relative' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter callsign..."
              maxLength={16}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: valid
                  ? '1.5px solid rgba(147, 229, 177, 0.3)'
                  : '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '15px',
                fontFamily: 'var(--font-accent)',
                fontWeight: 600,
                outline: 'none',
                letterSpacing: '0.5px',
              }}
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '9px',
              color: charCount >= 2 ? 'var(--color-mint)' : 'var(--text-muted)',
            }}>
              {charCount}/16
            </div>
          </div>
          {name.length > 0 && !valid && (
            <p style={{ fontSize: '8px', color: 'var(--color-coral)', marginTop: '4px' }}>
              2–16 characters required
            </p>
          )}
        </div>

        {/* Bio */}
        <div style={{ flexShrink: 0 }}>
          <label style={{
            fontSize: '8px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-pixel)',
            letterSpacing: '0.5px',
            marginBottom: '6px',
            display: 'block',
          }}>
            BIO
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A short description about yourself..."
            maxLength={120}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontFamily: 'var(--font-main)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.4,
            }}
          />
          <div style={{
            fontSize: '8px',
            color: 'var(--text-muted)',
            textAlign: 'right',
            marginTop: '3px',
          }}>
            {bio.length}/120
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Save button */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, paddingBottom: '8px' }}>
          <button
            onClick={() => setScreen('home')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '1px',
            }}
          >
            CANCEL
          </button>

          <button
            onClick={handleSave}
            disabled={!valid || !dirty}
            style={{
              flex: 1,
              padding: '12px',
              background: valid && dirty
                ? 'linear-gradient(135deg, #93E5B1 0%, #6BC48A 100%)'
                : 'rgba(255,255,255,0.04)',
              color: valid && dirty ? '#0a0a1a' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: valid && dirty ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-accent)',
              letterSpacing: '1.5px',
              opacity: valid && dirty ? 1 : 0.5,
              transition: 'all 0.15s ease',
            }}
          >
            {saved ? '✓ SAVED' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
};
