import type { SpriteState } from '../../types/game';

type AnimationPhase = 'idle' | 'anticipate' | 'launch' | 'impact' | 'damage' | 'resolution';

interface DerivePoseInput {
  animationPhase: AnimationPhase;
  isAttacking: boolean;
  isHit: boolean;
  isEnemy: boolean;
  playerEffectType?: string;
  enemyEffectType?: string;
}

/**
 * Maps combat animation phase to sprite sheet pose per GDD battle flow.
 */
export function derivePlayerPose(input: DerivePoseInput): SpriteState {
  const { animationPhase, isAttacking, isHit, playerEffectType } = input;

  if (playerEffectType === 'def' && animationPhase !== 'idle') return 'defend';
  if (isHit && (animationPhase === 'impact' || animationPhase === 'damage')) return 'hurt';
  if (isAttacking && (animationPhase === 'anticipate' || animationPhase === 'launch' || animationPhase === 'impact')) {
    return 'attack';
  }
  if (animationPhase === 'resolution' && playerEffectType === 'atk') return 'idle';
  return 'idle';
}

export function deriveEnemyPose(input: DerivePoseInput): SpriteState {
  const { animationPhase, isAttacking, isHit, enemyEffectType } = input;

  if (isHit && (animationPhase === 'impact' || animationPhase === 'damage')) return 'hurt';
  if (isAttacking && (animationPhase === 'anticipate' || animationPhase === 'launch' || animationPhase === 'impact')) {
    return 'attack';
  }
  if (enemyEffectType === 'def') return 'defend';
  return 'idle';
}
