import type { Item } from '../types/game';

export const CAMPAIGN_ITEMS: Item[] = [
  // Chapter 1: The Market Opens
  {
    id: 'bulls_eye',
    name: "Bull's Eye",
    icon: '🎯',
    slot: 'weapon',
    statText: '+0.25 ATK, +5% Crit',
    effect: { atk: 0.25 },
    isActive: false,
  },
  {
    id: 'market_cap',
    name: 'Market Cap',
    icon: '📊',
    slot: 'outfit',
    statText: '+10% DEF, +10 HP',
    effect: { def: 0.10 },
    isActive: false,
  },
  {
    id: 'entry_point',
    name: 'Entry Point',
    icon: '📍',
    slot: 'boots',
    statText: '+20 SPD',
    effect: { spd: 20 },
    isActive: false,
  },
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    icon: '💎',
    slot: 'item',
    statText: 'HOLD heals +10',
    effect: { type: 'hodl' },
    isActive: true,
  },

  // Chapter 2: Bear Territory
  {
    id: 'bear_claw',
    name: 'Bear Claw',
    icon: '🐻',
    slot: 'weapon',
    statText: '+0.3 ATK',
    effect: { atk: 0.3 },
    isActive: false,
  },
  {
    id: 'short_seller',
    name: 'Short Seller',
    icon: '📉',
    slot: 'outfit',
    statText: '+15% DEF',
    effect: { def: 0.15 },
    isActive: false,
  },
  {
    id: 'stop_loss',
    name: 'Stop Loss',
    icon: '🛑',
    slot: 'boots',
    statText: '+25 SPD',
    effect: { spd: 25 },
    isActive: false,
  },
  {
    id: 'paper_hands',
    name: 'Paper Hands',
    icon: '📄',
    slot: 'item',
    statText: 'Block 1 wrong trade',
    effect: { type: 'ledger' },
    isActive: true,
  },

  // Chapter 3: Volatility Zone
  {
    id: 'market_maker',
    name: 'Market Maker',
    icon: '👑',
    slot: 'weapon',
    statText: '+0.35 ATK',
    effect: { atk: 0.35 },
    isActive: false,
  },
  {
    id: 'volatility_shield',
    name: 'Volatility Shield',
    icon: '🛡️',
    slot: 'outfit',
    statText: '+20% DEF',
    effect: { def: 0.20 },
    isActive: false,
  },
  {
    id: 'flash_crash',
    name: 'Flash Crash',
    icon: '⚡',
    slot: 'boots',
    statText: '+30 SPD',
    effect: { spd: 30 },
    isActive: false,
  },
  {
    id: 'oracle',
    name: 'Oracle',
    icon: '🔮',
    slot: 'item',
    statText: 'Next CALL x1.5',
    effect: { type: 'whale' },
    isActive: true,
  },
];

export function getCampaignItemById(id: string): Item | undefined {
  return CAMPAIGN_ITEMS.find(item => item.id === id);
}
