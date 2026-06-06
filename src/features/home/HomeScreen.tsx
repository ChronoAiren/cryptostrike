import React from 'react';
import { useGame } from '../../context/GameStateContext';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

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

const Card: React.FC<{
  item: typeof MENU_ITEMS[0];
  i: number;
  desktop: boolean;
  onClick: () => void;
}> = ({ item, i, desktop, onClick }) => {
  if (desktop) {
    const isCampaign = item.key === 'campaign';
    return (
      <div
        onClick={onClick}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: isCampaign ? '18px' : '14px 20px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: isCampaign ? 'column' : 'row',
          alignItems: isCampaign ? 'center' : 'center',
          justifyContent: isCampaign ? 'center' : 'flex-start',
          gap: '14px',
          transition: 'all 0.2s ease',
          opacity: 1,
          gridColumn: isCampaign ? '1 / -1' : 'auto',
          minHeight: isCampaign ? '80px' : 'auto',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(243, 195, 125, 0.25)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
      >
        <div style={{
          fontSize: isCampaign ? '36px' : '24px',
          width: isCampaign ? '56px' : '40px',
          height: isCampaign ? '56px' : '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '14px', flexShrink: 0,
        }}>
          {item.icon}
        </div>
        <div style={{ textAlign: isCampaign ? 'center' : 'left' }}>
          <div style={{
            fontSize: isCampaign ? '18px' : '13px',
            fontWeight: 700, fontFamily: 'var(--font-accent)',
            letterSpacing: '1.5px',
            color: 'var(--text-primary)',
            marginBottom: '3px',
          }}>
            {item.title}
          </div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>
            {item.subtitle}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '18px 20px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '16px',
        transition: 'all 0.2s ease', opacity: 1,
        animation: `slideUp 0.4s ease ${0.1 + i * 0.1}s both`,
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(243, 195, 125, 0.25)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
    >
      <div style={{
        fontSize: '28px', width: '44px', height: '44px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '12px', flexShrink: 0,
      }}>
        {item.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-accent)',
          letterSpacing: '1.5px', color: 'var(--text-primary)',
          marginBottom: '2px',
        }}>
          {item.title}
        </div>
        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>
          {item.subtitle}
        </div>
      </div>
      <div style={{ color: 'var(--color-gold)', fontSize: '16px' }}>→</div>
    </div>
  );
};

export const HomeScreen: React.FC = () => {
  const { user, setScreen, goToCampaignMap } = useGame();
  const desktop = useMediaQuery('(min-width: 769px)');
  const landscape = useMediaQuery('(orientation: landscape)');
  const compact = desktop || landscape;

  const handleNav = (key: string) => {
    if (key === 'myCharacter') setScreen('myCharacter');
    else if (key === 'items') setScreen('items');
    else if (key === 'campaign') goToCampaignMap();
    else setScreen('classSelect');
  };

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: compact ? '20px 32px 16px' : '32px 24px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }} />
      <div style={{
        position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147, 229, 177, 0.06) 0%, transparent 70%)',
        top: '-15%', right: '-20%', animation: 'pulse 5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(243, 195, 125, 0.05) 0%, transparent 70%)',
        bottom: '-10%', left: '-15%', animation: 'pulse 6s ease-in-out infinite 1.5s',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: compact ? '600px' : '340px',
        flex: 1,
      }}>
        {/* Title */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: compact ? '16px' : '32px', marginTop: compact ? '0' : '8px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '6px', lineHeight: 1 }}>⚔️</div>
          <h1 style={{
            fontSize: '24px', fontFamily: 'var(--font-accent)', fontWeight: 700,
            letterSpacing: '4px',
            background: 'linear-gradient(135deg, #F3C37D 0%, #93E5B1 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: '2px',
          }}>
            CRYPTOSTRIKE
          </h1>
          <div
            onClick={() => setScreen('profile')}
            style={{
              fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-pixel)',
              letterSpacing: '0.5px', cursor: 'pointer', transition: 'color 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {user.avatar} {user.username.toUpperCase()}
            <span
              onClick={e => { e.stopPropagation(); setScreen('settings'); }}
              style={{
                fontSize: '14px', cursor: 'pointer', opacity: 0.5,
                transition: 'opacity 0.15s ease', lineHeight: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
              title="Settings"
            >
              ⚙️
            </span>
          </div>
        </div>

        {/* Balance bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px', flexShrink: 0,
          fontSize: '10px', fontFamily: 'var(--font-pixel)', letterSpacing: '0.5px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px', padding: '8px 16px', margin: `0 auto ${compact ? '12px' : '4px'}`,
          width: 'fit-content', maxWidth: '100%',
        }}>
          <span>💰 <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontFamily: 'var(--font-accent)' }}>{user.gold}</span></span>
          <span>💎 <span style={{ color: 'var(--color-purple)', fontWeight: 700, fontFamily: 'var(--font-accent)' }}>{user.gems}</span></span>
        </div>

        {compact ? (
          /* Desktop/landscape: bento grid */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            width: '100%',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: compact ? '10px' : '12px',
            }}>
              {MENU_ITEMS.map((item, i) => (
                <Card key={item.key} item={item} i={i} desktop onClick={() => handleNav(item.key)} />
              ))}
            </div>
          </div>
        ) : (
          /* Mobile: stacked list */
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '12px',
            width: '100%', flex: 1, justifyContent: 'center',
          }}>
            {MENU_ITEMS.map((item, i) => (
              <Card key={item.key} item={item} i={i} desktop={false} onClick={() => handleNav(item.key)} />
            ))}
          </div>
        )}

        {/* Quick stats strip */}
        <div style={{
          width: '100%', display: 'flex', justifyContent: 'center',
          gap: '20px', padding: compact ? '10px 0 4px' : '16px 0',
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
