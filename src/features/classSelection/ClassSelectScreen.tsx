import React from 'react';
import { useGame, CLASSES } from '../../context/GameStateContext';
import { FighterSprite } from '../sprites/FighterSprite';
import { type ClassKey } from '../../types/game';
import { OVERLAY_SPRITES, WEARABLES } from '../../data/wearables';

function parseStatBonus(bonus: string): { atk: number; def: number; spd: number } {
  const atk = bonus.includes('%') && bonus.includes('ATK') ? parseInt(bonus) || 0 : 0;
  const def = bonus.includes('%') && bonus.includes('DEF') ? parseInt(bonus) || 0 : 0;
  const spd = bonus.includes('SPD') ? parseInt(bonus) || 0 : 0;
  return { atk, def, spd };
}

function sumStats(items: string[]): { atk: number; def: number; spd: number } {
  const total = { atk: 0, def: 0, spd: 0 };
  items.forEach(id => {
    const w = WEARABLES.find(x => x.id === id);
    if (w) {
      const s = parseStatBonus(w.statBonus);
      total.atk += s.atk;
      total.def += s.def;
      total.spd += s.spd;
    }
  });
  return total;
}
const STAT_MAX = { atk: 1.4, def: 0.20, spd: 65, lk: 30 };

const StatBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({
  label, value, max, color,
}) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
      <span style={{ width: '24px', fontSize: '8px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '2px', transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 4px ${color}88` }} />
      </div>
    </div>
  );
};

export const ClassSelectScreen: React.FC = () => {
  const { selectedClass, selectClass, goItemsScreen, goHome, user } = useGame();
  const gearStats = sumStats(user.cosmeticItems);
  const myCharAtk = user.baseAtk + gearStats.atk / 100;
  const myCharDef = user.baseDef + gearStats.def / 100;
  const myCharSpd = user.baseSpd + gearStats.spd;
  const myCharLk = user.baseLk;

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #0a0a1a 0%, #100a20 40%, #0d1a2d 100%)', display: 'flex', flexDirection: 'column', padding: '20px 16px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 229, 177, 0.06) 0%, transparent 70%)', top: '-15%', right: '-20%', animation: 'pulse 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(243, 195, 125, 0.05) 0%, transparent 70%)', bottom: '-10%', left: '-15%', animation: 'pulse 6s ease-in-out infinite 1.5s' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ marginBottom: '14px', flexShrink: 0 }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-accent)', letterSpacing: '2px', background: 'linear-gradient(135deg, #F3C37D, #93E5B1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 }}>
            Choose Your Fighter
          </h2>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            6 unique classes · balanced stats · distinct passives
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingBottom: '8px' }}>
          {(Object.entries(CLASSES) as [ClassKey, (typeof CLASSES)[ClassKey]][])
            .sort(([a], [b]) => a === 'my_character' ? -1 : b === 'my_character' ? 1 : 0)
            .map(([key, c]) => {
            const isSelected = selectedClass === key;
            const isMyChar = key === 'my_character';
            return (
              <div
                key={key}
                onClick={() => selectClass(key)}
                style={{
                  background: isSelected ? 'rgba(243,195,125,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isSelected ? `1.5px solid ${isMyChar ? '#FFFFFF' : c.color}` : '1.5px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '10px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: isSelected ? `0 0 20px ${isMyChar ? 'rgba(255,255,255,0.15)' : c.color + '33'}` : 'none',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, color: isMyChar ? '#FFFFFF' : c.color, letterSpacing: '0.04em', textAlign: 'center', marginBottom: '2px', textShadow: isMyChar ? '0 0 8px rgba(255,255,255,0.4)' : `0 0 8px ${c.color}66` }}>
                  {isMyChar ? `🧑 ${user.username}` : `${c.emoji} ${c.name}`}
                </span>

                <div style={{ margin: '2px 0' }}>
                  <FighterSprite characterKey={key} overlaySources={isMyChar ? user.cosmeticItems.filter(id => OVERLAY_SPRITES[id]).map(id => OVERLAY_SPRITES[id]) : []} pose="idle" playing loop size={72} />
                </div>

                <div style={{ width: '100%', marginTop: '2px' }}>
                  <StatBar label="ATK" value={isMyChar ? myCharAtk : c.atk} max={STAT_MAX.atk} color="var(--color-coral)" />
                  <StatBar label="DEF" value={isMyChar ? myCharDef : c.def} max={STAT_MAX.def} color="var(--color-periwinkle)" />
                  <StatBar label="SPD" value={isMyChar ? myCharSpd : c.spd} max={STAT_MAX.spd} color="var(--color-mint)" />
                  <StatBar label="LCK" value={isMyChar ? myCharLk : c.lk} max={STAT_MAX.lk} color="var(--color-gold)" />
                </div>

                <div style={{ marginTop: '5px', display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>HP</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#6EE7A0', background: 'rgba(110,231,160,0.12)', borderRadius: '4px', padding: '1px 5px' }}>{isMyChar ? user.baseHp : c.hp}</span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '7px', padding: '5px 6px', marginTop: '6px', fontSize: '8px', lineHeight: '1.35', color: 'var(--text-secondary)', width: '100%', textAlign: 'left' }}>
                  <b style={{ color: 'var(--color-gold)', fontSize: '8px' }}>Passive: </b>{isMyChar ? 'Uses your account base stats + cosmetic gear bonuses in battle.' : c.passiveDesc}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flexShrink: 0, paddingTop: '10px', display: 'flex', gap: '8px' }}>
          <button
            onClick={goHome}
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
            onClick={goItemsScreen}
            disabled={!selectedClass}
            style={{
              flex: 1, padding: '12px',
              background: selectedClass ? 'linear-gradient(135deg, #F3C37D 0%, #D4A04A 100%)' : 'rgba(255,255,255,0.04)',
              color: selectedClass ? '#0a0a1a' : 'var(--text-muted)',
              border: 'none', borderRadius: '12px',
              fontSize: '13px', fontWeight: 700,
              cursor: selectedClass ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-accent)', letterSpacing: '1.5px',
              opacity: selectedClass ? 1 : 0.5,
            }}
          >
            NEXT →
          </button>
        </div>
      </div>
    </div>
  );
};
