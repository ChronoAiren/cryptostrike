export interface TagItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export const TAGS: TagItem[] = [
  { id: 'first_blood', name: 'First Blood', emoji: '🩸', description: 'Win your first battle', rarity: 'common' },
  { id: 'bull_veteran', name: 'Bull Veteran', emoji: '🐂', description: 'Win 10 VS AI battles', rarity: 'common' },
  { id: 'level_5', name: 'Rising Star', emoji: '⭐', description: 'Reach campaign level 5', rarity: 'common' },
  { id: 'speedrunner', name: 'Speedrunner', emoji: '⏱️', description: 'Win a battle in 3 rounds or less', rarity: 'common' },
  { id: 'bear_slayer', name: 'Bear Slayer', emoji: '🐻', description: 'Defeat The Bear King', rarity: 'common' },
  { id: 'diamond_hands', name: 'Diamond Hands', emoji: '💎', description: 'Complete Chapter 1', rarity: 'rare' },
  { id: 'iron_will', name: 'Iron Will', emoji: '🛡️', description: 'Win a battle without taking damage', rarity: 'rare' },
  { id: 'liquidator_fallen', name: "Liquidator's Bane", emoji: '⚔️', description: 'Defeat The Liquidator', rarity: 'rare' },
  { id: 'bull_market_survivor', name: 'Bull Market Survivor', emoji: '📈', description: 'Complete Chapter 2', rarity: 'rare' },
  { id: 'whale_hunter', name: 'Whale Hunter', emoji: '🐋', description: 'Beat all whale-themed enemies', rarity: 'rare' },
  { id: 'level_10', name: 'Veteran Trader', emoji: '🏆', description: 'Reach campaign level 10', rarity: 'rare' },
  { id: 'market_maker_defeated', name: 'Market Conqueror', emoji: '👑', description: 'Defeat The Market Maker', rarity: 'legendary' },
  { id: 'perfect_run', name: 'Perfect Run', emoji: '✨', description: 'Complete all 18 stages', rarity: 'legendary' },
  { id: 'level_15', name: 'Elite Trader', emoji: '💰', description: 'Reach campaign level 15', rarity: 'legendary' },
];

export function getTagById(id: string): TagItem | undefined {
  return TAGS.find(t => t.id === id);
}

export function getTagRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary': return '#F59E0B';
    case 'rare': return '#A855F7';
    default: return '#6B7280';
  }
}
