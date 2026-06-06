import React, { useState } from 'react';
import { useGame, CLASSES } from '../../context/GameStateContext';
import { CAMPAIGN_CHAPTERS, getStageKey } from '../../data/campaign';

export const CampaignMapScreen: React.FC = () => {
  const { campaignProgress, selectCampaignStage, goHome, selectedClass, user } = useGame();
  const [selectedChapter, setSelectedChapter] = useState(1);

  const chapter = CAMPAIGN_CHAPTERS.find(c => c.id === selectedChapter);
  if (!chapter) return <div style={{ color: '#fff', padding: 20 }}>Loading...</div>;

  const isCompleted = (cId: number, sId: number) =>
    campaignProgress.completedStages.includes(getStageKey(cId, sId));

  const isUnlocked = (cId: number, sId: number) => {
    if (cId === 1 && sId === 1) return true;
    if (!campaignProgress.unlockedChapters.includes(cId)) return false;
    if (sId === 1) return true;
    return isCompleted(cId, sId - 1);
  };

  const stars = (mult: number) => {
    const n = Math.min(Math.ceil((mult - 1) * 10), 5);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  };

  return (
    <div style={{
      height: '100%',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1a2d 50%, #0a0a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button
            onClick={goHome}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#94A3B8',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: '#F0B429' }}>
              CAMPAIGN
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              Complete chapters to unlock the next
            </div>
          </div>
        </div>
      </div>

      {/* Chapter tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', flexShrink: 0 }}>
        {CAMPAIGN_CHAPTERS.map(ch => {
          const unlocked = campaignProgress.unlockedChapters.includes(ch.id);
          const sel = selectedChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => unlocked && setSelectedChapter(ch.id)}
              style={{
                flex: 1,
                padding: '10px 6px',
                background: sel ? ch.theme + '22' : 'rgba(255,255,255,0.03)',
                border: `2px solid ${sel ? ch.theme : unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 10,
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, color: sel ? ch.theme : unlocked ? '#F1F5F9' : '#475569' }}>
                Ch.{ch.id}
              </div>
              <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>{ch.name}</div>
            </button>
          );
        })}
      </div>

      {/* Chapter description */}
      <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
        <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: chapter.theme, marginBottom: 4 }}>
            {chapter.name}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>{chapter.description}</div>
        </div>
      </div>

      {/* Your Character */}
      <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 22 }}>{selectedClass ? CLASSES[selectedClass].emoji : '⚔️'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>
              {selectedClass === 'my_character' ? (user.username || 'My Character') : selectedClass ? CLASSES[selectedClass].name : 'No Class Selected'}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8' }}>
              Lv.{campaignProgress.level} · {campaignProgress.xp}/{campaignProgress.xpToNext} XP
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#64748B', textAlign: 'right' }}>
            <div>⚔ {user.baseAtk.toFixed(1)} · 🛡 {user.baseDef.toFixed(2)} · 💨 {user.baseSpd}</div>
            <div style={{ marginTop: 2, color: '#F0B429' }}>
              {campaignProgress.levelBonuses.hp > 0 && `+${campaignProgress.levelBonuses.hp}HP `}
              {campaignProgress.levelBonuses.atk > 0 && `+${campaignProgress.levelBonuses.atk.toFixed(2)}ATK `}
              {campaignProgress.levelBonuses.def > 0 && `+${campaignProgress.levelBonuses.def.toFixed(3)}DEF `}
              {campaignProgress.levelBonuses.spd > 0 && `+${campaignProgress.levelBonuses.spd}SPD `}
              {campaignProgress.levelBonuses.lk > 0 && `+${campaignProgress.levelBonuses.lk}LCK`}
            </div>
          </div>
        </div>
      </div>

      {/* Stage list - scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', paddingBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chapter.stages.map(stage => {
            const done = isCompleted(chapter.id, stage.id);
            const open = isUnlocked(chapter.id, stage.id);
            const eClass = CLASSES[stage.enemy.classKey];

            return (
              <button
                key={stage.id}
                onClick={() => open && selectCampaignStage(chapter.id, stage.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: done ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${done ? 'rgba(34,197,94,0.3)' : open ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 12,
                  cursor: open ? 'pointer' : 'not-allowed',
                  opacity: open ? 1 : 0.5,
                  textAlign: 'left' as const,
                }}
              >
                {/* Number / boss icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'rgba(34,197,94,0.2)' : stage.isBoss ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : stage.isBoss ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  flexShrink: 0,
                  fontSize: 14, color: done ? '#22C55E' : stage.isBoss ? '#A855F7' : '#F1F5F9',
                }}>
                  {done ? '✓' : stage.isBoss ? '👑' : stage.id}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: done ? '#22C55E' : '#F1F5F9' }}>
                    {stage.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>
                    {eClass?.emoji || '?'} {stage.enemy.name} · <span style={{ color: '#F0B429' }}>{stars(stage.enemy.difficultyMultiplier)}</span>
                  </div>
                </div>

                {/* Rewards */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0, fontSize: 10 }}>
                  {stage.rewards.map((r, i) => (
                    <div key={i} style={{ color: r.type === 'gold' ? '#F0B429' : r.type === 'gems' ? '#A855F7' : r.type === 'xp' ? '#22C55E' : '#60A5FA' }}>
                      {r.type === 'gold' && `+${r.amount} 🪙`}
                      {r.type === 'gems' && `+${r.amount} 💎`}
                      {r.type === 'xp' && `+${r.amount} XP`}
                      {r.type === 'item' && `🎁 Item`}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', gap: 20, justifyContent: 'center', fontSize: 11, color: '#64748B' }}>
        <span><span style={{ color: '#F0B429', fontWeight: 700 }}>{campaignProgress.completedStages.length}</span>/18 Stages</span>
        <span><span style={{ color: '#A855F7', fontWeight: 700 }}>{campaignProgress.totalXp}</span> XP</span>
        <span><span style={{ color: '#22C55E', fontWeight: 700 }}>{campaignProgress.unlockedChapters.length}</span>/3 Chapters</span>
      </div>
    </div>
  );
};
