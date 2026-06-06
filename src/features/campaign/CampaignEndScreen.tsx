import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameStateContext';
import { getCampaignItemById } from '../../data/campaignItems';
import { getNextStage } from '../../data/campaign';
import { CLASSES } from '../../context/GameStateContext';

export const CampaignEndScreen: React.FC = () => {
  const {
    winRecord,
    campaign,
    round,
    correctTradesCount,
    totalTradesCount,
    damageDealtCount,
    selectCampaignStage,
    returnToCampaignMap,
    claimCampaignReward,
    restartGame,
    user,
    campaignProgress,
  } = useGame();

  const [claimedRewards, setClaimedRewards] = useState<Set<number>>(new Set());
  const [showRewards, setShowRewards] = useState(false);

  const { selectedChapter, selectedStage } = campaign;
  const isWin = winRecord === true;

  useEffect(() => {
    // Animate rewards appearing
    const timer = setTimeout(() => setShowRewards(true), 300);
    // Auto-claim XP rewards
    if (isWin && selectedStage) {
      selectedStage.rewards.forEach((reward, idx) => {
        if (reward.type === 'xp') {
          claimCampaignReward(idx);
          setClaimedRewards(prev => new Set([...prev, idx]));
        }
      });
    }
    return () => clearTimeout(timer);
  }, []);

  if (!selectedChapter || !selectedStage) return null;

  const accuracy = totalTradesCount > 0
    ? Math.round((correctTradesCount / totalTradesCount) * 100)
    : 0;

  const accuracyRating = accuracy >= 80 ? 'EXPERT' : accuracy >= 50 ? 'TRADER' : 'HODLER';
  const accuracyColor = accuracy >= 80 ? '#22C55E' : accuracy >= 50 ? '#F0B429' : '#EF4444';

  const handleClaimReward = (index: number) => {
    if (claimedRewards.has(index)) return;
    claimCampaignReward(index);
    setClaimedRewards(prev => new Set([...prev, index]));
  };

  const handleNextStage = () => {
    const next = getNextStage(selectedChapter.id, selectedStage.id);
    if (next) {
      selectCampaignStage(next.chapterId, next.stageId);
    } else {
      returnToCampaignMap();
    }
  };

  const nextStage = getNextStage(selectedChapter.id, selectedStage.id);

  return (
    <div style={{
      minHeight: '100%',
      background: isWin
        ? 'linear-gradient(180deg, #0a1a0d 0%, #0d2d1a 50%, #0a0a1a 100%)'
        : 'linear-gradient(180deg, #1a0a0d 0%, #2d0d1a 50%, #0a0a1a 100%)',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '300px',
        background: isWin
          ? 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Result header */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '16px',
          animation: 'popIn 0.5s ease',
        }}>
          {isWin ? '🏆' : '💀'}
        </div>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '36px',
          fontWeight: 700,
          color: isWin ? '#22C55E' : '#EF4444',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          {isWin ? 'Victory!' : 'Defeat'}
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94A3B8',
          marginTop: '8px',
        }}>
          {isWin
            ? `You defeated ${selectedStage.enemy.name}!`
            : `${selectedStage.enemy.name} has bested you...`
          }
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {[
          { label: 'Rounds', value: round.toString(), color: '#F1F5F9' },
          { label: 'Accuracy', value: `${accuracy}%`, color: accuracyColor },
          { label: 'Damage', value: damageDealtCount.toString(), color: '#F0B429' },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              textAlign: 'center',
              opacity: showRewards ? 1 : 0,
              transform: showRewards ? 'translateY(0)' : 'translateY(10px)',
              transition: `all 0.3s ease ${idx * 0.1}s`,
            }}
          >
            <div style={{
              fontSize: '20px',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              color: stat.color,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#64748B',
              marginTop: '2px',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Accuracy rating */}
      <div style={{
        textAlign: 'center',
        marginTop: '16px',
        padding: '12px',
        background: `${accuracyColor}11`,
        border: `1px solid ${accuracyColor}33`,
        borderRadius: '12px',
        position: 'relative',
        zIndex: 1,
        opacity: showRewards ? 1 : 0,
        transition: 'opacity 0.3s ease 0.3s',
      }}>
        <div style={{
          fontSize: '12px',
          color: '#94A3B8',
          marginBottom: '4px',
        }}>
          Trading Rating
        </div>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: accuracyColor,
          textTransform: 'uppercase',
        }}>
          {accuracyRating}
        </div>
      </div>

      {/* Character level */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        position: 'relative',
        zIndex: 1,
        opacity: showRewards ? 1 : 0,
        transition: 'opacity 0.3s ease 0.35s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 24 }}>{CLASSES['my_character'].emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>
              {user.username || 'My Character'}
              <span style={{ color: '#F0B429', marginLeft: 8 }}>Lv.{campaignProgress.level}</span>
            </div>
            <div style={{ marginTop: 4, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((campaignProgress.xp / campaignProgress.xpToNext) * 100)}%`, background: 'linear-gradient(90deg, #22C55E, #4ADE80)', borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>{campaignProgress.xp}/{campaignProgress.xpToNext} XP to next level</div>
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div style={{
        marginTop: '20px',
        position: 'relative',
        zIndex: 1,
        opacity: showRewards ? 1 : 0,
        transition: 'opacity 0.3s ease 0.4s',
      }}>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '16px',
          fontWeight: 700,
          color: '#F1F5F9',
          marginBottom: '12px',
        }}>
          {isWin ? 'Rewards' : 'Completion Bonus'}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {selectedStage.rewards.map((reward, idx) => {
            const claimed = claimedRewards.has(idx);
            const item = reward.itemId ? getCampaignItemById(reward.itemId) : null;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: claimed
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${
                    claimed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'
                  }`,
                  borderRadius: '10px',
                  opacity: isWin || reward.type !== 'item' ? 1 : 0.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {reward.type === 'gold' && '🪙'}
                    {reward.type === 'gems' && '💎'}
                    {reward.type === 'xp' && '✨'}
                    {reward.type === 'item' && (item?.icon || '🎁')}
                  </span>
                  <div>
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#F1F5F9',
                    }}>
                      {reward.type === 'gold' && `${reward.amount} Gold`}
                      {reward.type === 'gems' && `${reward.amount} Gems`}
                      {reward.type === 'xp' && `${reward.amount} XP`}
                      {reward.type === 'item' && (item?.name || 'Unknown Item')}
                    </div>
                    {item && (
                      <div style={{
                        fontSize: '11px',
                        color: '#94A3B8',
                      }}>
                        {item.statText}
                      </div>
                    )}
                  </div>
                </div>

                {isWin && reward.type !== 'xp' && !claimed && (
                  <button
                    onClick={() => handleClaimReward(idx)}
                    disabled={claimed}
                    style={{
                      padding: '6px 12px',
                      background: claimed
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(240, 180, 41, 0.15)',
                      border: `1px solid ${claimed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(240, 180, 41, 0.3)'}`,
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: claimed ? '#22C55E' : '#F0B429',
                      cursor: claimed ? 'default' : 'pointer',
                    }}
                  >
                    {claimed ? '✓ Claimed' : 'Claim'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
        zIndex: 1,
      }}>
        {isWin && nextStage && (
          <button
            onClick={handleNextStage}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #F0B429 0%, #E8A020 100%)',
              border: '2px solid #F0B429',
              borderRadius: '12px',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '15px',
              fontWeight: 700,
              color: '#0a0a1a',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Next Stage →
          </button>
        )}

        {isWin && (
          <button
            onClick={restartGame}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#F1F5F9',
              cursor: 'pointer',
            }}
          >
            Retry Stage
          </button>
        )}

        <button
          onClick={returnToCampaignMap}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: '#94A3B8',
            cursor: 'pointer',
          }}
        >
          Campaign Map
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
