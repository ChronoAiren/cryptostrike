# CryptoStrike Campaign System — Design Spec

## Core Concept

Campaign is a **standalone story-driven mode**. It is NOT VS AI.

- The player always uses **their own character** (`my_character` sprite + their username + their cosmetic wearables + their profile stats).
- The player **never** sees a class selection screen in campaign. There is no item equip screen. There is no coin choose screen.
- Campaign has its own **level system** with XP and stat bonuses that are scoped entirely to campaign. These do NOT affect the player's permanent VS AI profile.

---

## Player Character

| Aspect | Source |
|--------|--------|
| **Sprite** | Always `my_character` (the plain base character body) |
| **Overlays** | `user.cosmeticItems` — helmets, armor, boots rendered on top of the base sprite via `OVERLAY_SPRITES` |
| **Name** | `user.username` (or "My Character" if unset) |
| **Base Stats** | `user.baseHp`, `user.baseAtk`, `user.baseDef`, `user.baseSpd`, `user.baseLk` |
| **Cosmetic Bonuses** | Stat bonuses from equipped cosmetic wearables (ATK%, DEF%, SPD flat) |
| **Campaign Level Bonuses** | Flat stat bonuses earned from leveling up during campaign (see Level System) |
| **Final Battle Stats** | `baseStats + cosmeticBonuses + levelBonuses` |

The player does NOT use class definition stats (`CLASSES[char_one].hp` etc.). The `CLASSES` data is only used for enemy definitions and display names.

---

## Level System

- Stored in `CampaignProgress` (persisted to localStorage under `cryptostrike_campaign`)
- NOT stored in `UserProfile` — campaign leveling is completely separate from VS AI

### Progression

| Field | Default | Description |
|-------|---------|-------------|
| `level` | 1 | Current campaign level |
| `xp` | 0 | Current XP toward next level |
| `xpToNext` | 100 | XP required for next level |
| `levelBonuses` | `{ hp: 0, atk: 0, def: 0, spd: 0, lk: 0 }` | Flat stat bonuses from leveling |

### Level-Up Mechanic

When XP is claimed and `xp >= xpToNext`:

1. Deduct `xpToNext` from `xp`, increment `level`
2. New `xpToNext = floor(old xpToNext * 1.25)`
3. **Roll ONE random stat** from `[HP, ATK, DEF, SPD, LCK]` (equal 20% chance each)
4. Add **+1 to +5 flat points** to that stat in `levelBonuses`
5. If multiple level-ups occur in one XP claim, repeat step 1-4 for each

### Stat Boost Scales

| Stat | Points Added | Effect |
|------|-------------|--------|
| HP | 1-5 | +1 to +5 max HP |
| ATK | 1-5 | +0.01 to +0.05 ATK (points / 100) |
| DEF | 1-5 | +0.001 to +0.005 DEF (points / 1000) |
| SPD | 1-5 | +1 to +5 speed |
| LCK | 1-5 | +1 to +5 luck |

---

## Enemy Design

### Boss Enemies (6 total — end of each chapter)

- Use **other character class sprites** (Ice Mage, Shadow Knight, Berserker, Blood Knight, etc.)
- Stats defined in `campaign.ts` with `difficultyMultiplier` scaling
- Displayed with their class name and emoji on the campaign map
- Get random cosmetic wearables overlaid (visual variety)

### Normal Enemies (12 total — non-boss stages)

- Use the **base character sprite** (`my_character`) — same body as the player
- Dressed with **1-3 random cosmetic wearables** (helmets, armor, boots) so each enemy looks visually distinct
- Stats defined in `campaign.ts` with `difficultyMultiplier` scaling
- On the campaign map, their class emoji/name is shown as flavor, but in battle they appear as a dressed-up base character

### Random Wearable Assignment

For each battle, `startCampaignBattle` randomly picks:
- 1-3 wearables from the pool `['head1'..'head4', 'body1'..'body4', 'boots1'..'boots4']`
- One per slot category (head, body, boots), shuffled order
- Stored in `enemyCosmeticItems` state, passed to BattleScreen's enemy `FighterSprite` as `overlaySources`

---

## Battle Flow

```
Home Screen
  → Click "CAMPAIGN"
    → Campaign Map (select chapter + stage)
      → Stage Intro (typewriter dialogue with enemy)
        → Battle (same BattleScreen as VS AI, but with campaign setup)
          → Campaign End (victory/defeat, rewards)
            → Claim rewards (gold, gems, items manually; XP auto-claimed)
              → Next Stage / Campaign Map
```

**Screens skipped** (compared to VS AI):
- Class Select — never shown
- Item Equip — never shown
- Coin Choose — coin is forced by the stage definition

---

## Rewards

### Reward Types

| Type | Claim | Effect |
|------|-------|--------|
| Gold | Manual (Claim button) | Added to `user.gold` |
| Gems | Manual (Claim button) | Added to `user.gems` |
| XP | **Auto-claimed** on victory | Added to `campaignProgress.xp`, triggers level-up |
| Item | Manual (Claim button) | Added to `user.purchasedItems` (campaign-exclusive items) |

### Campaign-Exclusive Items (12 total)

| Chapter | Weapon | Outfit | Boots | Active Item |
|---------|--------|--------|-------|-------------|
| 1: The Market Opens | Bull's Eye (+0.25 ATK) | Market Cap (+10% DEF) | Entry Point (+20 SPD) | Diamond Hands (HOLD heals +10) |
| 2: Bear Territory | Bear Claw (+0.30 ATK) | Short Seller (+15% DEF) | Stop Loss (+25 SPD) | Paper Hands (Block 1 wrong trade) |
| 3: Volatility Zone | Market Maker (+0.35 ATK) | Volatility Shield (+20% DEF) | Flash Crash (+30 SPD) | Oracle (Next CALL x1.5) |

---

## File Responsibilities

| File | Role |
|------|------|
| `src/types/campaign.ts` | TypeScript interfaces: `CampaignProgress`, `CampaignState`, `CampaignStage`, `LevelBonuses` |
| `src/data/campaign.ts` | 3 chapters x 6 stages with dialogue, enemy configs, rewards, difficulty multipliers |
| `src/data/campaignItems.ts` | 12 campaign-exclusive items (4 per chapter) |
| `src/context/GameStateContext.tsx` | Campaign state, actions (`goToCampaignMap`, `selectCampaignStage`, `startCampaignBattle`, `completeCampaignStage`, `claimCampaignReward`), level-up logic |
| `src/features/campaign/CampaignMapScreen.tsx` | Campaign hub — chapter tabs, stage list, player character display |
| `src/features/campaign/StageIntroScreen.tsx` | Pre-battle dialogue with typewriter effect |
| `src/features/campaign/CampaignEndScreen.tsx` | Post-battle results, reward claiming, level display |
| `src/features/battle/BattleScreen.tsx` | Shared battle screen — renders player + enemy sprites with overlays |
| `src/features/home/HomeScreen.tsx` | Campaign button routes to `goToCampaignMap()` |

---

## Key Invariants

1. **Campaign always uses `my_character`** — the player's sprite, name, cosmetics, and profile stats. Never another class.
2. **No class selection in campaign** — `selectedClass` is forced to `'my_character'` when entering campaign.
3. **No battle items in campaign** — only cosmetic wearable bonuses apply. `equippedItems` (Satoshi Blade, etc.) are ignored.
4. **Level bonuses are campaign-only** — stored in `CampaignProgress.levelBonuses`, never written to `UserProfile`.
5. **Bosses use class sprites, normals use base sprite** — `spriteKey` is `stage.enemy.classKey` for bosses, `'my_character'` for normals.
6. **XP is auto-claimed** — gold/gems/items require manual claiming.
