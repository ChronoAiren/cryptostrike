import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameStateContext';
import { useAudio } from '../../context/AudioContext';

export interface TipDefinition {
  id: string;
  title: string;
  body: string;
  icon: string;
  targetId: string;
  position: 'above' | 'below';
  pauseTimer?: boolean;
}

export const TIPS: Record<string, TipDefinition> = {
  t001: {
    id: 't001',
    title: 'Pick Your Fighter',
    body: 'Three GandalfHardcore builds — each with different HP, ATK, DEF, and a unique trading passive.',
    icon: '📊',
    targetId: 'class-select-grid',
    position: 'above',
  },
  t002: {
    id: 't002',
    title: 'One Tap = Two Decisions',
    body: 'Attack & Buff → CALL (bet price UP). Defend & Debuff → PUT (bet price DOWN). Your RPG action is your market bet!',
    icon: '⚔️',
    targetId: 'battle-action-grid',
    position: 'above',
    pauseTimer: true,
  },
  t003: {
    id: 't003',
    title: 'Watch the Market Decide',
    body: 'Your action is locked! Watch the chart drift. Correct predictions boost your RPG effects; incorrect ones penalize you.',
    icon: '📈',
    targetId: 'battle-chart-section',
    position: 'below',
  },
  t004: {
    id: 't004',
    title: 'Damage Formula',
    body: 'BASE (15) × ATK × TradeResult × Volatility × (1 - DEF). Accuracy adds critical bonuses. Protect your health!',
    icon: '💥',
    targetId: 'battle-result-panel',
    position: 'above',
  },
  t005: {
    id: 't005',
    title: 'Status Effects & Auras',
    body: 'Badges below your chibi show active turns of status buffs (green) or debuffs (red). Plan your moves around them!',
    icon: '🔮',
    targetId: 'fighter-status-bar',
    position: 'below',
  },
  t006: {
    id: 't006',
    title: 'Dynamic Visual Equipment',
    body: 'Weapons, Outfits, and Shields change your chibi sprite on-the-fly and boost stats. Tap active bubbles during combat to use them!',
    icon: '🎒',
    targetId: 'active-items-slots',
    position: 'above',
  },
};

export const OnboardingTooltip: React.FC = () => {
  const { currentScreen, battlePhase, playerState, selectedClass, setTimerPaused } = useGame();
  const { playSound } = useAudio();
  const [activeTip, setActiveTip] = useState<TipDefinition | null>(null);
  const [seenTips, setSeenTips] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cryptostrike_seen_tips');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [boxStyle, setBoxStyle] = useState<React.CSSProperties>({});
  const [spotStyle, setSpotStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Trigger tips depending on game conditions
  useEffect(() => {
    if (currentScreen === 'classSelect' && !seenTips.t001) {
      triggerTip(TIPS.t001);
    }
  }, [currentScreen, seenTips]);

  useEffect(() => {
    if (currentScreen === 'battle') {
      if (battlePhase === 'rpg' && !seenTips.t002) {
        triggerTip(TIPS.t002);
      } else if (battlePhase === 'mkt' && seenTips.t002 && !seenTips.t003) {
        triggerTip(TIPS.t003);
      } else if (battlePhase === 'res' && seenTips.t003 && !seenTips.t004) {
        triggerTip(TIPS.t004);
      }
    }
  }, [currentScreen, battlePhase, seenTips]);

  useEffect(() => {
    if (currentScreen === 'battle' && playerState) {
      const hasBuffs = playerState.buffs.length > 0 || playerState.debuffs.length > 0;
      if (hasBuffs && seenTips.t004 && !seenTips.t005) {
        triggerTip(TIPS.t005);
      }
    }
  }, [currentScreen, playerState, seenTips]);

  useEffect(() => {
    if (currentScreen === 'battle' && selectedClass && !seenTips.t006 && seenTips.t002) {
      triggerTip(TIPS.t006);
    }
  }, [currentScreen, selectedClass, seenTips]);

  const triggerTip = (tip: TipDefinition) => {
    // Avoid double triggering or showing tips already seen
    if (seenTips[tip.id]) return;
    setActiveTip(tip);
    if (tip.pauseTimer) {
      setTimerPaused(true);
    }
  };

  // Track coordinates of target element to place spotlight
  useEffect(() => {
    if (!activeTip) return;

    const calculatePosition = () => {
      const target = document.getElementById(activeTip.targetId);
      const phoneFrame = document.querySelector('[class*="phoneFrame"]');
      if (!target || !phoneFrame) return;

      const targetRect = target.getBoundingClientRect();
      const frameRect = phoneFrame.getBoundingClientRect();

      const topOffset = targetRect.top - frameRect.top;
      const leftOffset = targetRect.left - frameRect.left;
      const width = targetRect.width;
      const height = targetRect.height;

      // Positioning the spotlight
      setSpotStyle({
        top: `${topOffset - 4}px`,
        left: `${leftOffset - 4}px`,
        width: `${width + 8}px`,
        height: `${height + 8}px`,
        borderRadius: '12px',
        border: '2px solid var(--color-gold)',
        position: 'absolute',
        zIndex: 199,
        pointerEvents: 'none',
      });

      // Positioning the info box
      const boxWidth = 300;
      const leftBox = Math.max(8, Math.min(leftOffset + (width - boxWidth) / 2, frameRect.width - boxWidth - 8));
      const topBox =
        activeTip.position === 'above'
          ? topOffset - 150 // Place above
          : topOffset + height + 12; // Place below

      // Make sure the tooltip does not run off the screen top/bottom
      const boundedTop = Math.max(48, Math.min(topBox, frameRect.height - 180));

      setBoxStyle({
        top: `${boundedTop}px`,
        left: `${leftBox}px`,
        width: `${boxWidth}px`,
        position: 'absolute',
        zIndex: 201,
      });
    };

    // Calculate immediately and also on window resize
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    const timeout = setTimeout(calculatePosition, 100); // Wait for transition renders

    return () => {
      window.removeEventListener('resize', calculatePosition);
      clearTimeout(timeout);
    };
  }, [activeTip]);

  const handleDismiss = () => {
    if (!activeTip) return;

    playSound('confirm');
    const updatedSeen = { ...seenTips, [activeTip.id]: true };
    setSeenTips(updatedSeen);
    localStorage.setItem('cryptostrike_seen_tips', JSON.stringify(updatedSeen));

    if (activeTip.pauseTimer) {
      setTimerPaused(false);
    }
    setActiveTip(null);
  };

  if (!activeTip) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 200,
        pointerEvents: 'all',
      }}
      onClick={(e) => {
        if (e.target === containerRef.current) handleDismiss();
      }}
    >
      {/* 1. Dynamic Spotlight Ring */}
      <div className="spotlight-glow" style={spotStyle} />

      {/* 2. Dialogue Info Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '2.5px solid var(--color-gold)',
          borderRadius: '16px',
          padding: '14px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...boxStyle,
        }}
      >
        <span style={{ fontSize: '24px', marginBottom: '6px' }}>{activeTip.icon}</span>
        <h3
          style={{
            fontSize: '15px',
            color: 'var(--color-gold)',
            marginBottom: '4px',
            fontFamily: 'var(--font-accent)',
            textAlign: 'center',
          }}
        >
          {activeTip.title}
        </h3>
        <p
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            textAlign: 'center',
            marginBottom: '12px',
          }}
        >
          {activeTip.body}
        </p>

        <button
          onClick={handleDismiss}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'var(--color-gold)',
            color: 'var(--bg-deep)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(243, 195, 125, 0.3)',
          }}
        >
          GOT IT ✓
        </button>
        <div style={{ fontSize: '9px', color: 'var(--color-mint)', marginTop: '6px', fontWeight: 600 }}>
          +5 XP REWARD
        </div>
      </div>
    </div>
  );
};
