# CryptoStrike — Economy & Asset System

---

## 1. Currency Economy (Gold & Gems)

### Single Source of Truth

Both currencies live **exclusively** inside `UserProfile`:

```ts
// src/context/GameStateContext.tsx — UserProfile interface
gold: number;   // default 500
gems: number;   // default 10
```

They are **not** exposed as separate top-level context fields. Every screen reads them via:

```ts
const { user } = useGame();
// user.gold  /  user.gems
```

### Persistence

- Writes to `localStorage` key `cryptostrike_user` on every `setUser(...)` call (debounced or direct).
- On app load, if key exists with partial data, it is merged with defaults (`parsed.gold ?? 500`, `parsed.gems ?? 10`).
- Fresh install gives **500 gold** and **10 gems**.

### Earning

After a battle win:

```ts
// GameStateContext.tsx line ~1124
const goldReward = 50 + round * 10;
const gemReward = 1;
setUser(prev => ({
  ...prev,
  gold: prev.gold + goldReward,
  gems: prev.gems + gemReward
}));
```

- **Gold**: `50 + round × 10` (scales with progression).
- **Gems**: 1 per win (fixed, rare reward).

### Spending

`purchaseItem(id, currency)` in GameStateContext (`src/context/GameStateContext.tsx:262`):

1. Finds the item in `WEARABLES` by `id`.
2. Reads cost from `item.price` (gold) or `item.gemCost` (gems).
3. Validates sufficient funds: `prev.gold >= cost` or `prev.gems >= cost`.
4. Validates not already owned: `!prev.purchasedItems.includes(id)`.
5. Deducts from `gold` or `gems` and appends `id` to `purchasedItems`.

### Display

- **HomeScreen** balance bar: `💰{user.gold}  💎{user.gems}`.
- **ItemsScreen** header: `💰{gold}  💎{gems}  Owned: X/3`.
- **BattleScreen** top bar: `💰{user.gold}  💎{user.gems}`.
- **PurchaseModal**: shows gold price button and optional gem price button with insufficient-funds indicator.

### Item Pricing (src/data/wearables.ts)

| Item       | Gold  | Gems | Free? |
|------------|-------|------|-------|
| Sprite Helm (head1) | 200 | 5 | No |
| Sprite Armor (body1) | 300 | 8 | No |
| Pixel Boots (boots1) | 0 | 0 | **Yes** |

`FREE_ITEM_IDS = ['boots1']` — injected on fresh user creation and also merged on existing user load.

---

## 2. WIP / Known Gaps

- **Campaign mode** — HomeScreen card is disabled; no campaign levels exist.
- **No gem-only earn path** — gems only drop from PvE wins (1 per win). No repeatable farm or daily reward.
- **No shop refresh / timers** — items are permanently purchasable once.
- **Item stat bonuses are decorative** — `statBonus` field in `WearableItem` is displayed but not hooked into battle mechanics (no real +ATK/+DEF from items yet).
- **No purchase confirmation animation** — instant deduction, no coin-spend VFX.
- **No refund system** — items cannot be sold back.
- **Coin (market) prices** — the chosen trade coin (`selectedCoin`) has entry/current price tracking in battle but no tie to earning/spending.

---

## 3. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| **localStorage tampering** | User can open DevTools and edit gold/gems. Acceptable for an offline-only game — no server authority. |
| **XSS via stored data** | Values are plain numbers. No HTML rendering of stored strings that could inject scripts. |
| **Circular / corrupted data** | Merge with defaults on load via `??` operator. If `gold` is `null` or missing, falls back to `500`. |
| **Negative balances** | All purchase paths check `hasFunds` before deducting. No code path subtracts without validation. |
| **Duplicate purchases** | `purchasedItems.includes(id)` guard prevents buying the same item twice. |
| **Race conditions** | `setUser(prev => ...)` functional updater ensures atomic state transitions even within rapid dispatches. |

**Bottom line**: For an offline client-side game, the current approach is appropriate. If this ever moves to a server-authoritative model, all currency operations must move server-side with HMAC or signed requests.

---

## 4. Recommendations

1. **Stat integration** — Wire `statBonus` into `FighterState` so equipped items affect actual battle damage.
2. **Gem sink** — Add a skin/color shop that costs only gems, or a loot-box style gem burn.
3. **Daily reward** — `lastLogin` timestamp in `UserProfile`; grant gold/gems on first visit each day.
4. **Item sell-back** — `sellItem(id)` returning 50% gold cost (no gems).
5. **Visual feedback** — Coin-spend particles / shake animation on purchase confirm.
6. **Storage encryption** — Light XOR or `btoa` obfuscation (not real security but deters casual DevTools editing).

---

## 5. Character System

### Spritesheet Format

All character sprites are **48×80 pixels** = 3 columns × 4 rows of **16×20 frames**.

```
+----+----+----+  ← row 0 (direction: front)
+----+----+----+  ← row 1 (direction: left)
+----+----+----+  ← row 2 (direction: right)
+----+----+----+  ← row 3 (direction: back)
```

### Sprite Files (`public/sprites/`)

Six player-choosable fighters, each with a dedicated spritesheet:

| Key | File | Color |
|-----|------|-------|
| `char_one` | `character_one.png` | `#60C8F0` (blue) |
| `char_two` | `character_two.png` | `#6EE7A0` (green) |
| `char_three` | `character_three.png` | `#7B8FD4` (lavender) |
| `char_four` | `character_four.png` | `#E0924A` (orange) |
| `char_five` | `character_five.png` | `#F0A0C8` (pink) |
| `char_six` | `character_six.png` | `#E86070` (red) |

Plus `character_plain.png` — the base dress-up character (no items drawn on it at asset level).

### Manifest (`public/sprites/manifest.json`)

- `referenceFrames: 4` — all animations (`idle`, `attack`, `defend`, `hurt`, `victory`) have 4 frames.
- `fps` defines animation speed per state (6–12 fps).
- `useReferenceSprite: true` — renders via a single spritesheet per character rather than per-pose PNG files.
- `characterSprites` map links character key → filename.
- `wearables` map now includes our 3 shop items (`head1`, `body1`, `boots1`).

### Battle Sprites (`FighterSprite.tsx`)

- Canvas-driven (`<canvas>`) with own `requestAnimationFrame` loop — no React re-renders on frame ticks.
- Auto-detects actual columns from `img.width / FRAME_W` (safety guard for non-standard sheets).
- Supports `flipX` for enemy mirroring, `status` for buff/debuff tint overlay.
- Composites wearable layers: loads each equipped item's sprite sheet via `getWearableSheetPath()` and draws on separate layers.
- Exposed props: `characterKey`, `equippedItems`, `pose`, `frame`, `playing`, `isEnemy`, `size`, etc.

### Dress-Up Character (`MyCharacterScreen.tsx`)

- Uses `character_plain.png` as base, renders via canvas with a simple **3-frame walk cycle** at 6 fps.
- **Direction pad**: ↑↓←→ keys or click to face front/left/right/back.
  - Row 0 = front, Row 1 = left, Row 2 = right, Row 3 = back.
- **Sprite overlays** for equipped items drawn directly on top of `character_plain.png`:

```ts
const OVERLAY_SPRITES: Record<string, string> = {
  head1:  '/sprite_head/head_1.png',
  body1:  '/sprite_body/body_1.png',
  boots1: '/sprite_shoes/shoes_1.png',
};
```

Each overlay is **48×80** (same layout as base), so frames line up perfectly.
- Category tabs filter which equipped items are rendered (head/body/boots).

---

## 6. Item Shop & Overlay System

### Item Data (`src/data/wearables.ts`)

```ts
export interface WearableItem {
  id: string;
  name: string;
  emoji: string;
  category: 'head' | 'body' | 'boots';
  description: string;
  statBonus: string;   // decorative for now
  price: number;       // gold cost (0 = free)
  gemCost: number;     // gem cost (0 = not available)
}
```

3 items total:

| ID | Name | Category | Price | Gem Cost |
|----|------|----------|-------|----------|
| head1 | Sprite Helm | head | 200g | 5 gems |
| body1 | Sprite Armor | body | 300g | 8 gems |
| boots1 | Pixel Boots | boots | **FREE** | **FREE** |

### Purchase Flow

```
ItemsScreen → PurchaseModal → onBuy('gold'|'gems')
    → GameStateContext.purchaseItem(id, currency)
    → validate funds + not owned → deduct → add to purchasedItems
    → user state updated → all screens re-read via `user.gold` / `user.gems`
```

### Equip System

- `cosmeticItems: string[]` in UserProfile tracks currently equipped item IDs.
- `toggleCosmeticItem(id)` enforces **one per category**: equipping `head1` removes any other head item first.
- Unequip by tapping an already-equipped item (removes it from the array).

### Overlay Sprite Files

| Item | Path |
|------|------|
| head1 | `public/sprite_head/head_1.png` |
| body1 | `public/sprite_body/body_1.png` |
| boots1 | `public/sprite_shoes/shoes_1.png` |

All are 48×80 (3×4 frames of 16×20), matching the base `character_plain.png` frame layout.

### ItemsScreen

- Tabbed by category (head / body / boots).
- Currency header: `💰{gold}  💎{gems}  Owned: X/3`.
- Sprite thumbnails rendered via canvas.
- Owned items toggle equip/unequip. Non-owned items open `PurchaseModal`.
- Free item (`boots1`) shows "OWNED" by default.

---

## 7. File Reference

| File | Purpose |
|------|---------|
| `src/context/GameStateContext.tsx` | Currency state, purchase logic, battle rewards, user persistence |
| `src/data/wearables.ts` | Item definitions, categories, FREE_ITEM_IDS |
| `src/data/spriteManifest.ts` | Sprite sheet paths, frame counts, wearable layer resolution |
| `src/features/sprites/FighterSprite.tsx` | Battle sprite renderer (canvas + layers) |
| `src/features/character/MyCharacterScreen.tsx` | Dress-up view with direction controls & overlays |
| `src/features/inventory/ItemsScreen.tsx` | Item shop/browser with purchase integration |
| `src/components/feedback/PurchaseModal.tsx` | Gold/gem purchase dialog |
| `public/sprites/manifest.json` | Sprite sheet metadata, character mappings |
| `public/sprite_head/head_1.png` | Head overlay sprite |
| `public/sprite_body/body_1.png` | Body overlay sprite |
| `public/sprite_shoes/shoes_1.png` | Boots overlay sprite |
| `public/sprites/character_plain.png` | Base dress-up character |
| `public/sprites/character_{one..six}.png` | Playable fighter spritesheets |
