# CryptoStrike RPG — Game Design Document v1.0
> **For AI Builders:** This document is the single source of truth. Every mechanic, formula, flow, and state transition is defined here. Build exactly what is described. Where a range is given, use the midpoint as default. Do not invent mechanics not listed here.

---

## 1. GAME IDENTITY

| Field | Value |
|---|---|
| **Title** | CryptoStrike RPG |
| **Genre** | Turn-Based RPG + Real-Time Trading |
| **Platform** | Mobile-First (iOS & Android), portrait orientation |
| **Visual Style** | GBA Pokémon-inspired pixel art, crypto-themed world |
| **Core Fantasy** | "Get rich, get stronger, dominate the market" |
| **Session Length** | 3–7 minutes per battle |

### Elevator Pitch
A Pokémon-style turn-based RPG where every attack, defense, buff, and debuff is resolved through a real-time cryptocurrency trade. Players bet on live coin price direction — correct predictions deal damage, wrong ones reduce it. Character stats, item multipliers, and trade profit % combine into a single damage formula. The richer you get, the stronger you fight.

---

## 2. CORE GAME LOOP

```
[HUB TOWN]
     │
     ▼
[PRE-BATTLE PHASE]  ← Pick coin + equip items
     │
     ▼
[BATTLE: ROUND START] ← System randomly determines who goes first
     │
     ▼
[RPG PHASE — 10 seconds]
  Player chooses one of 5 buttons:
  • ATTACK      → auto-maps to CALL (Buy)
  • BUFF SELF   → auto-maps to CALL (Buy)
  • DEFEND      → auto-maps to PUT  (Sell)
  • DEBUFF ENEMY→ auto-maps to PUT  (Sell)
  • HOLD        → auto-maps to HOLD (Skip)
     │
     ▼
[MARKET PHASE — 15 seconds]
  Live crypto chart appears.
  Player's Call/Put/Hold is already locked from RPG phase.
  Enemy AI mirrors — also trades the same coin.
  Countdown timer resolves the candle.
     │
     ▼
[DAMAGE CALCULATION]
  Both player and enemy damage computed simultaneously.
  HP updated. Animations play.
     │
     ▼
[NEXT ROUND] ← Repeat until one fighter reaches 0 HP
     │
     ▼
[BATTLE END]
  Winner: Gold + XP + item drop chance
  Loser:  Minor consolation XP only
     │
     ▼
[HUB TOWN] ← Spend Gold, level up, restock items
```

---

## 3. HUB TOWN — WORLD NAVIGATION

The Hub Town is the player's home base between battles. It has four distinct districts. Navigation is a tap-based 2D map (top-down pixel art).

### Districts

| District | Function |
|---|---|
| **The Arena** | Queue for battles — PvP, AI opponent, or Market Challenge mode |
| **The Market** | Item Shop — buy gear, crypto event cards, market manipulation items |
| **The Guild** | View leaderboard, accept daily/weekly missions, join guilds |
| **The Vault** | Player profile, inventory, character stats, upgrade screen |

### Hub Town Rules for Builders
- Hub is always accessible after a battle ends.
- No time pressure in the Hub. All actions are menu-driven.
- Gold and Gems are displayed persistently in the top HUD bar.
- XP bar and current Level are visible in the top HUD bar at all times.

---

## 4. CHARACTER SYSTEM

### 4.1 Base Character
- Every new player starts with one default character sprite (pixel art, GBA style).
- The character has base stats that scale with Level.
- No character selection at launch — one fighter, upgradeable.

### 4.2 Base Stats

| Stat | Description | Starting Value | Growth per Level |
|---|---|---|---|
| **HP** | Total health points | 100 | +10 per level |
| **ATK** | Base attack multiplier | 1.0 | +0.05 per level |
| **DEF** | Damage reduction factor | 0.0 (0%) | +2% per level, max 60% |
| **SPD** | Affects turn order probability | 50 | +2 per level |
| **LUCK** | Affects item drop rate & crit chance | 10 | +1 per level |

### 4.3 Item Slots
- Each character has **3 item slots** active per battle.
- Items are equipped in the Vault before queuing for battle.
- Items are NOT swappable mid-battle.
- Item slots are visible in the battle UI at all times.

---

## 5. PRE-BATTLE PHASE

Triggered when a player queues for any battle mode.

### Flow
1. **Coin Selection Screen** — Player picks one cryptocurrency to battle with (e.g. BTC, ETH, SOL, DOGE, BNB). List shows coin name, logo, and a volatility rating (Low / Medium / High / Extreme). Higher volatility = higher risk/reward multiplier.
2. **Item Confirmation Screen** — Shows the 3 currently equipped items. Player can swap items here (tap slot → choose from inventory). Confirm when ready.
3. **Opponent Reveal** — Brief screen shows the enemy (AI character portrait or PvP opponent name + level). Enemy also selects their coin (same coin in mirror match — see Section 9).
4. **Battle Begins.**

### Coin Volatility Multiplier Table

| Volatility Rating | Damage Multiplier Applied |
|---|---|
| Low | ×1.0 |
| Medium | ×1.25 |
| High | ×1.5 |
| Extreme | ×2.0 |

---

## 6. BATTLE SYSTEM — DETAILED FLOW

### 6.1 Turn Order
- At the start of each round, the system compares both fighters' **SPD stat**.
- The fighter with higher SPD has a **60% chance** to go first.
- If SPD is equal, it is a pure 50/50 coin flip.
- "Going first" means your damage resolves before the opponent's in the animation sequence. Both trades still happen simultaneously in the market phase.

### 6.2 RPG Phase (10-Second Timer)

Player sees the battle screen with 5 action buttons. A 10-second countdown is visible.

```
┌─────────────────────────────┐
│        BATTLE SCREEN        │
│  [Enemy Sprite + HP Bar]    │
│                             │
│  [Player Sprite + HP Bar]   │
│  [Item Slot 1][2][3]        │
│                             │
│  ┌────────┐  ┌────────────┐ │
│  │ ATTACK │  │  BUFF SELF │ │  ← CALL group (auto Buy)
│  └────────┘  └────────────┘ │
│  ┌────────┐  ┌─────────────┐│
│  │ DEFEND │  │DEBUFF ENEMY ││  ← PUT group (auto Sell)
│  └────────┘  └─────────────┘│
│        ┌────────┐           │
│        │  HOLD  │           │  ← HOLD (Skip market)
│        └────────┘           │
│    Timer: [10] seconds      │
└─────────────────────────────┘
```

**Button Behavior:**
- Player taps one button. It highlights. The choice is locked.
- If timer expires with no choice → auto-defaults to **HOLD**.
- The system internally maps the choice to a market action:
  - ATTACK → CALL (Buy)
  - BUFF SELF → CALL (Buy)
  - DEFEND → PUT (Sell)
  - DEBUFF ENEMY → PUT (Sell)
  - HOLD → HOLD

**Important:** The player has chosen their RPG intent AND their market direction in one tap. The two are inseparable.

### 6.3 Market Phase (15-Second Timer)

Immediately after the RPG phase locks in, the screen transitions to the market chart.

```
┌─────────────────────────────┐
│  [COIN NAME] LIVE CHART     │
│  [Candlestick chart — live] │
│                             │
│  Your action: [CALL/PUT/HOLD│
│  Enemy action: ???          │
│                             │
│    Timer: [15] seconds      │
│                             │
│  (No input needed here —    │
│   action already locked)    │
└─────────────────────────────┘
```

- The chart shows real-time price movement for the selected coin.
- The player's action is already locked — they watch the market resolve.
- The enemy's action is hidden until resolution (revealed in results screen).
- After 15 seconds, the candle closes. Damage is calculated.

---

## 7. DAMAGE FORMULA

> **For AI Builders:** This is the most critical section. Implement this formula exactly. There is NO zero damage and NO negative damage. Minimum damage output is always ≥ 1.

### 7.1 Definitions

| Variable | Description |
|---|---|
| `BASE_DMG` | Flat damage from the RPG action chosen |
| `ATK` | Attacker's ATK stat |
| `DEF` | Defender's DEF stat (as a decimal, e.g. 20% = 0.20) |
| `TRADE_RESULT` | Outcome multiplier from the market phase |
| `ITEM_MOD` | Combined multiplier from active items |
| `VOLATILITY` | Coin volatility multiplier |
| `PROFIT_PCT` | Absolute % price movement in direction of bet (0.0 to 1.0+) |

### 7.2 Base Damage by RPG Action

| Action | BASE_DMG | Effect Type |
|---|---|---|
| ATTACK | 15 | Deals HP damage to enemy |
| BUFF SELF | 0 (no direct damage) | Applies a stat buff to self for 2 rounds |
| DEFEND | 0 (no direct damage) | Applies DEF buff to self for 2 rounds |
| DEBUFF ENEMY | 10 | Deals HP damage + applies ATK debuff to enemy for 2 rounds |
| HOLD | 0 | No damage, no effect. Skips market phase entirely. |

### 7.3 Trade Result Multiplier

After the 15-second candle closes, the system checks: did the coin price move in the direction of the player's bet?

| Situation | TRADE_RESULT Value |
|---|---|
| Correct direction (Call + price went UP) | `1.0 + PROFIT_PCT` |
| Correct direction (Put + price went DOWN) | `1.0 + PROFIT_PCT` |
| Wrong direction | `0.5` (penalty, but never zero) |
| HOLD chosen | `1.0` (neutral, no market phase) |

`PROFIT_PCT` = the absolute % price change of the candle in the correct direction.
Example: Coin moved up 2.3% → PROFIT_PCT = 0.023 → TRADE_RESULT = 1.023

### 7.4 Full Damage Formula

```
RAW_DAMAGE = (BASE_DMG × ATK × TRADE_RESULT × ITEM_MOD × VOLATILITY)

FINAL_DAMAGE = RAW_DAMAGE × (1 - DEF)

FINAL_DAMAGE = max(1, floor(FINAL_DAMAGE))
```

**The `max(1, ...)` ensures damage is ALWAYS at least 1. This is non-negotiable.**

### 7.5 Buff / Debuff Mechanics

Buffs and debuffs do not deal direct HP damage on their own turn (except DEBUFF ENEMY which has BASE_DMG 10). They modify stats for the next 2 rounds.

| Action | Effect | Duration |
|---|---|---|
| BUFF SELF (correct trade) | ATK × 1.3 | 2 rounds |
| BUFF SELF (wrong trade) | ATK × 1.1 (reduced buff) | 1 round |
| DEFEND (correct trade) | DEF + 20% (capped at 60%) | 2 rounds |
| DEFEND (wrong trade) | DEF + 10% | 1 round |
| DEBUFF ENEMY (correct trade) | Enemy ATK × 0.7 | 2 rounds |
| DEBUFF ENEMY (wrong trade) | Enemy ATK × 0.85 | 1 round |

---

## 8. ITEM SYSTEM

### 8.1 Item Categories

**Category A — Gear (Classic RPG, Crypto Reskin)**

| Item | Effect | Slot Type |
|---|---|---|
| Blockchain Armor | Permanent +5% DEF for the battle | Passive |
| Satoshi Blade | +0.2 to ATK stat for the battle | Passive |
| Ledger Shield | First wrong trade this battle = no penalty (once) | Passive |
| Node Boots | +15 SPD for the battle | Passive |

**Category B — Crypto Event Cards (Active Use)**

Active items are usable once per battle. Player taps the item slot during the RPG phase to activate before choosing their action.

| Item | Effect |
|---|---|
| Whale Surge | Next CALL damage ×1.5 |
| FUD Bomb | Enemy ATK debuffed by 20% for 3 rounds |
| HODL Stone | Converts this round to HOLD — gain +10 HP regeneration |
| Airdrop | Gain 1.2× ITEM_MOD on next action regardless of trade result |
| Rug Pull | Enemy's next buff is nullified |

**Category C — Market Manipulation Items (Active Use)**

| Item | Effect |
|---|---|
| Flash Crash | Increases PROFIT_PCT calculation by 0.5% (artificial boost) |
| Bull Flag | If next trade is CALL + correct, double the PROFIT_PCT multiplier |
| Bear Trap | If enemy uses CALL next round and is wrong, they take bonus 5 damage |
| Liquidation | If enemy HP < 30%, next hit deals +20 bonus damage |

### 8.2 Item Shop (The Market District)
- Items are purchased with **Gold**.
- Rare items (Category C) also cost **Gems**.
- Shop refreshes daily with a random rotating stock.
- Players can carry a maximum of 15 items in inventory.
- Max 3 equipped per battle.

---

## 9. BATTLE MODES (The Arena)

### Mode 1 — AI Duel
- Fight an AI opponent with a defined trading personality.
- AI personalities: **Bull** (always picks CALL), **Bear** (always picks PUT), **Whale** (adapts to momentum), **HODLer** (frequently uses HOLD).
- AI also trades the same coin as the player (mirror match).
- Reward: Gold + XP.

### Mode 2 — PvP (Player vs Player)
- Matched by Level bracket.
- Both players select the same coin (host's pick or random).
- Real-time mirror match — both see the same chart.
- Higher Gold + XP reward than AI Duel.

### Mode 3 — Market Challenge
- Player vs The Market (no human/AI opponent).
- Goal: Survive 10 rounds with HP above 0.
- Enemy "damage" is dealt by the market itself — wrong trades deal self-damage.
- Correct trades = heal HP instead of deal damage.
- Reward: Gems (only mode that awards Gems through gameplay).

---

## 10. PROGRESSION SYSTEM

### 10.1 XP & Leveling

| Outcome | XP Awarded |
|---|---|
| Win a battle | 100 XP + bonus 10 XP per round survived |
| Lose a battle | 25 XP (consolation) |
| Correct trade in battle | +5 XP per correct trade |
| Complete a Guild mission | Mission-defined XP |

Level cap: **50** (v1.0).

XP required per level: `Level × 150 XP` (e.g. Level 2 requires 300 XP, Level 3 requires 450).

### 10.2 Level Up Effects
- All base stats increase per the table in Section 4.2.
- Level milestones unlock new item shop stock:
  - Level 5: Category B items unlock
  - Level 10: Category C items unlock
  - Level 20: PvP mode unlocks
  - Level 30: Market Challenge mode unlocks

### 10.3 Gold Economy

| Action | Gold Earned/Spent |
|---|---|
| Win AI Duel | +50–150 Gold (scaled by rounds) |
| Win PvP | +100–300 Gold |
| Lose any battle | +0 Gold |
| Buy Category A item | 50–200 Gold |
| Buy Category B item | 150–400 Gold |
| Buy Category C item | 300–600 Gold + Gems |

### 10.4 Gem Economy
- Gems are the premium currency.
- Earned only via: Market Challenge wins, daily login bonus, purchased with real money.
- Used for: Category C rare items, cosmetic skins (future), extra inventory slots.

---

## 11. ENEMY AI — MIRROR MATCH LOGIC

Since both player and enemy trade the same coin simultaneously:

1. Enemy's RPG action is determined by its AI personality (see Section 9, Mode 1).
2. Enemy's market action (Call/Put/Hold) maps from their RPG action identically to the player's mapping rules.
3. Enemy damage is calculated using the same formula in Section 7.
4. Enemy stats follow the same stat structure, tuned to their level equivalent.
5. Enemy action is revealed only after the market phase resolves (suspense mechanic).

**Result:** On any given round, both fighters could Call (bet price goes up), both could Put, or they could bet against each other — creating natural narrative tension from a single real market candle.

---

## 12. SCREEN-BY-SCREEN UI FLOW

```
LAUNCH
  └─► Splash Screen (logo + loading)
        └─► Hub Town (main map)
              ├─► The Arena
              │     ├─► Mode Select (AI / PvP / Market Challenge)
              │     └─► Pre-Battle Phase
              │           ├─► Coin Select Screen
              │           ├─► Item Confirm Screen
              │           ├─► Opponent Reveal Screen
              │           └─► BATTLE SCREEN
              │                 ├─► RPG Phase (10s)
              │                 ├─► Market Phase (15s)
              │                 ├─► Damage Resolution Animation
              │                 ├─► [Repeat rounds]
              │                 └─► Battle End Screen (Win/Lose + Rewards)
              ├─► The Market (Item Shop)
              ├─► The Guild (Missions + Leaderboard)
              └─► The Vault (Profile + Stats + Inventory + Equip)
```

---

## 13. DATA REQUIREMENTS

### Real-Time Data
- Live cryptocurrency price feed (WebSocket preferred) for: BTC, ETH, SOL, BNB, DOGE (v1.0 roster).
- Candlestick data: 15-second candle per market phase.
- Data source: Use a public crypto API (e.g. Binance WebSocket, CoinGecko).

### Stored Per Player
- Username, Level, XP, Gold, Gems
- Equipped items (3 slots)
- Inventory (up to 15 items)
- Win/Loss record per mode
- Current stat block (computed from Level)

---

## 14. WHAT IS NOT IN v1.0 (Future Phases)

The following are explicitly OUT OF SCOPE for the initial build:

- Multiple playable characters / character selection
- Story mode / narrative campaign
- Dark mode
- Onboarding tutorial (placeholder only)
- Guild vs Guild battles
- Coin collection mechanic (Pokémon-style catching)
- Cosmetic skins
- Chat system

---

## 15. GLOSSARY

| Term | Definition |
|---|---|
| **Call** | Market action = Buy; RPG actions that map here: Attack, Buff Self |
| **Put** | Market action = Sell; RPG actions that map here: Defend, Debuff Enemy |
| **Hold** | Skip the market phase entirely; RPG action: Hold |
| **PROFIT_PCT** | The absolute % price movement of the 15s candle in the correct direction |
| **Mirror Match** | Both fighters trade the same coin in the same 15s window |
| **Round** | One complete RPG Phase + Market Phase + Damage Resolution cycle |
| **Battle** | A full sequence of rounds until one fighter reaches 0 HP |
| **Volatility Multiplier** | Coin-specific risk/reward modifier applied in the damage formula |

---

*CryptoStrike RPG — GDD v1.0 | Ready for Implementation*

---

# CHAPTER 2 — CHARACTER & SPRITE SYSTEM
> **For AI Builders:** This chapter defines the full character creation flow, all 4 classes with balanced stats, the 3-slot wearable system, layered sprite rendering, and the complete wearable item catalog with prices. Implement every table and rule exactly as written.

---

## 16. CHARACTER CREATION FLOW

Character creation happens once — on first launch, after the splash screen, before the player ever sees the Hub Town.

### Step-by-Step Creation Screen Flow

```
STEP 1 — Choose Gender
  [Male]   [Female]
  (Two chibi base silhouettes shown side by side)
  Player taps one. It highlights with a glow border.

STEP 2 — Choose Class
  Four class cards shown in a 2×2 grid.
  Each card shows:
    • Class name
    • Chibi sprite preview (base outfit, selected gender)
    • 3-line flavor description
    • Stat bar preview (ATK / DEF / SPD / LUCK as mini bars)
  Player taps a card to select. Tap again to confirm.

STEP 3 — Name Your Character
  Text input field. Max 12 characters. Alphanumeric only.
  Default name suggestions based on class (e.g. "CryptoKnight" for Hodler).

STEP 4 — Confirm & Enter
  Full chibi sprite shown in idle animation.
  Class name badge shown below.
  [START YOUR JOURNEY] button → Hub Town.
```

### Rules
- Gender choice affects the sprite art only. Zero stat difference between Male and Female.
- Class choice is PERMANENT in v1.0. No reroll without creating a new account.
- Players cannot change their class after creation. (Future: paid class reset with Gems.)

---

## 17. THE 4 CLASSES — FULL DESIGN & BALANCE

### Balance Philosophy
All 4 classes have the same total "stat budget" at Level 1 (sum of ATK + DEF + SPD + LUCK = 160 points across all classes). They are differentiated by HOW those points are distributed and their unique passive ability. No class is strictly better — each dominates a different battle situation.

---

### CLASS 1 — TRADER
**Archetype:** Aggressive Attacker. The highest raw damage output in the game. Thrives on correct Call trades. Punished hard for wrong predictions.

**Flavor Text:** *"Every candle is a battlefield. Go long or go home."*

**Sprite Direction:** Sharp suit, glowing tablet weapon, tie loosened — battle-ready executive energy. Chibi but intense expression.

| Stat | Level 1 Value | Growth per Level |
|---|---|---|
| HP | 90 | +8 per level |
| ATK | 1.4 | +0.07 per level |
| DEF | 0.05 (5%) | +1.5% per level, max 45% |
| SPD | 55 | +2 per level |
| LUCK | 10 | +1 per level |

**Passive — "Alpha Entry":**
When the Trader makes a CORRECT Call (Buy) trade, the PROFIT_PCT bonus is multiplied by ×1.5 before being added to TRADE_RESULT. Wrong trades deal 0.4 TRADE_RESULT instead of the standard 0.5.

**Playstyle Note:** Trader players should pick high-volatility coins and go heavy on CALL/Attack actions. Their ceiling is the highest in the game but their floor is punishing.

---

### CLASS 2 — ANALYST
**Archetype:** Support Tactician. Lowest raw damage but strongest buff/debuff effects. Excels at wearing down enemies over many rounds through stat manipulation.

**Flavor Text:** *"I don't predict the market. I predict you."*

**Sprite Direction:** Oversized hoodie, holographic chart floating beside them as a "weapon", glasses with data scrolling across the lens. Calm, calculating expression.

| Stat | Level 1 Value | Growth per Level |
|---|---|---|
| HP | 95 | +9 per level |
| ATK | 1.0 | +0.04 per level |
| DEF | 0.10 (10%) | +2% per level, max 55% |
| SPD | 45 | +1.5 per level |
| LUCK | 20 | +1.5 per level |

**Passive — "Deep Research":**
When the Analyst uses BUFF SELF or DEBUFF ENEMY and gets a correct trade, the buff/debuff duration is extended by +1 round (3 rounds total instead of 2). When LUCK stat is above 30, all item effects gain +10% potency.

**Playstyle Note:** Analyst players should stack LUCK gear, use Debuff Enemy frequently, and let compounding debuffs drain the enemy over time. Wins long battles, weak in short aggressive ones.

---

### CLASS 3 — HODLER
**Archetype:** Tank. Highest HP and DEF. Built to survive wrong trades and outlast opponents. Slowest attacker but nearly impossible to burst down.

**Flavor Text:** *"I've survived three bear markets. You're not a bear market."*

**Sprite Direction:** Heavy armored coat with blockchain pattern, massive shield as weapon, calm stoic face. Sturdy, wide-stance chibi build — looks immovable.

| Stat | Level 1 Value | Growth per Level |
|---|---|---|
| HP | 130 | +14 per level |
| ATK | 0.9 | +0.04 per level |
| DEF | 0.20 (20%) | +2.5% per level, max 70% |
| SPD | 35 | +1 per level |
| LUCK | 10 | +0.8 per level |

**Passive — "Diamond Hands":**
When the Hodler uses HOLD action, instead of doing nothing they gain +8 HP regeneration AND reduce the enemy's next TRADE_RESULT by 0.1 (minimum 0.4). HOLD is never wasted for a Hodler.

**Playstyle Note:** Hodler players should use DEFEND frequently, stack DEF gear, and use HOLD strategically to counter enemy momentum. They win wars of attrition. They lose to burst Trader builds.

---

### CLASS 4 — DEGEN
**Archetype:** Chaos High-Risk Gambler. Wildly inconsistent but capable of the most explosive single-turn damage in the game. Built around Extreme volatility coins and all-in plays.

**Flavor Text:** *"Wen moon? Now moon. Always moon. Send it."*

**Sprite Direction:** Chaotic energy — mismatched neon streetwear, rocket as weapon, wide unhinged grin, hair going in all directions. Chibi but crackling with chaotic energy.

| Stat | Level 1 Value | Growth per Level |
|---|---|---|
| HP | 85 | +7 per level |
| ATK | 1.2 | +0.06 per level |
| DEF | 0.05 (5%) | +1.5% per level, max 40% |
| SPD | 65 | +3 per level |
| LUCK | 30 | +2 per level |

**Passive — "Send It":**
When the Degen picks an Extreme volatility coin, the Volatility Multiplier becomes ×2.5 instead of ×2.0. Additionally, once per battle, if their HP drops below 20%, their next action's TRADE_RESULT is automatically set to 1.5 regardless of actual market outcome (desperation comeback mechanic).

**Playstyle Note:** Degen players should always pick DOGE or the most volatile coin available, go CALL/Attack almost every turn, and pray. When it works, it's spectacular. Worst DEF and HP in the game.

---

### Class Comparison Summary

| Class | HP (Lv1) | ATK (Lv1) | DEF (Lv1) | SPD (Lv1) | LUCK (Lv1) | Best At |
|---|---|---|---|---|---|---|
| Trader | 90 | 1.4 | 5% | 55 | 10 | Burst damage, Call plays |
| Analyst | 95 | 1.0 | 10% | 45 | 20 | Debuffs, long battles |
| Hodler | 130 | 0.9 | 20% | 35 | 10 | Surviving, attrition |
| Degen | 85 | 1.2 | 5% | 65 | 30 | Chaos, extreme coin plays |

---

## 18. WEARABLE ITEM SYSTEM

### 18.1 The 3 Equipment Slots

Every character has exactly 3 wearable slots. These are purely cosmetic-AND-stat items — they change the character's sprite appearance visually in battle AND grant stat bonuses.

| Slot | Name | Description |
|---|---|---|
| Slot 1 | **Outfit** | Full body costume. Replaces the entire base sprite layer. |
| Slot 2 | **Weapon** | Held item displayed in the character's hand during battle. |
| Slot 3 | **Accessory** | Small add-on visible on sprite (hat, glasses, badge, aura). |

### 18.2 Layered Sprite Rendering — Technical Spec

> **For AI Builders:** Character sprites are rendered as stacked transparent PNG layers. The render order from bottom to top is:

```
Layer 1 (bottom): Base body sprite (gender + class, idle/attack/defend animations)
Layer 2:          Outfit layer (full costume sprite, same animation frames)
Layer 3:          Weapon layer (held object, positioned at hand anchor point)
Layer 4 (top):    Accessory layer (positioned at defined anchor: head / chest / aura)
```

- Each item in the catalog has a corresponding sprite sheet with matching animation frames: **Idle, Attack, Defend, Hurt, Victory.**
- If a slot is empty, that layer is transparent (invisible). Base sprite always renders.
- All layers must be pixel-perfect aligned using a shared 128×128 px canvas (chibi scale).
- Anchor points per class/gender are defined in the sprite data file (to be created by the art team).

---

## 19. WEARABLE ITEM CATALOG

### Rarity Tiers

| Tier | Color Label | Stat Bonus Range | Visual Impact |
|---|---|---|---|
| Common | Gray | Small (+1–2 stat) | Minor outfit change |
| Uncommon | Green | Moderate (+3–5 stat) | Noticeable outfit change |
| Rare | Blue | Good (+6–10 stat) | Distinct visual style |
| Epic | Purple | Strong (+11–18 stat) | Full visual transformation |
| Legendary | Gold | Exceptional (+19–30 stat) | Animated/glowing effects |

---

### OUTFIT CATALOG (Slot 1)

| # | Name | Rarity | Stat Bonus | Price (Gold) | Price (Gems) | Description |
|---|---|---|---|---|---|---|
| 1 | Street Analyst Hoodie | Common | +2 DEF | 120 | — | Chill oversized hoodie. Low-key flex. |
| 2 | Bull Run Suit | Uncommon | +4 ATK | 280 | — | Crisp power suit, deep green tie. |
| 3 | Bear Market Cloak | Uncommon | +5 DEF | 310 | — | Dark hooded cloak. Defensive presence. |
| 4 | Neon Degen Jacket | Uncommon | +3 ATK, +3 SPD | 350 | — | Loud neon streetwear. Fast and chaotic. |
| 5 | Blockchain Armor | Rare | +8 DEF | 750 | — | Heavy plated coat with chain pattern glow. |
| 6 | Whale's Trenchcoat | Rare | +7 ATK | 800 | — | Long black coat. Drips authority. |
| 7 | Diamond Hands Gi | Rare | +6 DEF, +4 HP (flat) | 900 | — | White martial arts gi with diamond motifs. |
| 8 | Satoshi Robes | Epic | +10 ATK, +5 DEF | — | 80 | Ancient-style robes with glowing circuit patterns. |
| 9 | Volatility Suit | Epic | +12 SPD, +6 ATK | — | 95 | Iridescent suit that shifts color with each turn. |
| 10 | Genesis Armor | Legendary | +18 DEF, +10 ATK | — | 200 | Full glowing blockchain-plate armor. Animated shimmer. |
| 11 | Moonshot Outfit | Legendary | +15 ATK, +10 SPD | — | 220 | Rocket-themed spacesuit. Animated exhaust trail. |

---

### WEAPON CATALOG (Slot 2)

| # | Name | Rarity | Stat Bonus | Price (Gold) | Price (Gems) | Description |
|---|---|---|---|---|---|---|
| 1 | Paper Chart | Common | +1 ATK | 80 | — | A printed chart. Old school. |
| 2 | Bronze Coin | Common | +2 LUCK | 100 | — | A large shiny coin. Humble but lucky. |
| 3 | Trading Tablet | Uncommon | +4 ATK | 260 | — | Glowing tablet with live charts. |
| 4 | Ledger Wand | Uncommon | +3 DEF, +2 LUCK | 290 | — | Hardware wallet on a stick. Surprisingly threatening. |
| 5 | Bearslayer Axe | Rare | +8 ATK | 780 | — | A pixelated axe styled after a bear. |
| 6 | Bull Horn Staff | Rare | +7 ATK, +3 SPD | 850 | — | Staff topped with golden bull horns. |
| 7 | Whale Fin Blade | Rare | +6 ATK, +5 DEF | 920 | — | A massive curved blade shaped like a whale's fin. |
| 8 | Satoshi's Blade | Epic | +13 ATK | — | 75 | Legendary sword etched with the genesis block hash. |
| 9 | Quantum Cursor | Epic | +10 ATK, +8 LUCK | — | 90 | A floating glowing cursor weapon. Reality-bending. |
| 10 | Rocket Launcher | Legendary | +20 ATK | — | 180 | To the moon. Literal rocket. Animated flame. |
| 11 | The Infinity Ledger | Legendary | +15 ATK, +12 LUCK | — | 210 | A glowing ancient ledger. Every hit audits the enemy. |

---

### ACCESSORY CATALOG (Slot 3)

| # | Name | Rarity | Stat Bonus | Price (Gold) | Price (Gems) | Description |
|---|---|---|---|---|---|---|
| 1 | Crypto Cap | Common | +1 SPD | 60 | — | Simple cap with a coin logo. |
| 2 | Lucky Penny Badge | Common | +2 LUCK | 75 | — | A small badge. Suspiciously effective. |
| 3 | Analyst Glasses | Uncommon | +4 LUCK | 240 | — | Data-display glasses. Always reading the market. |
| 4 | Trader's Earpiece | Uncommon | +3 SPD, +2 ATK | 270 | — | Tiny earpiece with live feed. Faster reactions. |
| 5 | Diamond Earrings | Rare | +6 LUCK, +3 DEF | 700 | — | Actual diamond. Actual hands. |
| 6 | NFT Aura | Rare | +8 LUCK | 760 | — | A glowing aura around the character. Controversial but strong. |
| 7 | Bull Crown | Rare | +7 ATK, +4 SPD | 830 | — | A golden crown with bull horns. |
| 8 | Degen Goggles | Epic | +10 SPD, +8 LUCK | — | 70 | Cracked neon goggles. No safety, all speed. |
| 9 | Whale Badge | Epic | +12 LUCK, +6 ATK | — | 85 | A glowing whale emblem. Market mover energy. |
| 10 | Satoshi Halo | Legendary | +20 LUCK, +8 DEF | — | 175 | An animated golden halo. The highest honor. |
| 11 | Genesis Crown | Legendary | +18 ATK, +10 SPD | — | 195 | Full animated crown. Block-by-block construction animation on equip. |

---

## 20. CLASS × WEARABLE SYNERGY GUIDE

> **For AI Builders:** This is informational — display this as in-game tooltips when a player hovers/long-presses an item in the shop. Do not gate items by class — all items are usable by all classes.

| Class | Best Outfit Synergy | Best Weapon Synergy | Best Accessory Synergy |
|---|---|---|---|
| Trader | Whale's Trenchcoat (+7 ATK) | Satoshi's Blade (+13 ATK) | Trader's Earpiece (+SPD+ATK) |
| Analyst | Street Analyst Hoodie (flavor) | Quantum Cursor (+LUCK) | Analyst Glasses (+LUCK) |
| Hodler | Blockchain Armor (+8 DEF) | Whale Fin Blade (+DEF) | Diamond Earrings (+LUCK+DEF) |
| Degen | Moonshot Outfit (+SPD+ATK) | Rocket Launcher (+20 ATK) | Degen Goggles (+SPD+LUCK) |

---

## 21. SHOP UNLOCK RULES FOR WEARABLES

| Level Required | Items Unlocked |
|---|---|
| Level 1 | All Common items |
| Level 5 | All Uncommon items |
| Level 10 | All Rare items |
| Level 20 | All Epic items |
| Level 35 | All Legendary items |

- Common and Uncommon items are Gold-only purchases.
- Rare items are Gold-only.
- Epic and Legendary items require Gems.
- All wearables are permanent once purchased — they do not break or expire.
- Future: limited-time event wearables (not in v1.0 scope).

---

## 22. UPDATED STAT STACKING RULES

When a wearable provides a stat bonus, it is added to the character's current computed stat AFTER level scaling.

```
EFFECTIVE_ATK  = (Base ATK + Level Growth) + Outfit_ATK + Weapon_ATK + Accessory_ATK
EFFECTIVE_DEF  = (Base DEF + Level Growth) + Outfit_DEF + Weapon_DEF + Accessory_DEF  [cap still applies]
EFFECTIVE_SPD  = (Base SPD + Level Growth) + Outfit_SPD + Weapon_SPD + Accessory_SPD
EFFECTIVE_LUCK = (Base LUCK + Level Growth) + Outfit_LUCK + Weapon_LUCK + Accessory_LUCK
```

DEF hard cap remains per class:
- Trader: 45% max
- Analyst: 55% max
- Hodler: 70% max
- Degen: 40% max

LUCK has no cap. High LUCK affects:
- Item drop rate after battle (+1% drop chance per 5 LUCK above 10)
- Critical trade bonus: if LUCK > 50, correct trades get +0.05 added to PROFIT_PCT automatically

---

*CryptoStrike RPG — GDD v1.0 | Chapter 2: Character & Sprite System — Appended*

---

# CHAPTER 3 — UI/UX DESIGN SYSTEM
> **For AI Builders:** This chapter is the complete visual and interaction specification for every screen in CryptoStrike RPG. Implement every screen exactly as described. All measurements assume a 390×844px viewport (iPhone 14 base). Scale proportionally for other devices. Do not invent screens or UI patterns not listed here.

---

## 23. DESIGN SYSTEM FOUNDATION

### 23.1 Color Palette

```
/* Primary Palette */
--color-bg-deep:       #0A0F1E   /* Main background — deepest navy */
--color-bg-card:       #111827   /* Card / panel backgrounds */
--color-bg-elevated:   #1A2540   /* Elevated surfaces, modals */
--color-border:        #1E3A5F   /* Subtle borders, dividers */

/* Accent Palette */
--color-gold:          #F0B429   /* Primary gold — CTAs, highlights, XP bar */
--color-gold-dim:      #7A5C15   /* Muted gold — inactive states */
--color-green:         #22C55E   /* Profit, correct trade, positive states */
--color-green-dim:     #14532D   /* Muted green — backgrounds only */
--color-red:           #EF4444   /* Loss, wrong trade, enemy HP, danger */
--color-red-dim:       #7F1D1D   /* Muted red — backgrounds only */

/* Neutral Palette */
--color-text-primary:  #F1F5F9   /* Main readable text */
--color-text-secondary:#94A3B8   /* Subtext, labels, hints */
--color-text-muted:    #475569   /* Disabled, placeholder */

/* Special */
--color-call:          #22C55E   /* CALL/Buy action color */
--color-put:           #EF4444   /* PUT/Sell action color */
--color-hold:          #F0B429   /* HOLD action color */
--color-legendary:     #F0B429   /* Legendary rarity glow */
--color-epic:          #A855F7   /* Epic rarity */
--color-rare:          #3B82F6   /* Rare rarity */
--color-uncommon:      #22C55E   /* Uncommon rarity */
--color-common:        #94A3B8   /* Common rarity */
```

### 23.2 Typography

```
Font Stack:
  Display / Headers:  "Rajdhani" (Google Fonts) — bold, sharp, trader energy
  Body / Labels:      "Inter" — clean, readable at small sizes
  Numbers / Stats:    "Rajdhani" monospace variant — for HP, damage, prices
  Flavor Text:        "Inter" italic — class descriptions, item lore

Scale:
  --text-xs:    11px   /* Tiny labels, timestamps */
  --text-sm:    13px   /* Secondary labels, hints */
  --text-base:  15px   /* Body text, descriptions */
  --text-lg:    18px   /* Section headers, card titles */
  --text-xl:    22px   /* Screen titles */
  --text-2xl:   28px   /* Hero numbers (damage, gold amounts) */
  --text-3xl:   36px   /* Splash / dramatic moments */
```

### 23.3 Spacing & Layout

```
Safe areas:   Top 44px (status bar), Bottom 34px (home indicator)
Nav bar:      64px tall, fixed at bottom
Content area: Full width, between safe areas and nav bar
Card radius:  16px standard, 24px for large hero cards
Border width: 1px standard, 2px for active/selected states
Padding base: 16px horizontal, 12px vertical
```

### 23.4 Global Animation Principles

```
Timing functions:
  --ease-snap:    cubic-bezier(0.34, 1.56, 0.64, 1)   /* Bouncy, game-feel */
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1)         /* Smooth slides */
  --ease-exit:    cubic-bezier(0.4, 0, 1, 1)           /* Fast exits */

Durations:
  Micro (button press):     100ms
  Standard (card appear):   250ms
  Screen transition:        350ms
  Battle animation:         600ms
  Dramatic (level up):      1200ms

Rules:
  - All tap interactions have immediate 100ms visual feedback (scale 0.95)
  - Screens enter with fade + slide-up (translateY 20px → 0, opacity 0 → 1)
  - Never block user input for longer than 600ms without a loading indicator
  - Damage numbers always use --ease-snap timing
```

---

## 24. SCREEN SPECIFICATIONS — COMPLETE LIST

### SCREEN 1 — SPLASH SCREEN

**Purpose:** App launch, asset loading.

**Layout:**
```
┌─────────────────────────┐
│                         │
│   [Deep navy bg with    │
│    subtle animated      │
│    candlestick pattern  │
│    scrolling behind]    │
│                         │
│      [GAME LOGO]        │  ← Centered, gold wordmark "CryptoStrike"
│   [Subtitle: RPG]       │  ← Green subtitle tag, smaller
│                         │
│  [Chibi character idle  │  ← All 4 class sprites cycle slowly
│   animation — 4 chars  │
│   floating in a row]    │
│                         │
│   [Loading bar — gold]  │  ← Bottom third, thin progress bar
│  "Loading the market…"  │  ← Flavor loading text, cycles
│                         │
└─────────────────────────┘
```

**Animations:**
- Logo drops in from top with --ease-snap at app open
- 4 chibi sprites float up sequentially with 150ms stagger
- Background candlesticks scroll left at 20px/s, 40% opacity
- Loading bar fills smoothly, color shifts gold → green at 100%

**Transition out:** Full screen gold flash (80ms) → Character Creation or Hub Town

---

### SCREEN 2 — CHARACTER CREATION

**Purpose:** One-time flow. 4 steps. Cannot be skipped.

#### Step 1 — Gender Select
```
┌─────────────────────────┐
│ ← [Back]   Step 1 of 4 │
│                         │
│  "Choose Your Trader"   │  ← --text-xl, gold
│                         │
│  ┌──────────┐ ┌───────┐ │
│  │  [Male   │ │Female]│ │  ← Two large cards, 45% width each
│  │  chibi   │ │ chibi │ │
│  │ silhouet]│ │silhou]│ │
│  └──────────┘ └───────┘ │  ← Selected card: gold border 2px glow
│                         │
│      [CONTINUE →]       │  ← Gold CTA button, full width
└─────────────────────────┘
```

#### Step 2 — Class Select
```
┌─────────────────────────┐
│ ← [Back]   Step 2 of 4 │
│                         │
│   "Choose Your Class"   │
│                         │
│  ┌─────────┐ ┌────────┐ │
│  │ TRADER  │ │ANALYST │ │  ← 2×2 grid of class cards
│  │[sprite] │ │[sprite]│ │
│  │ATK ████ │ │ATK ██  │ │  ← Mini stat bars (4 bars: ATK/DEF/SPD/LUCK)
│  │DEF █    │ │DEF ██  │ │
│  └─────────┘ └────────┘ │
│  ┌─────────┐ ┌────────┐ │
│  │ HODLER  │ │ DEGEN  │ │
│  │[sprite] │ │[sprite]│ │
│  │ATK █    │ │ATK ███ │ │
│  │DEF ████ │ │DEF █   │ │
│  └─────────┘ └────────┘ │
│                         │
│  [Selected class detail │  ← Expands below grid on tap
│   panel: flavor text +  │
│   passive ability desc] │
│                         │
│      [CONTINUE →]       │
└─────────────────────────┘
```

#### Step 3 — Name Input
```
┌─────────────────────────┐
│ ← [Back]   Step 3 of 4 │
│                         │
│  [Selected class sprite │  ← Large chibi, idle animation
│   centered, animated]   │
│                         │
│   "Name Your Trader"    │
│                         │
│  ┌───────────────────┐  │
│  │ [Text input field]│  │  ← Gold underline style input, 12 char max
│  └───────────────────┘  │
│  "Suggestions:"         │
│  [Tag][Tag][Tag]        │  ← Tappable name suggestion chips
│                         │
│      [CONTINUE →]       │
└─────────────────────────┘
```

#### Step 4 — Confirm
```
┌─────────────────────────┐
│ ← [Back]   Step 4 of 4 │
│                         │
│  [Full chibi sprite,    │  ← Larger, victory pose animation
│   class + gender combo] │
│                         │
│  "SATOSHI_KENT"         │  ← Player's chosen name, --text-2xl gold
│  [Class badge: DEGEN]   │  ← Colored pill badge
│                         │
│  HP  ████████  85       │
│  ATK ██████    1.2      │  ← Stat summary cards
│  DEF ██        5%       │
│  SPD ████████  65       │
│  LUCK████████  30       │
│                         │
│  [START YOUR JOURNEY]   │  ← Green CTA, full width, pulsing glow
└─────────────────────────┘
```

**Transition out:** Cinematic pan — character sprite walks right off screen into Hub Town.

---

### SCREEN 3 — HUB TOWN (Main Home)

**Purpose:** Central navigation hub. Persistent home base.

**Layout — Global:**
```
┌─────────────────────────┐
│ [Avatar] [Name / Level] │  ← Top left: player info
│              [G][Gems]  │  ← Top right: Gold + Gem balance
├─────────────────────────┤
│                         │
│   [DISTRICT CONTENT]    │  ← Full swipeable area (see districts below)
│                         │
│                         │
│                         │
│                         │
├─────────────────────────┤
│ [●][○][○][○]           │  ← Page dots, centered above nav
│ 🏟Arena 🛒Market 🏛Guild 👤Vault │  ← Bottom nav bar (side-swipe)
└─────────────────────────┘
```

**Parallax Swipe Behavior:**
- Each district has a background illustration layer and a foreground content layer
- On swipe: background moves at 0.4× swipe velocity, foreground at 1.0×
- District name fades in at top center during transition (300ms fade)
- Page dots update in real time as user swipes
- Snap to nearest district on release (350ms --ease-smooth)

#### District 1 — The Arena (default landing)
```
│  "THE ARENA"            │  ← District header, fades in on swipe
│  [Background: pixel     │
│   colosseum illustration│
│   in navy/gold]         │
│                         │
│  ┌─────────────────────┐│
│  │ ⚔ AI DUEL           ││  ← Battle mode cards, stacked
│  │ Quick match vs AI   ││
│  │ Reward: 50-150 Gold ││
│  │         [FIGHT →]   ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 👥 PVP              ││  ← Locked until Level 20
│  │ Battle real traders ││
│  │ Reward: 100-300 Gold││
│  │         [QUEUE →]   ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 📈 MARKET CHALLENGE ││  ← Locked until Level 30
│  │ Survive 10 rounds   ││
│  │ Reward: Gems        ││
│  │         [ENTER →]   ││
│  └─────────────────────┘│
```

#### District 2 — The Market (Item Shop)
```
│  "THE MARKET"           │
│  [Background: neon      │
│   market stalls pixel   │
│   art illustration]     │
│                         │
│  [Filter tabs:]         │
│  [ALL][OUTFIT][WEAPON][ACC] ← Horizontally scrollable tabs
│                         │
│  ┌────────┐ ┌─────────┐ │
│  │[Item   │ │[Item    │ │  ← 2-column grid of item cards
│  │ sprite]│ │ sprite] │ │
│  │ Name   │ │ Name    │ │
│  │ Rarity │ │ Rarity  │ │  ← Color-coded rarity border
│  │ 💰 280 │ │ 💎 80   │ │  ← Gold or Gem price
│  │ [BUY]  │ │ [BUY]   │ │
│  └────────┘ └─────────┘ │
│  [Locked items shown    │
│   grayed with level req]│
```

#### District 3 — The Guild
```
│  "THE GUILD"            │
│  [Background: grand     │
│   hall pixel art]       │
│                         │
│  [DAILY MISSIONS]       │  ← Section header
│  ┌─────────────────────┐│
│  │ Win 3 AI Duels      ││  ← Mission card with progress bar
│  │ ████░░░  1/3        ││
│  │ Reward: 200 Gold    ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ Make 5 correct Calls││
│  │ ██░░░░░  2/5        ││
│  │ Reward: 50 Gems     ││
│  └─────────────────────┘│
│                         │
│  [LEADERBOARD]          │
│  🥇 CryptoKing   4,280  │
│  🥈 WhaleHunter  3,940  │  ← Top 10 shown, player rank highlighted
│  🥉 DegenGod     3,710  │
│  …                      │
│  #47 YOU         1,200  │  ← Player row always visible, gold highlight
```

#### District 4 — The Vault (Profile)
```
│  "THE VAULT"            │
│                         │
│  [Large chibi sprite    │  ← Player character, idle animation
│   center stage]         │
│  [Name] [Class badge]   │
│  Level 12 ████████ 60% │  ← XP bar with % to next level
│                         │
│  [STATS]                │
│  HP  100+40  = 140      │  ← Base + gear bonus shown
│  ATK 1.0+0.2 = 1.2     │
│  DEF 10%+8%  = 18%      │
│  SPD 45+3    = 48       │
│  LUCK 20+4   = 24       │
│                         │
│  [EQUIPMENT]            │
│  ┌──────┐┌──────┐┌────┐ │
│  │Outfit││Weapon││Acc │ │  ← 3 equipment slot boxes
│  │[img] ││[img] ││[img│ │
│  │[SWAP]││[SWAP]││SWAP│ │
│  └──────┘└──────┘└────┘ │
│                         │
│  [W/L: 24W / 11L]       │
│  [Win Rate: 68.5%]      │
```

---

### SCREEN 4 — PRE-BATTLE FLOW

#### Sub-screen 4A — Mode Select → Coin Select
```
┌─────────────────────────┐
│ ← [Back]               │
│  "Choose Your Coin"     │  ← --text-xl, gold
│  "Pick wisely — same    │
│   coin, mirror match"   │  ← Subtitle hint text
│                         │
│  ┌─────────────────────┐│
│  │ ₿ BITCOIN (BTC)     ││  ← Coin select cards
│  │ Volatility: LOW  🟢 ││
│  │ Multiplier: ×1.0    ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ Ξ ETHEREUM (ETH)    ││
│  │ Volatility: MED  🟡 ││
│  │ Multiplier: ×1.25   ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ ◎ SOLANA (SOL)      ││
│  │ Volatility: HIGH 🟠 ││
│  │ Multiplier: ×1.5    ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ Ð DOGECOIN (DOGE)   ││
│  │ Volatility: XTRM 🔴 ││
│  │ Multiplier: ×2.0    ││
│  └─────────────────────┘│
│  [Scroll for BNB…]      │
└─────────────────────────┘
```

#### Sub-screen 4B — Item Confirm
```
┌─────────────────────────┐
│ ← [Back]   Ready Check  │
│                         │
│  "Equip Your Loadout"   │
│                         │
│  ┌──────┐┌──────┐┌────┐ │
│  │Outfit││Weapon││Acc │ │  ← Current equipped items
│  │[img] ││[img] ││[img│ │
│  │[SWAP]││[SWAP]││SWAP│ │  ← Opens inventory sheet
│  └──────┘└──────┘└────┘ │
│                         │
│  [ACTIVE ITEMS]         │  ← Battle items (from Ch.1 system)
│  ┌──────┐┌──────┐┌────┐ │
│  │[item]││[item]││[+] │ │  ← 3 battle item slots
│  └──────┘└──────┘└────┘ │
│                         │
│  [ENTER BATTLE →]       │  ← Gold CTA
└─────────────────────────┘
```

#### Sub-screen 4C — Opponent Reveal
```
┌─────────────────────────┐
│      VS                 │  ← Centered, --text-3xl, dramatic
│                         │
│  [YOUR sprite]          │  ← Left side, slide in from left
│  [Name] [Class] [Lv]   │
│                         │
│          ⚡             │  ← Center lightning bolt
│                         │
│          [ENEMY sprite] │  ← Right side, slide in from right
│          [Name][Lv]     │
│          [AI type]      │
│                         │
│  [Selected coin badge]  │  ← Coin name + volatility shown
│                         │
│  [BATTLE START]         │  ← Auto-advances after 2s OR tap to skip
└─────────────────────────┘
```

---

### SCREEN 5 — BATTLE SCREEN

**This is the most complex screen. Every element is defined precisely.**

```
┌─────────────────────────┐
│ [Round: 3] [Coin: DOGE] │  ← Top bar: round counter + active coin
│ ════════════════════════│
│                         │
│  ENEMY HP  ████████░  │  ← Enemy HP bar: red fill, top area
│  [Enemy name] [Lv 8]   │
│                         │
│  [ENEMY CHIBI SPRITE]   │  ← Center-right, 128×128, layered
│  [idle / hurt anim]     │
│                         │
│  [PLAYER CHIBI SPRITE]  │  ← Center-left, 128×128, layered
│  [idle / attack anim]   │
│                         │
│  [Name] [Lv 5]          │
│  MY HP  ██████████  95 │  ← Player HP bar: green fill
│                         │
│  [Item 1][Item 2][Item 3]│ ← Active battle item slots (tap to use)
│ ════════════════════════│
│                         │
│  ┌────────┐ ┌─────────┐ │
│  │⚔ ATTACK│ │↑ BUFF   │ │  ← CALL group — green tint border
│  └────────┘ └─────────┘ │
│  ┌────────┐ ┌─────────┐ │
│  │🛡 DEFEND│ │↓ DEBUFF │ │  ← PUT group — red tint border
│  └────────┘ └─────────┘ │
│       ┌──────────┐       │
│       │⏸ HOLD   │       │  ← HOLD — gold tint border
│       └──────────┘       │
│                         │
│    [Timer: ██████ 8s]   │  ← Countdown bar, drains left to right
└─────────────────────────┘
```

**RPG Phase UI Rules:**
- CALL group buttons have a subtle green glow border
- PUT group buttons have a subtle red glow border
- HOLD button has gold glow border
- On tap: button scales to 0.92 instantly, then 1.05 (snap feel), then 1.0
- Selected button: stays highlighted with full glow + "LOCKED" micro-label
- Timer bar color: green → yellow → red as time decreases
- Timer expiry: HOLD auto-selected, brief shake animation on buttons

#### Market Phase Overlay
```
┌─────────────────────────┐
│ [Round 3] DOGE/USDT     │
│ [Action locked: CALL ✓] │  ← Shows player's locked action
│                         │
│ ┌─────────────────────┐ │
│ │  [LIVE CANDLESTICK  │ │
│ │   CHART — 15s candle│ │  ← Real-time chart, full width
│ │   with price line]  │ │
│ │   Current: $0.1823  │ │  ← Live price ticker
│ └─────────────────────┘ │
│                         │
│  Entry price: $0.1820   │  ← Price when market phase started
│  Change: +0.16% 📈      │  ← Live delta, color-coded
│                         │
│  Enemy: [???]           │  ← Enemy action hidden (shown as ???)
│                         │
│    [Timer: ████ 11s]    │  ← 15s countdown bar
└─────────────────────────┘
```

#### Damage Resolution Animation Sequence
**Total duration: ~2.5 seconds. Plays after market phase closes.**

```
Frame 0.0s:  Chart closes. Screen cuts to battle view.
Frame 0.1s:  "CANDLE CLOSED" flash text (gold, center screen, 300ms)
Frame 0.4s:  Player action reveal panel slides up from bottom:
             "YOU: ATTACK → CALL" [green pill]
             "ENEMY: DEFEND → PUT" [red pill]
Frame 0.8s:  Trade result badge appears:
             ✓ CORRECT — +2.1% [green burst animation] OR
             ✗ WRONG — Penalty [red flash]
Frame 1.0s:  Hit animation plays on defending sprite:
             — Attacker sprite plays attack animation (0.4s)
             — Speed lines radiate from attacker toward defender
             — Defender sprite flashes white (hurt frame, 3 flashes)
             — Defender sprite shakes (translateX ±6px, 3 cycles)
Frame 1.4s:  Damage number arcs from attacker to defender:
             — Starts small at attacker's hand anchor point
             — Scales to 2× size at apex of arc
             — Lands on defender with impact particle burst
             — Color: gold for normal, red for enemy taking damage,
               green for player healing, purple for crit
Frame 2.0s:  HP bars animate to new values (smooth, 400ms)
Frame 2.4s:  Status effects applied (buff/debuff icons appear on sprite)
Frame 2.5s:  Next round begins OR Battle End triggers
```

**Damage Number Typography:**
- Font: Rajdhani Bold
- Size: --text-2xl at apex
- Outline: 2px dark shadow for readability
- Crit hits: add "!" suffix + extra particle burst

---

### SCREEN 6 — BATTLE END SCREEN

```
┌─────────────────────────┐
│                         │
│     ★ VICTORY! ★        │  ← Win: gold starburst animation
│   OR  DEFEATED          │  ← Loss: dark, muted, no fanfare
│                         │
│  [Player chibi —        │  ← Win: victory pose + confetti
│   victory/hurt pose]    │     Loss: defeat slump pose
│                         │
│  ┌─────────────────────┐│
│  │ BATTLE RESULTS      ││
│  │ Rounds fought: 7    ││
│  │ Correct trades: 5/7 ││  ← Trade accuracy shown
│  │ Damage dealt: 284   ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ REWARDS             ││  ← Only shown on win
│  │ +120 Gold   💰      ││
│  │ +100 XP     ⭐      ││
│  │ [Item drop] 🎁      ││  ← Only if LUCK triggered a drop
│  └─────────────────────┘│
│  [Consolation: +25 XP] │  ← Loss only, muted styling
│                         │
│  [XP bar animates +XP] │  ← Bar fills, level up triggers if threshold
│                         │
│  [REMATCH] [HUB TOWN]  │  ← Two CTA buttons
└─────────────────────────┘
```

**Level Up Interrupt (if XP threshold crossed):**
```
Full screen flash → "LEVEL UP!" in --text-3xl gold
Stat increases animate one by one (+values float up)
Passive ability reminder shown if milestone reached
Duration: 1200ms → auto-returns to Battle End screen
```

---

### SCREEN 7 — ITEM SHOP DETAIL (Modal)

Triggered by tapping any item card in The Market.

```
┌─────────────────────────┐
│ [Drag handle — dismiss] │
│                         │
│  [Item sprite — large]  │  ← 128×128, animated if Legendary
│  [Rarity glow border]   │
│                         │
│  Whale's Trenchcoat     │  ← Item name, --text-xl
│  [RARE] [OUTFIT SLOT]   │  ← Rarity pill + slot type pill
│                         │
│  "Long black coat.      │  ← Flavor text, italic
│   Drips authority."     │
│                         │
│  STAT BONUS             │
│  ATK  +7    ████        │  ← Stat bonus bars, gold
│                         │
│  CLASS SYNERGY          │
│  ★★★ Trader  ← Best    │  ← Star ratings per class
│  ★★☆ Degen              │
│  ★☆☆ Analyst            │
│  ★☆☆ Hodler             │
│                         │
│  [─────────────────────]│
│  💰 800 Gold            │  ← Price, large
│  [YOU OWN THIS] or      │  ← If already owned
│  [BUY NOW]              │  ← Gold CTA
│  [LEVEL 10 REQ]         │  ← If locked, shown grayed
└─────────────────────────┘
```

---

## 25. BOTTOM NAVIGATION BAR — SPEC

```
Height: 64px + 34px safe area = 98px total
Background: --color-bg-card with top border --color-border 1px

4 tabs — equal width:
  Tab 1: Arena   icon: ⚔  label: "Arena"
  Tab 2: Market  icon: 🛒  label: "Market"
  Tab 3: Guild   icon: 🏛  label: "Guild"
  Tab 4: Vault   icon: 👤  label: "Vault"

Active tab:
  Icon color: --color-gold
  Label color: --color-gold
  Indicator: 2px gold line above icon, width of icon, rounded

Inactive tab:
  Icon color: --color-text-muted
  Label color: --color-text-muted

Tab switch animation:
  Icon scale: 1.0 → 1.2 → 1.0 (100ms --ease-snap)
  Indicator slides horizontally to new tab (250ms --ease-smooth)
  District content updates via parallax swipe simulation
```

---

## 26. PERSISTENT HUD ELEMENTS

Always visible (except Splash and Character Creation):

```
TOP BAR (44px height):
  Left:  [Avatar circle 28px] [PlayerName] [Lv.12]
  Right: [💰 1,240] [💎 45]
  Background: transparent with gradient fade to bg-deep

BOTTOM NAV: as specified in Section 25

NOTIFICATION DOTS:
  Red dot on Guild tab if unclaimed mission rewards exist
  Red dot on Vault tab if unspent stat points exist (future feature)
```

---

## 27. ACCESSIBILITY & MOBILE UX RULES

> **For AI Builders:** These are non-negotiable implementation requirements.

- All tap targets minimum 44×44px (Apple HIG standard)
- Timer bars always show both visual bar AND numeric countdown (never one alone)
- Color-blind support: CALL/PUT never rely on color alone — always paired with icon (▲ Call, ▼ Put)
- All animations respect system "Reduce Motion" setting — substitute instant transitions
- Font sizes never below 11px rendered
- HP bars always show numeric value alongside bar
- Loading states: any operation >300ms shows a spinner or skeleton loader
- Battle timers pause if app goes to background; resume on foreground with a 3-2-1 countdown overlay
- Damage numbers must be readable on both light and dark backgrounds (use text shadow outline)

---

*CryptoStrike RPG — GDD v1.0 | Chapter 3: UI/UX Design System — Appended*

---

# CHAPTER 4 — ANIMATION & VISUAL EFFECTS SYSTEM
> **For AI Builders:** This chapter defines every animation, particle effect, timing, and visual state for characters, combat, and status effects. Animation energy is FLUID & CINEMATIC — think anime sakuga smoothness. All timings are in milliseconds. Implement every state and transition exactly as described. Where sprite frames are referenced, the art team must produce them to spec.

---

## 28. ANIMATION PHILOSOPHY

### Core Principles
```
1. ANTICIPATION   — Every action has a windup before it fires
2. FOLLOW-THROUGH — Movements don't stop dead; they ease and settle
3. SQUASH/STRETCH — Chibi sprites exaggerate on impact for cartoon weight
4. OVERLAP        — Multiple animation layers play simultaneously (sprite +
                    particles + screen effects), never one at a time
5. CRYPTO SOUL    — All effects root back to market/crypto visual language
                    (charts, coins, candles, blockchain) for normal hits.
                    Classic RPG explosions reserved for crits only.
```

### Animation Priority Stack
When multiple animations compete, resolve in this order:
```
Priority 1 (highest): Battle End / Level Up sequences
Priority 2:           Crit explosion effects
Priority 3:           Hit impact + damage number arc
Priority 4:           Sprite attack/hurt animations
Priority 5:           Status effect auras/overlays
Priority 6 (lowest):  Idle breathing animation
```
Lower priority animations pause (not cancel) when higher priority plays,
then resume from current frame when higher priority finishes.

---

## 29. SPRITE ANIMATION STATES

### 29.1 Universal Sprite States
All classes share the same animation state machine. Only the weapon sprite layer changes per class. Every state below must have a corresponding sprite sheet row for both Male and Female variants per class.

```
STATE NAME      │ FRAMES │ DURATION │ LOOP?  │ TRIGGER
────────────────┼────────┼──────────┼────────┼─────────────────────────
IDLE            │   8    │  1600ms  │ YES    │ Default, between actions
WALK_IN         │   6    │   600ms  │ NO     │ Battle start entry
ANTICIPATE      │   4    │   300ms  │ NO     │ Before any action fires
ATTACK          │   8    │   500ms  │ NO     │ CALL action resolves
DEFEND_CAST     │   6    │   400ms  │ NO     │ PUT/Defend action
DEBUFF_CAST     │   7    │   450ms  │ NO     │ PUT/Debuff action
BUFF_CAST       │   6    │   380ms  │ NO     │ CALL/Buff Self action
HOLD_CAST       │   5    │   350ms  │ NO     │ HOLD action
HURT            │   5    │   400ms  │ NO     │ Taking damage
HURT_CRIT       │   7    │   550ms  │ NO     │ Taking crit damage
VICTORY         │   10   │  1200ms  │ YES    │ Battle End (win)
DEFEAT          │   8    │  1000ms  │ NO     │ Battle End (loss), holds last frame
KO              │   6    │   500ms  │ NO     │ HP reaches 0
```

### 29.2 IDLE Animation Detail
```
Duration: 1600ms loop
Frames 1–4:  Sprite floats UP 4px (ease-in-out)
Frames 5–8:  Sprite floats DOWN 4px back to origin (ease-in-out)
Weapon layer: slight rotation ±2° in sync with float
Shadow:       Ellipse below sprite scales 1.0 → 0.92 in sync with float
Breathing:    Chest/body layer scales X: 1.0 → 1.02 → 1.0 every 2 cycles
```

### 29.3 WALK_IN Animation Detail
```
Trigger: Battle start, after Opponent Reveal screen
Player sprite: enters from LEFT side, off-screen → battle position
Enemy sprite:  enters from RIGHT side, off-screen → battle position
Both play simultaneously.

Timeline:
  0ms:    Sprite at X -160px (off left/right edge), opacity 0
  0ms:    Opacity snaps to 1
  100ms:  Sprite begins moving to target position
  500ms:  Sprite overshoots target by 8px (follow-through)
  600ms:  Sprite settles at target position (ease-out bounce)
  600ms:  Transitions to IDLE state
Easing: cubic-bezier(0.22, 1, 0.36, 1) — fast approach, soft land
```

---

## 30. ACTION ANIMATION SEQUENCES

> **For AI Builders:** Each action below is a complete timeline from button press to resolution. All layers (sprite, particles, screen effects, UI) are specified together. Times are relative to the moment the action animation begins (after market phase closes).

---

### 30.1 ATTACK Action (CALL — Correct Trade)
*The most common animation. Must feel satisfying every single time.*

```
PHASE 1 — ANTICIPATE (0ms – 300ms)
  Sprite:     Plays ANTICIPATE frames (4 frames, 300ms)
              Squash slightly: scaleY 1.0 → 0.92 → 1.0
              Lean back: translateX –6px
  Weapon:     Pulls back 10px, rotates –15°
  Screen:     Subtle vignette darkens edges (opacity 0 → 0.3)
  Sound cue:  Low whoosh charge sound begins

PHASE 2 — LAUNCH (300ms – 500ms)
  Sprite:     Plays ATTACK frames 1–4 (200ms)
              Stretch forward: scaleX 1.0 → 1.12, scaleY 1.0 → 0.88
              Lunges forward: translateX +20px
  Weapon:     Swings forward in arc, rotates +45°
  Particles:  LAUNCH TRAIL spawns behind weapon:
              — 6–8 elongated gold coin shapes
              — Emit from weapon tip, trail behind at 60% opacity
              — Fade out over 200ms
              — Each coin rotates as it trails

PHASE 3 — IMPACT (500ms – 700ms)
  ★ ZOOM-IN: Camera zooms to 1.15× centered on enemy sprite
             Duration: 80ms ease-in, holds for 200ms, eases out 120ms
  ★ SCREEN SHAKE: translateX oscillates ±5px, 3 cycles, 200ms total
                  Intensity: medium (not violent)
  Sprite (attacker): Returns to center, plays ATTACK frames 5–8
  Sprite (enemy):    Snaps to HURT frame 1 simultaneously with impact
                     Flashes white: opacity overlay 0→1→0, 3 times, 120ms each
                     Squash on hit: scaleX 1.12, scaleY 0.88, 80ms → returns 200ms
  Particles — NORMAL HIT (crypto-themed):
              — 12–16 particles burst from enemy impact point
              — Mix of: small gold coin sprites (6), chart-line slash marks (4),
                blockchain hex fragments (4) — all 12×12px
              — Burst outward in 360° spread, random velocities 80–160px/s
              — Gravity: Y velocity +40px/s²
              — Lifetime: 400–600ms, fade out last 150ms
              — Coins spin during flight (rotation 0° → 360°)
  Screen:     Flash white overlay: opacity 0 → 0.6 → 0 over 120ms

PHASE 4 — DAMAGE NUMBER ARC (700ms – 1300ms)
  Origin:     Spawns at attacker's weapon tip anchor point
  Target:     Arcs to enemy's center mass
  Path:       Parabolic arc, apex at midpoint between sprites + 60px upward
  Size:       Starts at 0.4× scale, grows to 2.0× at apex, shrinks to 1.2× on land
  Typography: Rajdhani Bold, gold color, 2px dark outline
  On land:    Small impact puff particle (4 white sparks outward), 200ms
  Duration:   600ms total arc travel
  Easing:     cubic-bezier(0.34, 1.56, 0.64, 1) — slight overshoot on land

PHASE 5 — RESOLUTION (1300ms – 1600ms)
  Enemy HP bar: Animates down smoothly, 400ms ease-out
  Attacker:     Returns to IDLE from ATTACK (follow-through settle, 300ms)
  Enemy:        Returns to IDLE from HURT (300ms)
  Screen:       Vignette fades out (200ms)
  Zoom:         Returns to 1.0× (200ms ease-out)
```

---

### 30.2 ATTACK Action (CALL — Wrong Trade)
*Same structure but visually punished — player should FEEL the miss.*

```
Differences from correct trade version:
  PHASE 2 — LAUNCH:
    Weapon trail: red-tinted instead of gold, shorter (4 particles)

  PHASE 3 — IMPACT:
    NO zoom-in (attack lands weakly, no drama)
    Screen shake: reduced to ±2px, 2 cycles only
    Enemy hurt frames: only 1 white flash instead of 3
    Particles: only 6 particles, smaller (8×8px), grey-tinted coins only
               No chart lines or blockchain fragments

  PHASE 4 — DAMAGE NUMBER:
    Color: grey/white instead of gold
    Size: reaches only 1.4× at apex (not 2.0×)
    Suffix: small "↓" icon beside number (penalty indicator)
    No impact puff on land

  PHASE 5:
    Brief red tint overlay on attacker sprite (0.2 opacity, 300ms)
    — Signals the wrong prediction penalty to the player
```

---

### 30.3 CRIT HIT (LUCK-triggered bonus hit)
*Rare, explosive, full screen event. Player must feel rewarded.*

```
Trigger: When LUCK stat > 50 AND correct trade AND random roll < 15%

CRIT OVERRIDE — replaces Phase 3 onward of normal ATTACK:

  PRE-CRIT FLASH (0ms):
    Full screen white flash: opacity 0 → 1 → 0, 80ms
    Time appears to freeze: all animations pause 120ms (hitstop)

  ZOOM-IN (80ms):
    Camera zooms aggressively to 1.35× on enemy sprite
    Duration: 60ms snap-in

  CRIT PARTICLES — CLASSIC RPG EXPLOSION:
    — Large starburst: 8 golden rays emanate from impact point, 80px length
    — 24 particles: mix of classic 8-point stars (white/gold), sparks (yellow),
      and impact rings (expanding circle outline, fades out)
    — Secondary ring: expanding circle outline from impact, 0 → 120px diameter,
      opacity 1 → 0, 400ms
    — Tertiary: 4 large coin sprites (24×24px) fly outward diagonally,
      arc upward, spin 720°, land off screen

  CRIT TEXT:
    "CRIT!" text spawns above damage number
    Color: bright yellow-white gradient
    Size: --text-2xl, bold
    Animation: scale 0 → 1.4 → 1.0 with --ease-snap, 300ms
    Slight rotation: –5° → 0°

  DAMAGE NUMBER:
    Color: bright yellow-white (NOT gold — visually distinct from normal)
    Size: reaches 2.6× at apex
    "!" appended to number
    Impact puff: larger, 8 sparks outward

  SCREEN SHAKE: ±10px, 5 cycles, 350ms — most intense shake in the game

  ZOOM RETURN: 1.35× → 1.0×, 300ms ease-out
```

---

### 30.4 BUFF SELF Action (CALL)
*Crypto-themed for market connection + RPG glow for stat effect.*

```
PHASE 1 — CAST (0ms – 380ms)
  Sprite:     Plays BUFF_CAST frames
              Raises weapon/arm upward
              Scale: 1.0 → 1.05 (slight swell of confidence)
  Weapon:     Glows brighter, pulses gold

PHASE 2 — MARKET EFFECT BURST (380ms – 700ms)
  CRYPTO-THEMED (market action layer):
    — A green candlestick chart line shoots upward from below the sprite
    — Rises from feet to 60px above sprite head, 200ms
    — 6 small green up-arrows (▲) scatter outward from the chart line
    — Each arrow fades out at 80% opacity over 300ms
    — Chart line itself fades out after reaching apex (200ms)

PHASE 3 — STAT BUFF AURA (700ms – ongoing for buff duration)
  CLASSIC RPG GLOW (stat effect layer):
    — Golden pulsing aura ring appears around sprite base
    — Aura: radial gradient, gold center → transparent edge, 60px radius
    — Pulse: opacity 0.6 → 0.9 → 0.6, 800ms loop, for entire buff duration
    — Small gold sparkles: 3–4 tiny star sprites orbit the character
      slowly (360° orbit, 2000ms per revolution)
    — Buff icon (⬆ ATK) appears as floating badge above sprite head,
      with round counter showing remaining duration (e.g. "2")

PHASE 4 — WRONG TRADE VARIANT:
  — Green chart line is shorter (30px rise only)
  — Only 3 up-arrows, smaller
  — Aura glow is dimmer (opacity 0.3 → 0.5)
  — Buff badge shows "(1)" — reduced duration
```

---

### 30.5 DEFEND Action (PUT)
*Blockchain wall forms — crypto-themed defense.*

```
PHASE 1 — CAST (0ms – 400ms)
  Sprite:     Plays DEFEND_CAST frames
              Lowers center of gravity: scaleY 0.95, translateY +4px
              Arms cross in front of body

PHASE 2 — BLOCKCHAIN WALL (400ms – 750ms)
  CRYPTO-THEMED:
    — 3 blockchain hex blocks materialize in front of sprite
    — Each block: hexagon shape, dark blue outline, inner grid pattern
    — Appear sequentially: block 1 at 400ms, block 2 at 480ms, block 3 at 560ms
    — Each block: scale 0 → 1.0, opacity 0 → 1, 150ms --ease-snap
    — Blocks glow blue at edges (1px blue border, pulsing)
    — Together they form a partial wall in front of sprite

PHASE 3 — DEF BUFF AURA (750ms – ongoing)
  CLASSIC RPG GLOW (stat effect layer):
    — Blue shield-shaped aura hugs the sprite silhouette
    — Shimmer: scanline effect moves upward through aura, 1200ms loop
    — Shield badge (🛡 DEF) floats above head with duration counter
    — Blockchain wall shrinks to a small floating icon beside sprite (200ms)
      and stays for buff duration as a reminder visual

PHASE 4 — WRONG TRADE VARIANT:
  — Only 2 hex blocks appear (not 3)
  — Blocks are smaller (0.7× scale)
  — Blue aura is thinner and dimmer
  — DEF badge shows reduced duration
```

---

### 30.6 DEBUFF ENEMY Action (PUT)
*Red chart crash hits the enemy — aggressive market manipulation feel.*

```
PHASE 1 — CAST (0ms – 450ms)
  Sprite:     Plays DEBUFF_CAST frames
              Points weapon toward enemy
              Lean forward: translateX +8px

PHASE 2 — RED CHART PROJECTILE (450ms – 850ms)
  CRYPTO-THEMED:
    — A jagged red candlestick/chart line spawns at weapon tip
    — Travels horizontally toward enemy sprite, 400ms linear
    — Trail: 4 red down-arrows (▼) left behind as it travels
    — On contact with enemy: shatters into 8 red fragments
    — Fragments scatter outward, fade over 300ms

PHASE 3 — ENEMY DEBUFF AURA (850ms – ongoing)
  CLASSIC RPG GLOW (stat effect layer):
    — Dark red/crimson smoke begins rising from enemy sprite's feet
    — Smoke: 6 rising particle wisps, each 8×8px, rise 40px then fade
    — Loop: new wisp every 400ms for buff duration
    — Static/glitch effect flickers across enemy sprite every 1200ms:
      sprite briefly offsets ±3px horizontally (glitch frame), 60ms
    — Debuff badge (⬇ ATK) appears on enemy with duration counter

PHASE 4 — DAMAGE + PARTICLE:
  — Debuff deals BASE_DMG 10 so also triggers partial ATTACK sequence
  — Reduced particles: 8 red-tinted crypto particles (no crit possible)
  — Damage number: red color, normal arc

PHASE 5 — WRONG TRADE VARIANT:
  — Chart projectile travels slower (600ms instead of 400ms)
  — Only 2 red arrows trail it
  — Shatters into only 4 fragments
  — Smoke wisps are lighter (40% opacity)
  — Glitch effect does not trigger
```

---

### 30.7 HOLD Action
*Meditative, deliberate. Especially impactful for Hodler class passive.*

```
PHASE 1 — SETTLE (0ms – 350ms)
  Sprite:     Plays HOLD_CAST frames
              Sits/settles into stance: translateY +6px, scaleY 0.96
              Arms lower to sides or cross

PHASE 2 — HOLD AURA (350ms – 900ms)
  CRYPTO-THEMED:
    — Gold clock/pause icon (⏸) materializes above sprite head
    — Scale 0 → 1.0, 200ms --ease-snap
    — Rotates slowly: 0° → 15° → 0°, 600ms loop
    — 4 gold rings expand outward from sprite center:
      each ring: opacity 0.8 → 0, diameter 0 → 80px, 600ms stagger 150ms apart

  CLASSIC RPG GLOW (stat effect overlay):
    — Soft golden shimmer across entire sprite
    — Not an aura around sprite — the sprite itself brightens slightly
    — Brightness: 100% → 120% → 100%, 800ms

PHASE 3 — HODLER PASSIVE VARIANT (class-specific):
  Additional effects when Hodler uses HOLD:
    — HP regen number (+8) floats up from sprite in green, 400ms rise, fades
    — Small green heart particle (❤) floats alongside HP number
    — Enemy gets a red pulse: brief red flash on enemy sprite (Hodler's
      passive reducing enemy next TRADE_RESULT)
    — Red ↓ icon appears briefly on enemy (150ms, then fades)

PHASE 4 — RETURN TO IDLE:
  Sprite rises back: translateY returns to 0, scaleY to 1.0, 300ms ease-out
  Pause icon fades out (200ms)
  Gold rings have already faded by this point
```

---

### 30.8 HURT Animation (Taking Damage)
*Plays on the DEFENDING sprite during any damage resolution.*

```
NORMAL HURT (0ms – 400ms):
  Frame 0ms:    Sprite snaps to HURT frame 1 (recoil pose)
  0ms – 120ms:  White flash overlay: opacity 0 → 1 → 0, repeats 3×
  0ms – 120ms:  Sprite offset: translateX –8px (knockback)
  120ms – 300ms: Sprite returns to center, ease-out
                 Squash-stretch: scaleX 1.08, scaleY 0.92 on knockback frame
  300ms – 400ms: Settles back to IDLE position

CRIT HURT (0ms – 550ms):
  Frame 0ms:    Snaps to HURT_CRIT frame 1
  0ms:          Hitstop pause: all animations freeze 120ms
  120ms – 200ms: White flash 5× rapid pulses (faster than normal)
  120ms – 350ms: Larger knockback: translateX –16px
  200ms – 350ms: Shake while displaced: ±4px rapid oscillation
  350ms – 550ms: Returns to center, settles

LOW HP VARIANT (HP < 25%):
  After hurt animation, sprite enters LOW_HP idle state:
  — Sprite tilts slightly: rotate –5° (damaged posture)
  — Idle float is halved in amplitude (2px instead of 4px)
  — Subtle red vignette on screen edges: opacity 0.15, persistent
  — Sprite occasionally flinches: random HURT frame 1 flash, 60ms, every 8–12s
```

---

### 30.9 KO Animation (HP Reaches 0)

```
Timeline (500ms total, then holds last frame):
  0ms:      Final HURT frame plays
  0ms:      Screen flash: full white, opacity 0 → 0.9, 80ms
  80ms:     Screen shake: ±8px, 4 cycles, 250ms
  80ms:     Sprite plays KO frames:
            — Spins once (rotate 0° → 360°, 300ms)
            — Shrinks: scale 1.0 → 0.0, 300ms ease-in
            — Simultaneously falls: translateY +40px
  380ms:    Sprite reaches scale 0, invisible
  380ms:    Small explosion at sprite's last position:
            — 12 classic RPG stars burst outward (white/gold)
            — 4 large coin sprites fly outward
            — Expanding ring (same as crit ring but gold)
  500ms:    Screen fades to black (300ms ease-in) → Battle End screen
```

---

### 30.10 VICTORY Animation

```
Trigger: Enemy HP reaches 0. Plays on player's sprite.
Duration: 1200ms loop (holds until Battle End screen appears)

  0ms:      Sprite plays VICTORY frames 1–5 (600ms):
            — Jump: translateY –30px then return (ease-out up, ease-in down)
            — Arms raise upward at apex
  200ms:    Confetti particles spawn from top of screen:
            — 20 particles: mix of gold coins, green up-arrows, star shapes
            — Fall with gravity, slight random X drift
            — Lifetime: 1500ms, no fade (fall off screen bottom)
  600ms:    VICTORY frames 6–10 loop:
            — Idle victory pose, slight bounce every 800ms
  600ms:    Gold aura pulses once around sprite (scale 0 → 1.5, opacity 0.8 → 0, 500ms)
  800ms:    "VICTORY!" text appears (see Battle End screen spec)

DEFEAT ANIMATION:
  Sprite plays DEFEAT frames, settles on last frame.
  Screen desaturates to 70% (grayscale filter, 500ms)
  Subtle dark vignette strengthens (opacity → 0.5)
  No particles. Silence.
```

---

## 31. DAMAGE NUMBER SYSTEM — COMPLETE SPEC

### Number Types & Colors

```
TYPE              │ COLOR          │ SIZE AT APEX │ EXTRA ELEMENTS
──────────────────┼────────────────┼──────────────┼────────────────────
Normal damage     │ Gold #F0B429   │ 2.0×         │ None
Crit damage       │ Bright white   │ 2.6×         │ "!" suffix + "CRIT!" label
Wrong trade dmg   │ Grey #94A3B8   │ 1.4×         │ "↓" suffix
Debuff damage     │ Red #EF4444    │ 1.6×         │ Small ↓ icon
HP regen (HOLD)   │ Green #22C55E  │ 1.4×         │ "+" prefix + ❤ particle
Buff (no damage)  │ Gold #F0B429   │ 1.2×         │ "↑ATK" or "↑DEF" label
Debuff applied    │ Red #EF4444    │ 1.2×         │ "↓ATK" label on enemy
```

### Arc Path Specification
```
All damage numbers follow a parabolic arc:

  Start:  Attacker's weapon tip anchor (defined per class in sprite data)
  Apex:   Midpoint X between sprites, Y = midpoint Y – 60px
  End:    Defender's center mass anchor

  At start:  scale 0.4, opacity 1.0
  At apex:   scale 2.0 (or type-specific), opacity 1.0
  At end:    scale 1.2, opacity 1.0

  Duration: 600ms total
  Easing:   Custom: fast to apex (300ms ease-out), slower descent (300ms ease-in)

  On landing:
    scale 1.2 → 1.4 → 1.0 (bounce, 200ms --ease-snap)
    Impact puff: 4 white spark particles, 60px spread, 200ms lifetime
    Number holds at landing position for 800ms
    Then floats upward 20px and fades out (300ms)
```

---

## 32. SCREEN EFFECTS SUMMARY TABLE

> **For AI Builders:** Quick reference for all screen-level effects. Never apply screen effects that are not in this table.

```
EFFECT              │ TRIGGER                    │ INTENSITY  │ DURATION
────────────────────┼────────────────────────────┼────────────┼──────────
White flash         │ Any hit impact             │ 0.6 opacity│ 120ms
White flash (crit)  │ Crit hit                   │ 1.0 opacity│ 80ms
Screen shake (weak) │ Wrong trade hit            │ ±2px       │ 150ms
Screen shake (med)  │ Normal hit                 │ ±5px       │ 200ms
Screen shake (hard) │ Crit hit                   │ ±10px      │ 350ms
Zoom in (med)       │ Normal hit impact phase    │ 1.15×      │ 400ms hold
Zoom in (hard)      │ Crit hit                   │ 1.35×      │ 300ms hold
Red vignette        │ Player HP < 25%            │ 0.15 opacity│ Persistent
Dark vignette       │ Action anticipation phase  │ 0.3 opacity│ Action duration
Desaturate          │ Defeat                     │ 70% grey   │ Persistent
Confetti            │ Victory                    │ 20 particles│ 1500ms
Full screen black   │ KO → Battle End transition │ Full       │ 300ms
Gold screen flash   │ Level Up                   │ Full       │ 80ms
Hitstop (freeze)    │ Crit hit only              │ All paused │ 120ms
```

---

## 33. STATUS EFFECT ICON SYSTEM

Icons that persist on sprites for the duration of buffs/debuffs:

```
EFFECT          │ ICON  │ POSITION          │ COLOR  │ ANIMATION
────────────────┼───────┼───────────────────┼────────┼──────────────────
ATK Buff        │ ⬆ATK  │ Top-right of sprite│ Gold  │ Slow pulse (opacity)
ATK Debuff      │ ⬇ATK  │ Top-right of sprite│ Red   │ Slow pulse (opacity)
DEF Buff        │ 🛡DEF  │ Top-left of sprite │ Blue  │ Slow pulse (opacity)
HOLD passive    │ ⏸     │ Above head         │ Gold  │ Gentle rotate ±15°
Turn counter    │ [1][2] │ Beside icon badge  │ White │ Decrements each round
```

Round counter behavior:
- Counter shows remaining buff rounds as a small number badge on the icon
- When counter reaches 0: icon flashes 3× rapidly, then disappears (300ms)
- Disappearance: scale 1.0 → 1.3 → 0 (pop and vanish, 200ms)

---

## 34. WEAPON SPRITE ANCHOR POINTS

> **For AI Builders / Art Team:** Each class has a weapon layer. The weapon must align to these anchor points on the 128×128 canvas. All coordinates are from top-left corner.

```
CLASS    │ GENDER │ HAND ANCHOR (weapon tip origin) │ IDLE ROTATION
─────────┼────────┼─────────────────────────────────┼──────────────
Trader   │ Male   │ X: 78px, Y: 72px                │ –10°
Trader   │ Female │ X: 75px, Y: 70px                │ –10°
Analyst  │ Male   │ X: 80px, Y: 68px                │ 0° (floating)
Analyst  │ Female │ X: 77px, Y: 66px                │ 0° (floating)
Hodler   │ Male   │ X: 82px, Y: 75px                │ –5°
Hodler   │ Female │ X: 78px, Y: 73px                │ –5°
Degen    │ Male   │ X: 76px, Y: 65px                │ +15° (angled up)
Degen    │ Female │ X: 74px, Y: 63px                │ +15° (angled up)
```

Damage number arc ALWAYS originates from the weapon tip anchor of the ATTACKER's current equipped weapon position.

---

*CryptoStrike RPG — GDD v1.0 | Chapter 4: Animation & Visual Effects System — Appended*

---

# CHAPTER 5 — SOUND & MUSIC SYSTEM
> **For AI Builders:** This chapter defines every sound effect, music track, and audio behavior in CryptoStrike RPG. All assets listed are sourced from free, open-license libraries (Freesound.org, OpenGameArt.org, Pixabay Audio, ZapSplat free tier). File format: OGG for SFX (small, mobile-friendly), MP3 for BGM. Implement Web Audio API or platform-native audio. All volumes are normalized to the values listed. Master volume, BGM volume, and SFX volume must be independently controllable in settings.

---

## 35. MUSIC SYSTEM

### 35.1 Music Philosophy
```
Hub Town:  Lo-fi chill beats. Relaxed, warm. Player feels at home.
           No urgency. Let the player breathe between battles.

Battle:    Tension builds progressively across rounds.
           Round 1–3:   Low-energy electronic pulse, subtle beat
           Round 4–6:   Beat intensifies, synth layers add in
           Round 7+:    Full tension track, driving rhythm
           Low HP:      Additional layer (distorted/minor key) fades in

Market Phase: Clock-tick ambience layer added over battle BGM.
              Subtle but creates subconscious urgency.

Victory:   Bright, satisfying 4-bar jingle. Then returns to Hub BGM.
Defeat:    Short descending sting. Silence. Then Hub BGM fades in slowly.
```

### 35.2 BGM Track List — Free Sources

| Track ID | Usage | Style | Source | Search Term |
|---|---|---|---|---|
| BGM_HUB | Hub Town (all districts) | Lo-fi hip hop, 85 BPM | OpenGameArt.org | "lofi chill game bgm" |
| BGM_BATTLE_LOW | Battle rounds 1–3 | Minimal electronic, 100 BPM | Freesound.org | "electronic game battle loop minimal" |
| BGM_BATTLE_MID | Battle rounds 4–6 | Electronic + synth, 110 BPM | Freesound.org | "synth battle music loop medium" |
| BGM_BATTLE_HIGH | Battle rounds 7+ | Driving electronic, 120 BPM | OpenGameArt.org | "intense battle music loop electronic" |
| BGM_MARKET | Market phase layer | Clock tick + ambient | Freesound.org | "ticking clock ambient tension loop" |
| BGM_LOWLIFE | Low HP layer | Distorted minor synth | Freesound.org | "horror ambient low drone loop" |
| BGM_VICTORY | Win jingle | Bright chiptune 4-bar | OpenGameArt.org | "victory jingle chiptune short" |
| BGM_DEFEAT | Lose sting | Descending piano | Freesound.org | "defeat sting descending short" |
| BGM_LEVELUP | Level up fanfare | Orchestral hit + rise | OpenGameArt.org | "level up fanfare orchestral short" |
| BGM_SHOP | Market district variant | Lo-fi with coins ambience | Pixabay Audio | "lofi shop ambient game" |

### 35.3 BGM Transition Rules

```
All BGM transitions use CROSSFADE unless marked otherwise.

HUB → BATTLE:
  BGM_HUB fades out: 800ms
  BGM_BATTLE_LOW fades in: 800ms
  Crossfade overlap: 400ms

BATTLE_LOW → BATTLE_MID (round 4 start):
  Crossfade: 1200ms (smooth, player shouldn't notice)

BATTLE_MID → BATTLE_HIGH (round 7 start):
  Crossfade: 800ms

MARKET PHASE START:
  BGM_MARKET layer fades IN over current battle BGM: 500ms
  Both play simultaneously (BGM_MARKET at 60% volume)

MARKET PHASE END:
  BGM_MARKET fades OUT: 300ms

LOW HP TRIGGER (player HP < 25%):
  BGM_LOWLIFE layer fades IN: 1000ms
  Plays simultaneously with battle BGM at 50% volume
  Fades OUT immediately when HP goes back above 25%

BATTLE → VICTORY:
  Battle BGM cuts INSTANTLY (no fade)
  BGM_VICTORY plays immediately (100% volume)
  After jingle ends: BGM_HUB fades in over 1200ms

BATTLE → DEFEAT:
  Battle BGM cuts INSTANTLY
  BGM_DEFEAT plays (100% volume, 2–3 seconds)
  After sting: 1500ms silence
  Then BGM_HUB fades in slowly over 2000ms

LEVEL UP INTERRUPT:
  Current BGM ducks to 20% volume instantly
  BGM_LEVELUP plays at 100%
  After fanfare: BGM ducks back up to 100% over 500ms

Hub district swipe (Arena → Market → Guild → Vault):
  No BGM change. BGM_HUB plays continuously.
  EXCEPTION: Swiping to Market district crossfades
  BGM_HUB → BGM_SHOP over 600ms.
  Swiping away from Market: BGM_SHOP → BGM_HUB over 600ms.
```

---

## 36. SOUND EFFECTS — COMPLETE CATALOG

### 36.1 UI & Navigation SFX

| SFX ID | Trigger | Description | Source | Search Term | Volume |
|---|---|---|---|---|---|
| SFX_TAP | Any button tap | Short soft click, 50ms | Freesound.org | "ui button click soft short" | 70% |
| SFX_TAP_CONFIRM | Confirm/CTA button | Slightly deeper click + tiny chime | Freesound.org | "ui confirm click chime" | 75% |
| SFX_TAP_CANCEL | Back button | Soft negative click | Freesound.org | "ui cancel back click" | 65% |
| SFX_SWIPE | District swipe | Soft whoosh | Freesound.org | "whoosh soft swipe ui" | 55% |
| SFX_TAB_SWITCH | Bottom nav tab tap | Soft tick | Freesound.org | "ui tab switch tick" | 60% |
| SFX_MODAL_OPEN | Item detail sheet opens | Paper/card slide sound | Freesound.org | "paper slide soft short" | 60% |
| SFX_MODAL_CLOSE | Sheet dismissed | Reverse paper slide | Same as above (reversed) | — | 55% |
| SFX_NOTIFICATION | Red dot appears | Soft ping | Freesound.org | "notification ping soft" | 65% |
| SFX_PURCHASE | Item bought | Coin register + chime | Freesound.org | "coin register purchase chime" | 80% |
| SFX_LOCKED | Tap on locked item | Dull thud + lock rattle | Freesound.org | "locked door thud short" | 65% |
| SFX_INPUT | Text field tap | Soft keyboard click | Freesound.org | "keyboard click single soft" | 50% |

### 36.2 Character Creation SFX

| SFX ID | Trigger | Description | Source | Search Term | Volume |
|---|---|---|---|---|---|
| SFX_GENDER_SELECT | Gender card tap | Soft shimmer | Freesound.org | "shimmer sparkle short ui" | 70% |
| SFX_CLASS_SELECT | Class card tap | Deeper shimmer + whoosh | Freesound.org | "whoosh shimmer select" | 75% |
| SFX_CLASS_CONFIRM | Class confirmed | Rising chime, 3 notes | OpenGameArt.org | "chime rising confirm short" | 80% |
| SFX_NAME_CONFIRM | Name confirmed | Typewriter final clack + chime | Freesound.org | "typewriter final chime" | 75% |
| SFX_JOURNEY_START | "Start Your Journey" tap | Full orchestral hit + whoosh | OpenGameArt.org | "game start orchestral hit" | 90% |

### 36.3 Battle — RPG Phase SFX

| SFX ID | Trigger | Description | Source | Search Term | Volume |
|---|---|---|---|---|---|
| SFX_TIMER_TICK | Each second of RPG timer | Soft clock tick | Freesound.org | "clock tick soft single" | 45% |
| SFX_TIMER_URGENT | Last 3 seconds of timer | Faster, louder tick | Same file, pitch +20% | — | 65% |
| SFX_TIMER_EXPIRE | Timer runs out (auto-HOLD) | Error buzz + soft thud | Freesound.org | "timer expire buzz short" | 70% |
| SFX_CALL_SELECT | ATTACK or BUFF SELF tapped | Rising electronic blip | Freesound.org | "electronic blip rising short" | 75% |
| SFX_PUT_SELECT | DEFEND or DEBUFF tapped | Descending electronic blip | Freesound.org | "electronic blip descend short" | 75% |
| SFX_HOLD_SELECT | HOLD tapped | Low soft thud + hum | Freesound.org | "low thud hum short" | 70% |
| SFX_ACTION_LOCK | Any action locks in | Mechanical lock click | Freesound.org | "mechanical lock click" | 80% |
| SFX_ITEM_USE | Battle item activated | Whoosh + power-up shimmer | Freesound.org | "powerup whoosh shimmer" | 80% |

### 36.4 Battle — Market Phase SFX

| SFX ID | Trigger | Description | Source | Search Term | Volume |
|---|---|---|---|---|---|
| SFX_CHART_OPEN | Market phase starts | Chart/graph appear whoosh | Freesound.org | "data chart whoosh appear" | 70% |
| SFX_PRICE_TICK | Live price updates (every 1s) | Tiny soft blip | Freesound.org | "data blip tick tiny" | 30% |
| SFX_MARKET_TIMER | Each second of market timer | Subtler tick than RPG timer | Same as SFX_TIMER_TICK, volume 30% | — | 30% |
| SFX_MARKET_URGENT | Last 5 seconds | Faster price tick sound | Pitch +10%, volume +20% | — | 50% |
| SFX_CANDLE_CLOSE | 15s candle closes | Sharp snap + whoosh | Freesound.org | "snap whoosh close sharp" | 85% |
| SFX_RESULT_CORRECT | Correct trade direction | Rising chime + coin sound | Freesound.org | "correct chime coin reward" | 85% |
| SFX_RESULT_WRONG | Wrong trade direction | Descending buzz | Freesound.org | "wrong answer buzz descend" | 80% |

### 36.5 Battle — Hit Impact SFX

| SFX ID | Trigger | Description | Source | Search Term | Volume |
|---|---|---|---|---|---|
| SFX_HIT_NORMAL | Normal attack lands | Sharp punch + electronic distortion | Freesound.org | "punch hit impact electronic" | 85% |
| SFX_HIT_WEAK | Wrong trade attack lands | Dull soft thud | Freesound.org | "soft thud dull impact" | 70% |
| SFX_HIT_CRIT | Crit hit lands | Heavy impact + explosion crack | Freesound.org | "heavy impact explosion crack" | 95% |
| SFX_CRIT_FREEZE | Hitstop moment | Brief silence (100ms) then SFX_HIT_CRIT | — | — | — |
| SFX_BUFF_APPLY | Buff Self resolves | Rising shimmer + sparkle | Freesound.org | "buff shimmer sparkle rising" | 80% |
| SFX_DEBUFF_APPLY | Debuff Enemy resolves | Glitchy zap + descend | Freesound.org | "electric zap glitch descend" | 80% |
| SFX_DEFEND_CAST | Defend resolves | Shield block + clank | Freesound.org | "shield block clank impact" | 80% |
| SFX_HOLD_CAST | Hold resolves | Deep breath + low hum | Freesound.org | "deep breath hum calm" | 65% |
| SFX_SCREEN_SHAKE | Any screen shake event | Low rumble (very short) | Freesound.org | "low rumble short impact" | 60% |
| SFX_DAMAGE_LAND | Damage number lands on target | Tiny pop | Freesound.org | "pop tiny impact short" | 55% |

### 36.6 Battle — Status & State SFX

| SFX ID | Trigger | Description | Source | Search Term | Volume |
|---|---|---|---|---|---|
| SFX_LOWLIFE | HP drops below 25% | Heartbeat pulse loop | Freesound.org | "heartbeat pulse slow loop" | 50% |
| SFX_BUFF_TICK | Each round buff is active | Soft shimmer tick | Freesound.org | "shimmer tick loop short" | 35% |
| SFX_DEBUFF_TICK | Each round debuff is active | Glitch static tick | Freesound.org | "static glitch tick short" | 35% |
| SFX_BUFF_EXPIRE | Buff/debuff wears off | Shimmer fade out | Freesound.org | "shimmer fade expire short" | 55% |
| SFX_REGEN | Hodler HP regen triggers | Soft heal chime | Freesound.org | "heal chime soft short" | 70% |

### 36.7 Battle End & Progression SFX

| SFX ID | Trigger | Description | Source | Search Term | Volume |
|---|---|---|---|---|---|
| SFX_KO | Sprite KO animation | Explosive pop + whoosh | Freesound.org | "explosion pop whoosh short" | 90% |
| SFX_VICTORY_SCREEN | Victory screen appears | Crowd cheer short | Freesound.org | "crowd cheer short game" | 75% |
| SFX_DEFEAT_SCREEN | Defeat screen appears | Sad trombone short | Freesound.org | "sad trombone wah short" | 70% |
| SFX_GOLD_REWARD | Gold reward counts up | Coin clink loop | Freesound.org | "coin clink loop counting" | 70% |
| SFX_XP_FILL | XP bar filling | Rising electronic fill | Freesound.org | "xp bar fill rising electronic" | 65% |
| SFX_LEVEL_UP | Level up triggers | Orchestral fanfare hit | OpenGameArt.org | "level up fanfare hit short" | 90% |
| SFX_STAT_UP | Each stat animates up | Quick ascending blip | Freesound.org | "stat up blip ascending" | 60% |
| SFX_ITEM_DROP | Item drop revealed | Magical item appear | Freesound.org | "item drop magical appear" | 80% |

---

## 37. AUDIO IMPLEMENTATION RULES

```
1. POSITIONAL AUDIO
   — Damage number arc: panning follows number across screen
     Left side damage: audio pans left → right as number arcs
     Right side damage: audio pans right → left
   — All other SFX: centered (no pan)

2. SIMULTANEOUS SFX LIMITS
   — Maximum 6 SFX playing at once (mobile performance)
   — Priority order if limit hit:
     P1: Hit impact SFX
     P2: Damage/result SFX
     P3: Timer SFX
     P4: BGM layers
     P5: Ambient/tick SFX (drop first)

3. COOLDOWN RULES
   — SFX_TIMER_TICK: minimum 900ms between plays (prevents double-tick)
   — SFX_PRICE_TICK: minimum 800ms between plays
   — SFX_LOWLIFE heartbeat: plays on its own 1200ms loop, not per frame

4. MUTE & SETTINGS
   — Master mute: silences everything instantly
   — BGM volume slider: 0–100%, default 70%
   — SFX volume slider: 0–100%, default 85%
   — Settings persist via local storage

5. AUDIO ON MOBILE
   — All audio must be triggered by user gesture first (browser autoplay policy)
   — First tap on splash screen unlocks audio context
   — BGM preloads on splash, SFX loaded on-demand and cached
   — OGG format primary, MP3 fallback
```

---

# CHAPTER 6 — ONBOARDING SYSTEM
> **For AI Builders:** Onboarding uses interactive tooltip pop-ups that appear contextually on FIRST USE of each feature. It is non-blocking — players can dismiss any tooltip and play normally. Tooltips never appear twice for the same feature. State is tracked in local storage: `onboarding_flags` object with boolean keys per tooltip ID. Once a flag is true, that tooltip never shows again.

---

## 38. ONBOARDING PHILOSOPHY

```
RULE 1: Show, don't tell upfront.
  — No tutorial screen walls. Player learns by doing.
  — Tooltip appears ONLY when the relevant UI element is first seen.

RULE 2: One tooltip at a time.
  — Never stack tooltips. Queue them if multiple triggers fire at once.
  — Current tooltip must be dismissed before next appears.

RULE 3: Always skippable.
  — Every tooltip has an [X] dismiss button AND a "Got it" confirm button.
  — Both do the same thing: mark flag as seen, close tooltip.
  — A "Skip All Tips" option in Settings disables all future tooltips.

RULE 4: Respect the moment.
  — Tooltips NEVER appear during active battle timer countdowns.
  — Tooltips NEVER interrupt animation sequences.
  — If a tooltip was queued during a countdown, it shows AFTER the phase ends.

RULE 5: Reward curiosity.
  — First-time tooltip dismissals award small XP bonuses (5 XP each).
  — Completing all 12 core tooltips awards a one-time bonus: 50 Gold.
```

---

## 39. TOOLTIP COMPONENT SPEC

### Visual Design
```
Container:
  Background:   --color-bg-elevated (#1A2540)
  Border:       2px solid --color-gold (#F0B429)
  Border-radius: 16px
  Max width:    320px (fits portrait mobile with 16px margin each side)
  Padding:      16px
  Shadow:       0 8px 32px rgba(0,0,0,0.6)

Arrow pointer:
  12px triangle pointing toward the relevant UI element
  Same gold color as border
  Positioned dynamically (top/bottom/left/right) based on target element

Contents (top to bottom):
  1. Icon (24×24px emoji or custom icon) — left aligned
  2. Title — Rajdhani Bold, --text-lg, gold
  3. Body text — Inter Regular, --text-sm, --color-text-primary, max 2 lines
  4. [Got it ✓] button — full width, gold fill, --text-sm
  5. [X] dismiss — top-right corner, 20×20px tap target

Appear animation:
  scale 0.85 → 1.0, opacity 0 → 1, 200ms --ease-snap
  Pointer element slides in 50ms after container

Dismiss animation:
  scale 1.0 → 0.9, opacity 1 → 0, 150ms ease-in
```

### Spotlight Overlay
```
When a tooltip appears, the relevant UI element is HIGHLIGHTED:
  — Rest of screen: dark overlay, opacity 0.6, rgba(0,0,0,0.6)
  — Target element: cutout in overlay (element remains fully visible)
  — Cutout shape: rounded rect matching element bounds + 8px padding
  — Cutout pulse: subtle gold border animates around cutout, 1200ms loop
  — Tapping OUTSIDE the tooltip or target element = dismiss
```

---

## 40. TOOLTIP CATALOG — ALL 12 CORE TIPS

### GROUP A — CHARACTER CREATION (shown during first-time creation flow)

**TIP_001 — Class Stats**
```
Trigger:    Player taps a class card for the first time (Step 2)
Target:     The stat bars on the selected class card
Icon:       📊
Title:      "Your Class Shapes Everything"
Body:       "These bars define your ATK, DEF, SPD and LUCK.
             Each class fights differently — choose your style."
Flag key:   onboarding_tip_001
XP reward:  5 XP
```

**TIP_002 — Passive Ability**
```
Trigger:    Class detail panel expands (first time)
Target:     Passive ability description text
Icon:       ⚡
Title:      "Every Class Has a Secret"
Body:       "Your passive activates automatically in battle.
             It's your class's hidden edge — read it carefully."
Flag key:   onboarding_tip_002
XP reward:  5 XP
```

---

### GROUP B — HUB TOWN (shown on first Hub Town visit)

**TIP_003 — District Swipe**
```
Trigger:    First time Hub Town loads
Target:     The page dots + swipe area
Icon:       👆
Title:      "Swipe to Explore"
Body:       "Swipe left or right to visit the Arena, Market,
             Guild and Vault. Your base of operations."
Flag key:   onboarding_tip_003
XP reward:  5 XP
Delay:      800ms after Hub Town fully loads (let parallax settle first)
```

**TIP_004 — Gold & Gems**
```
Trigger:    First time top HUD bar is visible
Target:     Gold and Gem counters (top right)
Icon:       💰
Title:      "Two Currencies, One Goal"
Body:       "Gold is earned from battles. Gems unlock rare
             items. Spend both wisely in The Market."
Flag key:   onboarding_tip_004
XP reward:  5 XP
```

---

### GROUP C — PRE-BATTLE (shown during first battle entry)

**TIP_005 — Coin Volatility**
```
Trigger:    Coin Select screen loads for first time
Target:     Volatility rating badge on any coin card
Icon:       📈
Title:      "Volatility = Risk & Reward"
Body:       "High volatility coins swing harder. A correct
             trade hits bigger — but wrong trades hurt more."
Flag key:   onboarding_tip_005
XP reward:  5 XP
```

**TIP_006 — Item Loadout**
```
Trigger:    Item Confirm screen loads for first time
Target:     The 3 battle item slots
Icon:       🎒
Title:      "Your Loadout Matters"
Body:       "Equip up to 3 battle items. They activate
             during battle and can shift the fight entirely."
Flag key:   onboarding_tip_006
XP reward:  5 XP
```

---

### GROUP D — BATTLE CORE (shown during first battle, queued carefully)

**TIP_007 — Call & Put**
```
Trigger:    RPG Phase appears for the first time (round 1)
Target:     The 5 action buttons (all highlighted together)
Icon:       ⚔️
Title:      "One Tap = Two Decisions"
Body:       "Attack & Buff = CALL (you're betting price goes UP).
             Defend & Debuff = PUT (betting price goes DOWN)."
Timing:     Appears immediately when RPG phase loads (before timer starts)
            Timer does NOT start until this tooltip is dismissed.
Flag key:   onboarding_tip_007
XP reward:  5 XP
Special:    This is the ONLY tooltip that pauses a timer.
            All others respect Rule 4 (no timer interruption).
```

**TIP_008 — Market Phase**
```
Trigger:    Market phase appears for first time
Target:     The live chart area
Icon:       📉
Title:      "Watch the Market Decide"
Body:       "Your action is locked. Now watch the candle close.
             Correct direction = more damage. Wrong = less."
Timing:     Appears when market phase loads. Market timer
            is already running — tooltip is informational only,
            does NOT pause market timer (player already committed).
Flag key:   onboarding_tip_008
XP reward:  5 XP
```

**TIP_009 — Damage Formula Hint**
```
Trigger:    First damage number lands on screen
Target:     The damage number itself
Icon:       💥
Title:      "How Damage Works"
Body:       "Direction × Profit % × your ATK × items.
             Bigger price moves = bigger damage. Always ≥ 1."
Timing:     Appears after damage arc lands, before HP bar animates.
            HP bar animation waits for tooltip dismiss.
Flag key:   onboarding_tip_009
XP reward:  5 XP
```

**TIP_010 — Status Effects**
```
Trigger:    First buff or debuff icon appears on any sprite
Target:     The status icon badge on the sprite
Icon:       🔮
Title:      "Status Effects Stack Up"
Body:       "Icons above sprites show active buffs and debuffs.
             The number shows rounds remaining. Plan around them."
Flag key:   onboarding_tip_010
XP reward:  5 XP
```

---

### GROUP E — PROGRESSION (shown after first battle ends)

**TIP_011 — XP & Leveling**
```
Trigger:    XP bar animates for first time (Battle End screen)
Target:     XP bar
Icon:       ⭐
Title:      "Every Battle Makes You Stronger"
Body:       "Win or lose, you earn XP. Level up to unlock
             new items, modes, and stronger base stats."
Flag key:   onboarding_tip_011
XP reward:  5 XP
```

**TIP_012 — Item Shop**
```
Trigger:    Player first enters The Market district
Target:     First item card visible
Icon:       🛒
Title:      "Gear Changes Your Sprite Too"
Body:       "Outfits, weapons and accessories boost your stats
             AND change how your character looks in battle."
Flag key:   onboarding_tip_012
XP reward:  5 XP
Completion: After this tooltip: award 50 Gold one-time bonus.
            Show brief toast: "Tutorial complete! +50 Gold 🎉"
```

---

## 41. TOOLTIP QUEUE SYSTEM — IMPLEMENTATION SPEC

```javascript
// Pseudocode — implement in your state management layer

OnboardingQueue = []
ActiveTooltip = null

function triggerTooltip(tipId) {
  if (localStorage.getboarding_flags[tipId] === true) return  // already seen
  if (battleTimerActive && tipId !== 'TIP_007') {
    OnboardingQueue.push(tipId)   // queue for after phase ends
    return
  }
  if (animationPlaying) {
    OnboardingQueue.push(tipId)   // queue for after animation
    return
  }
  showTooltip(tipId)
}

function showTooltip(tipId) {
  ActiveTooltip = tipId
  renderTooltipComponent(tipId)   // render with spotlight overlay
  awardXP(5)                       // immediate XP reward
}

function dismissTooltip(tipId) {
  localStorage.onboarding_flags[tipId] = true
  ActiveTooltip = null
  removeTooltipComponent()
  checkCompletionBonus()
  if (OnboardingQueue.length > 0) {
    nextTip = OnboardingQueue.shift()
    showTooltip(nextTip)           // show next queued tip
  }
}

function checkCompletionBonus() {
  allSeen = ALL_TIP_IDS.every(id => localStorage.onboarding_flags[id] === true)
  if (allSeen && !localStorage.completion_bonus_awarded) {
    awardGold(50)
    showToast("Tutorial complete! +50 Gold 🎉")
    localStorage.completion_bonus_awarded = true
  }
}
```

---

## 42. SETTINGS — "SKIP ALL TIPS" OPTION

```
Location: Settings screen (accessible from Vault district → gear icon)

Toggle: "Show gameplay tips"  [ON / OFF]
Default: ON

When toggled OFF:
  — Sets all onboarding_flags to true immediately
  — Any queued tooltips are cleared
  — No XP rewards are awarded for unseen tips
  — Can be toggled back ON: resets all flags to false,
    tips will show again from the beginning

Visual: Standard toggle switch, gold when ON, grey when OFF
```

---

*CryptoStrike RPG — GDD v1.0 | Chapter 5: Sound & Music + Chapter 6: Onboarding — Appended*
