import React from 'react';

type AnimationPhase = 'idle' | 'anticipate' | 'launch' | 'impact' | 'damage' | 'resolution';

interface BattleVFXProps {
  animationPhase: AnimationPhase;
  playerDamage: number;
  enemyDamage: number;
  playerEffectType: string;
  isCrit: boolean;
  showDamageNumber: boolean;
}

export const BattleVFX: React.FC<BattleVFXProps> = ({
  animationPhase,
  playerDamage,
  enemyDamage,
  playerEffectType,
  isCrit,
  showDamageNumber,
}) => {
  const showHitOnEnemy =
    playerDamage > 0 && (animationPhase === 'impact' || animationPhase === 'damage');
  const showHitOnPlayer =
    enemyDamage > 0 && (animationPhase === 'impact' || animationPhase === 'damage');
  const showHeal = playerEffectType === 'hold' && animationPhase === 'damage';
  const showBuff = playerEffectType === 'buf' && animationPhase === 'damage';
  const showDef = playerEffectType === 'def' && animationPhase === 'damage';
  const showCritRing = isCrit && showDamageNumber && animationPhase === 'damage';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 8,
      }}
    >
      {showHitOnEnemy && (
        <>
          <div
            className="vfx-hit-spark vfx-hit-spark--enemy"
            style={{
              position: 'absolute',
              right: '22%',
              top: '35%',
            }}
          />
          <div className="vfx-slash-trail vfx-slash-trail--enemy" />
        </>
      )}

      {showHitOnPlayer && (
        <div
          className="vfx-hit-spark vfx-hit-spark--player"
          style={{
            position: 'absolute',
            left: '22%',
            top: '35%',
          }}
        />
      )}

      {showCritRing && (
        <div
          className="vfx-crit-ring"
          style={{
            position: 'absolute',
            right: '18%',
            top: '28%',
          }}
        />
      )}

      {showHeal && (
        <div
          className="vfx-heal-particles"
          style={{
            position: 'absolute',
            left: '20%',
            bottom: '20%',
          }}
        />
      )}

      {(showBuff || showDef) && (
        <div
          className={`vfx-status-ring ${showBuff ? 'vfx-status-ring--buff' : 'vfx-status-ring--def'}`}
          style={{
            position: 'absolute',
            left: '18%',
            top: '30%',
          }}
        />
      )}
    </div>
  );
};
