import manifestJson from '../../public/sprites/manifest.json';
import type { SpriteState, SpriteLayer } from '../types/game';

export interface SpriteManifest {
  frameSize: number;
  frameWidth?: number;
  frameHeight?: number;
  layerOrder: SpriteLayer[];
  useWraithSprites?: boolean;
  useGandalfSprites?: boolean;
  useReferenceSprite?: boolean;
  referenceSprite?: string;
  referenceFrames?: number;
  fps: Record<SpriteState, number>;
  frameCounts: Record<SpriteState, number>;
  characters: string[];
  /** Maps character key → sprite filename in /public/sprites/ */
  characterSprites?: Record<string, string>;
  gandalfAssets?: {
    maleSkins: string[];
    femaleSkins: string[];
    maleClothing: string[];
    femaleClothing: string[];
    maleHair: string[];
    femaleHair: string[];
  };
  wearables: Record<string, { slot: SpriteLayer; prefix: string }>;
  itemUiIds: string[];
  characterColors: Record<string, string>;
}

export const SPRITE_MANIFEST = manifestJson as SpriteManifest;

export const SPRITE_STATES: SpriteState[] = ['idle', 'attack', 'defend', 'hurt', 'victory'];

export const ITEM_LAYER_MAP: Record<string, SpriteLayer> = {
  barmor: 'clothing',
  sblade: 'hand',
  nboots: 'clothing',
  lshield: 'hand',
  bflag: 'hand',
};

export function resolveCharacterKey(characterKey: string): string {
  if (SPRITE_MANIFEST.characters.includes(characterKey)) return characterKey;
  return characterKey;
}

/** GandalfHardcore composites are single body layers — no wearable PNG overlays */
export function usesLayeredBodyOnly(): boolean {
  return SPRITE_MANIFEST.useGandalfSprites === true || SPRITE_MANIFEST.useWraithSprites === true;
}

export function getFrameCount(pose: SpriteState): number {
  return SPRITE_MANIFEST.frameCounts[pose] ?? 1;
}

export function getFps(pose: SpriteState): number {
  return SPRITE_MANIFEST.fps[pose] ?? 8;
}

export function getBodySheetPath(characterKey: string, _pose: SpriteState): string {
  if (SPRITE_MANIFEST.useReferenceSprite) {
    // Use per-character sprite file if available, else fall back to referenceSprite
    const perChar = SPRITE_MANIFEST.characterSprites?.[characterKey];
    if (perChar) return `/sprites/${perChar}`;
    return `/sprites/${SPRITE_MANIFEST.referenceSprite || 'character_one.png'}`;
  }

  if (!SPRITE_MANIFEST.useGandalfSprites) {
    const folder = resolveCharacterKey(characterKey);
    return `/sprites/characters/${folder}/body_${_pose}.png`;
  }

  // GandalfHardcore assets - return sprite sheet path
  const gandalfAssets = SPRITE_MANIFEST.gandalfAssets;
  if (!gandalfAssets) return '/sprites/gandalf/Character skin colors/Male Skin1.png';

  const skinMap: Record<string, { gender: string; skin: string }> = {
    char_one:   { gender: 'male',   skin: 'Male Skin1' },
    char_two:   { gender: 'male',   skin: 'Male Skin2' },
    char_three: { gender: 'male',   skin: 'Male Skin3' },
    char_four:  { gender: 'male',   skin: 'Male Skin4' },
    char_five:  { gender: 'female', skin: 'Female Skin1' },
    char_six:   { gender: 'female', skin: 'Female Skin2' },
  };

  const config = skinMap[characterKey] || { gender: 'male', skin: 'Male Skin1' };
  return `/sprites/gandalf/Character skin colors/${config.skin}.png`;
}

export function getWearableSheetPath(itemId: string, pose: SpriteState): string | null {
  if (!SPRITE_MANIFEST.useGandalfSprites) {
    if (usesLayeredBodyOnly()) return null;
    const meta = SPRITE_MANIFEST.wearables[itemId];
    if (!meta) return null;
    const folder =
      meta.slot === 'outfit'
        ? `outfit/${itemId}`
        : meta.slot === 'weapon'
          ? `weapon/${itemId}`
          : `accessory/${itemId}`;
    return `/sprites/wearables/${folder}/${meta.prefix}_${pose}.png`;
  }

  const gandalfAssets = SPRITE_MANIFEST.gandalfAssets;
  if (!gandalfAssets) return null;

  const meta = SPRITE_MANIFEST.wearables[itemId];
  if (!meta) return null;

  const clothingMap: Record<string, string> = {
    barmor: 'Shirt',
    nboots: 'Boots',
  };

  if (meta.slot === 'clothing') {
    const clothing = clothingMap[itemId];
    if (clothing) {
      return `/sprites/characters/Male Clothing/${clothing}.png`;
    }
  }

  return null;
}

export function getEquippedLayers(equippedItems: string[]): Partial<Record<SpriteLayer, string>> {
  if (usesLayeredBodyOnly()) return {};
  const layers: Partial<Record<SpriteLayer, string>> = {};
  for (const id of equippedItems) {
    const slot = ITEM_LAYER_MAP[id];
    if (slot) layers[slot] = id;
  }
  return layers;
}
