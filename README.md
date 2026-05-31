# CryptoStrike

A full-screen crypto-trading battle game built with React + TypeScript + Vite. Choose a fighter, equip items, pick a coin, and battle AI opponents. Earn gold and gems, buy cosmetic gear, and dress up your character.

## Stack

- React 19, TypeScript, Vite
- Canvas-based sprite rendering with layered wearables
- localStorage persistence for user profile and currency
- ESLint + TypeScript strict mode

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

- `src/context/GameStateContext.tsx` — core game state, currency, battle logic
- `src/features/` — screens: Home, Battle, Items, Character, Profile, etc.
- `src/data/` — sprite manifest, item definitions
- `public/sprites/` — character spritesheets (48×80)
- `public/sprite_head|body|shoes/` — wearable overlay sprites

See `ECONOMY_SPRITES.md` for currency, item shop, and sprite system details.
