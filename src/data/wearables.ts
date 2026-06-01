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
  { id: 'head1',  name: 'Sprite Helm',   emoji: '🪖', category: 'head',  description: 'Pixel-rendered helm for front-line staking.', statBonus: '+8% DEF', price: 0, gemCost: 0 },
  { id: 'body1',  name: 'Sprite Armor',  emoji: '🛡️', category: 'body',  description: 'Pixel armor forged in the blockchain forge.',  statBonus: '+8% DEF', price: 0, gemCost: 0 },
  { id: 'boots1', name: 'Pixel Boots',   emoji: '🥾', category: 'boots', description: 'Sprite-rendered boots for on-chain stomping.', statBonus: '+15 SPD', price: 0, gemCost: 0 },
  { id: 'head2',  name: 'MAGA Cap',     emoji: '🧢', category: 'head',  description: 'Make crypto great again — a cap that means business.', statBonus: '+10% ATK', price: 0, gemCost: 0 },
  { id: 'body2',  name: 'MAGA Suit',    emoji: '👔', category: 'body',  description: 'Power suit for the deal-maker in chief.',         statBonus: '+8% ATK', price: 0, gemCost: 0 },
  { id: 'boots2', name: 'MAGA Boots',   emoji: '👢', category: 'boots', description: 'Leather boots built for the long march ahead.',   statBonus: '+10 SPD', price: 0, gemCost: 0 },

  // X-Set — Elon Musk inspired
  { id: 'head3',  name: 'X-Crown',    emoji: '👑', category: 'head',  description: 'Mind over market — neural-linked crown.',          statBonus: '+10% ATK', price: 0, gemCost: 0 },
  { id: 'body3',  name: 'X-Suit',     emoji: '🦺', category: 'body',  description: 'The future-fit for digital warriors.',            statBonus: '+10% ATK', price: 0, gemCost: 0 },
  { id: 'boots3', name: 'X-Kicks',    emoji: '👟', category: 'boots', description: 'Sprint ahead of the curve — built for speed.',    statBonus: '+12 SPD',  price: 0, gemCost: 0 },

  // Set 4
  { id: 'head4',  name: 'Set 4 Head', emoji: '🎩', category: 'head',  description: 'Set 4 headgear.',                                 statBonus: '+10% ATK', price: 0, gemCost: 0 },
  { id: 'body4',  name: 'Set 4 Body', emoji: '🥋', category: 'body',  description: 'Set 4 body armor.',                              statBonus: '+8% ATK',  price: 0, gemCost: 0 },
  { id: 'boots4', name: 'Set 4 Boots',emoji: '⛸️', category: 'boots', description: 'Set 4 footwear.',                                statBonus: '+10 SPD',  price: 0, gemCost: 0 },
];

export function getItemCategory(id: string): WearableCategory | null {
  return WEARABLES.find(w => w.id === id)?.category ?? null;
}

// Maps cosmetic item id → overlay sprite sheet path for compositing on character_plain.png
export const OVERLAY_SPRITES: Record<string, string> = {
  head1: '/sprite_head/head_1.png',
  body1: '/sprite_body/body_1.png',
  boots1: '/sprite_shoes/shoes_1.png',
  head2: '/sprite_head/head_2.png',
  body2: '/sprite_body/body_2.png',
  boots2: '/sprite_shoes/shoes_2.png',
  head3: '/sprite_head/head_3.png',
  body3: '/sprite_body/body_3.png',
  boots3: '/sprite_shoes/shoes_3.png',
  head4: '/sprite_head/head_4.png',
  body4: '/sprite_body/body_4.png',
  boots4: '/sprite_shoes/shoes_4.png',
};
