export type WearableCategory = 'head' | 'body' | 'boots';

export interface WearableItem {
  id: string;
  name: string;
  emoji: string;
  category: WearableCategory;
  description: string;
  statBonus: string;
  price: number; // 0 = free starter item; gold cost otherwise
  gemCost: number; // alternative gem cost (0 = not available)
}

export const FREE_ITEM_IDS = ['boots1'];

export const WEARABLE_CATEGORIES: { key: WearableCategory; label: string; icon: string }[] = [
  { key: 'head', label: 'HEADGEARS', icon: '🪖' },
  { key: 'body', label: 'BODY', icon: '🛡️' },
  { key: 'boots', label: 'BOOTS', icon: '🥾' },
];

export const WEARABLES: WearableItem[] = [
  { id: 'head1',  name: 'Sprite Helm',   emoji: '🪖', category: 'head',  description: 'Pixel-rendered helm for front-line staking.', statBonus: '+8% DEF', price: 200, gemCost: 5 },
  { id: 'body1',  name: 'Sprite Armor',  emoji: '🛡️', category: 'body',  description: 'Pixel armor forged in the blockchain forge.', statBonus: '+8% DEF', price: 300, gemCost: 8 },
  { id: 'boots1', name: 'Pixel Boots',   emoji: '🥾', category: 'boots', description: 'Sprite-rendered boots for on-chain stomping.', statBonus: '+15 SPD', price: 0, gemCost: 0 },
];

export function getItemCategory(id: string): WearableCategory | null {
  return WEARABLES.find(w => w.id === id)?.category ?? null;
}
