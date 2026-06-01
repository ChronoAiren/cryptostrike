import type { SpriteState } from '../../types/game';

type AnimationPhase = 'idle' | 'anticipate' | 'launch' | 'impact' | 'resolution';

interface DerivePoseInput {
  animationPhase: AnimationPhase;
  isAttacking: boolean;
  isHit: boolean;
  isEnemy: boolean;
  playerEffectType?: string;
  enemyEffectType?: string;
  turnOwner: 'player' | 'enemy' | 'none';
}

export function derivePlayerPose(input: DerivePoseInput): SpriteState {
  const { animationPhase, isAttacking, isHit, turnOwner } = input;

  if (turnOwner === 'player') {
    if (animationPhase === 'anticipate' || animationPhase === 'launch') return 'attack';
    if (animationPhase === 'impact') return 'attack';
    if (animationPhase === 'resolution') return 'idle';
  }
  if (turnOwner === 'enemy' && animationPhase === 'impact' && isHit) return 'hurt';
  if (isHit) return 'hurt';
  if (isAttacking) return 'attack';
  return 'idle';
}

export function deriveEnemyPose(input: DerivePoseInput): SpriteState {
  const { animationPhase, isAttacking, isHit, turnOwner } = input;

  if (turnOwner === 'enemy') {
    if (animationPhase === 'anticipate' || animationPhase === 'launch') return 'attack';
    if (animationPhase === 'impact') return 'attack';
    if (animationPhase === 'resolution') return 'idle';
  }
  if (turnOwner === 'player' && animationPhase === 'impact' && isHit) return 'hurt';
  if (isHit) return 'hurt';
  if (isAttacking) return 'attack';
  return 'idle';
}
