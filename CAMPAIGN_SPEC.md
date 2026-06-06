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

### Enemy Passives

Every campaign enemy has a **passive ability** matching their class. Enemies use weaker versions of player passives. Bosses get enhanced versions.

| Passive | Normal Enemy | Boss (Enhanced) |
|---------|-------------|-----------------|
| **alpha** (Ice Mage) | Correct trade 1.2x profit | 1.4x profit |
| **research** (Forest Ranger) | Buffs/debuffs +1 duration on correct | +2 duration |
| **ironwall** (Shadow Knight) | DEF cap 70%, +3% DEF per correct defend | DEF cap 80%, +8% per defend |
| **bloodrush** (Berserker) | +0.03 ATK per hit (cap 1.4x) | +0.05 ATK per hit (cap 1.6x) |
| **fortune** (Enchantress) | HOLD heals 10 HP, LCK x1.5 for crit | HOLD heals 20, LCK x2 crit |
| **sendit** (Blood Knight) | EXTREME x1.5 bonus, comeback at 15% HP | EXTREME x2.0, comeback at 25% HP |

### Boss Enemies (3 total — end of each chapter)

- Use **their class sprites** (Shadow Knight for Bear King, Blood Knight for Liquidator/Market Maker)
- Stats defined in `campaign.ts` with `difficultyMultiplier` scaling
- Enhanced passive abilities (see table above)
- No random wearables (they use class sprites)
- The Market Maker (final boss) has the strongest version: EXTREME x2.5, comeback at 30% HP, +0.05 ATK every 3 rounds

### Normal Enemies (15 total — non-boss stages)

- Use the **base character sprite** (`my_character`) — same body as the player
- Dressed with **1-3 random cosmetic wearables** (helmets, armor, boots) for visual variety
- Stats defined in `campaign.ts` with `difficultyMultiplier` scaling
- Each has a passive ability matching their class (weaker than boss versions)

### Enemy Stats (with passives applied)

| Stage | Enemy | HP | ATK | DEF | SPD | LK | Passive | DiffMult |
|-------|-------|----|-----|-----|-----|----|---------|----------|
| 1-1 | Rookie Trader | 80 | 0.90 | 0.06 | 45 | 25 | research | 1.00 |
| 1-2 | Day Trader | 70 | 1.00 | 0.04 | 60 | 15 | alpha | 1.05 |
| 1-3 | HODLer | 100 | 0.80 | 0.15 | 40 | 10 | ironwall | 1.10 |
| 1-4 | FOMO Trader | 80 | 1.15 | 0.05 | 55 | 20 | bloodrush | 1.15 |
| 1-5 | Whale Scout | 90 | 1.00 | 0.10 | 50 | 30 | fortune | 1.20 |
| **1-6** | **The Bear King** | **140** | **1.15** | **0.20** | **40** | **10** | **ironwall** | **1.30** |
| 2-1 | Bear Raider | 85 | 1.20 | 0.08 | 55 | 20 | bloodrush | 1.25 |
| 2-2 | The Shorter | 75 | 1.30 | 0.05 | 60 | 15 | alpha | 1.30 |
| 2-3 | Capitulator | 90 | 1.10 | 0.10 | 50 | 10 | sendit | 1.35 |
| 2-4 | FUD Spreader | 80 | 1.10 | 0.09 | 50 | 30 | fortune | 1.40 |
| 2-5 | Margin Trader | 100 | 1.20 | 0.11 | 45 | 25 | research | 1.45 |
| **2-6** | **The Liquidator** | **160** | **1.30** | **0.15** | **50** | **10** | **sendit** | **1.50** |
| 3-1 | Flash Trader | 90 | 1.30 | 0.08 | 60 | 15 | alpha | 1.55 |
| 3-2 | The Algorithm | 85 | 1.25 | 0.10 | 45 | 25 | research | 1.60 |
| 3-3 | Whale Trader | 120 | 1.10 | 0.18 | 40 | 10 | ironwall | 1.65 |
| 3-4 | Manipulator | 95 | 1.35 | 0.06 | 55 | 20 | bloodrush | 1.70 |
| 3-5 | The Insider | 100 | 1.30 | 0.12 | 50 | 30 | fortune | 1.75 |
| **3-6** | **The Market Maker** | **180** | **1.45** | **0.20** | **50** | **10** | **sendit** | **2.00** |

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
| `src/data/tags.ts` | 14 achievement tags with rarity, emoji, and unlock conditions |
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
7. **Enemy passives are active** — each enemy has a passive ability matching their class, applied during battle resolution.
8. **Tags/Titles are earned** — players earn display tags for achievements, shown on the home screen.

---

## Tag/Title System

Players earn **tags** (display titles) for completing achievements. Tags are shown on the home screen below the username.

### Available Tags

| ID | Name | Emoji | Rarity | Unlock Condition |
|----|------|-------|--------|-----------------|
| `first_blood` | First Blood | 🩸 | Common | Win your first battle |
| `bull_veteran` | Bull Veteran | 🐂 | Common | Win 10 VS AI battles |
| `level_5` | Rising Star | ⭐ | Common | Reach campaign level 5 |
| `speedrunner` | Speedrunner | ⏱️ | Common | Win a battle in 3 rounds or less |
| `bear_slayer` | Bear Slayer | 🐻 | Common | Defeat The Bear King |
| `diamond_hands` | Diamond Hands | 💎 | Rare | Complete Chapter 1 |
| `iron_will` | Iron Will | 🛡️ | Rare | Win a battle without taking damage |
| `liquidator_fallen` | Liquidator's Bane | ⚔️ | Rare | Defeat The Liquidator |
| `bull_market_survivor` | Bull Market Survivor | 📈 | Rare | Complete Chapter 2 |
| `whale_hunter` | Whale Hunter | 🐋 | Rare | Beat all whale-themed enemies |
| `level_10` | Veteran Trader | 🏆 | Rare | Reach campaign level 10 |
| `market_maker_defeated` | Market Conqueror | 👑 | Legendary | Defeat The Market Maker |
| `perfect_run` | Perfect Run | ✨ | Legendary | Complete all 18 stages |
| `level_15` | Elite Trader | 💰 | Legendary | Reach campaign level 15 |

### Tag Mechanics

- Tags are stored in `user.unlockedTags` (array of tag IDs)
- `user.currentTag` holds the currently displayed tag ID
- Tags are awarded automatically on battle completion (`endBattle`) and stage completion (`completeCampaignStage`)
- Players can change their displayed tag in the Profile screen
- Tags auto-assign to the newest earned tag if the player hasn't customized their selection

### Tag Display

- Home screen shows the tag as a colored pill below the username
- Rarity colors: Common = grey, Rare = purple, Legendary = gold
- Profile screen shows all unlocked tags as selectable pills, locked tags greyed out with unlock hints
