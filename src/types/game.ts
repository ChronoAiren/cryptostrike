/** Playable characters — mapped to character_one.png through character_six.png */
export type ClassKey =
  | 'char_one'
  | 'char_two'
  | 'char_three'
  | 'char_four'
  | 'char_five'
  | 'char_six';

/** Sprite sheet animation poses (GDD §18.2) */
export type SpriteState = 'idle' | 'attack' | 'defend' | 'hurt' | 'victory';

/** Render layer for wearable PNG compositing */
export type SpriteLayer = 'body' | 'outfit' | 'weapon' | 'accessory' | 'clothing' | 'hair' | 'hand';

export interface ClassDefinition {
  name: string;
  emoji: string;
  color: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  lk: number;
  passiveDesc: string;
  passiveKey: string;
}

export type ItemSlot = 'weapon' | 'outfit' | 'boots' | 'item';

export interface Item {
  id: string;
  name: string;
  icon: string;
  slot: ItemSlot;
  statText: string;
  effect: {
    atk?: number;
    def?: number;
    spd?: number;
    type?: 'whale' | 'fud' | 'hodl' | 'ledger' | 'airdrop' | 'bull';
  };
  isActive: boolean;
}

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  volatilityText: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  volatilityClass: 'vl' | 'vm' | 'vh' | 'vx';
  multiplier: number;
  basePrice: number;
  volatilityValue: number;
}

export interface BuffDebuff {
  type: 'atk' | 'def' | 'tr';
  multiplier?: number;
  amount?: number;
  subtraction?: number;
  roundsRemaining: number;
}

export interface FighterState {
  name: string;
  spriteKey: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  lk: number;
  buffs: BuffDebuff[];
  debuffs: BuffDebuff[];
}

export type BattlePhase = 'rpg' | 'mkt' | 'res';

export interface DamageReport {
  playerCorrect: boolean;
  playerMove: 'call' | 'put' | 'hold';
  priceDriftPercent: number;
  playerDamage: number;
  enemyDamage: number;
  playerEffectType: string;
  isCrit: boolean;
  degenComebackTriggered: boolean;
  playerFinalMult: number;
  coinMultiplier: number;
  enemyFinalMult: number;
}
