import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  type ClassKey,
  type ClassDefinition,
  type Item,
  type Coin,
  type FighterState,
  type BattlePhase,
  type DamageReport,
  type BuffDebuff,
} from '../types/game';
import { useAudio } from './AudioContext';
import { useBattleSounds } from '../features/battle/useBattleSounds';
import { FREE_ITEM_IDS, getItemCategory, WEARABLES } from '../data/wearables';

interface UserProfile {
  username: string;
  avatar: string;
  bio: string;
  createdAt: string;
  gamesPlayed: number;
  wins: number;
  totalDamage: number;
  cosmeticItems: string[];
  purchasedItems: string[];
  gold: number;
  gems: number;
  bgmVolume: number;
  vfxVolume: number;
}

interface GameStateContextProps {
  currentScreen: 'splash' | 'welcome' | 'home' | 'profile' | 'myCharacter' | 'items' | 'classSelect' | 'itemEquip' | 'coinChoose' | 'vs' | 'battle' | 'end' | 'settings';
  selectedClass: ClassKey | null;
  equippedItems: string[];
  selectedCoin: Coin | null;
  round: number;
  battlePhase: BattlePhase;
  currentTurn: 'player' | 'enemy';
  playerState: FighterState | null;
  enemyState: FighterState | null;
  enemyEquippedItems: string[];
  battleLog: string[];
  playerMove: 'call' | 'put' | 'hold' | null;
  playerRpgAction: string | null;
  enemyMove: 'call' | 'put' | 'hold' | null;
  entryPrice: number;
  currentPrice: number;
  priceHistory: number[];
  activeItems: (Item & { used: boolean })[];
  correctTradesCount: number;
  totalTradesCount: number;
  damageDealtCount: number;
  winRecord: boolean | null;
  marketState: 'bullish' | 'bearish' | 'sideways' | 'volatile';
  damageReport: DamageReport | null;
  isPlayerAttacking: boolean;
  isEnemyAttacking: boolean;
  isPlayerHit: boolean;
  isEnemyHit: boolean;
  animationPhase: 'idle' | 'anticipate' | 'launch' | 'impact' | 'resolution';
  turnOwner: 'player' | 'enemy' | 'none';
  showCritFlash: boolean;
  showDamageNumber: boolean;
  timerVal: number;
  timerPaused: boolean;
  damageDealtDisplay: number;
  accuracyDisplay: string;
  loadingState: { visible: boolean; message: string };
  setLoading: (visible: boolean, message?: string) => void;
  user: UserProfile;

  selectClass: (key: ClassKey) => void;
  toggleEquipItem: (id: string) => void;
  selectCoin: (coin: Coin) => void;
  useActiveItem: (id: string) => void;
  setPlayerAction: (action: 'attack' | 'buff' | 'defend' | 'debuff' | 'hold') => void;
  goHome: () => void;
  goItemsScreen: () => void;
  goCoinsScreen: () => void;
  goToClassSelect: () => void;
  goToItemEquip: () => void;
  goToVS: () => void;
  startBattle: () => void;
  restartGame: () => void;
  changeClass: () => void;
  setTimerPaused: (paused: boolean) => void;
  setUsername: (name: string) => void;
  setScreen: (s: 'splash' | 'welcome' | 'home' | 'profile' | 'myCharacter' | 'items' | 'classSelect' | 'settings') => void;
  updateProfile: (fields: { username?: string; avatar?: string; bio?: string; cosmeticItems?: string[] }) => void;
  toggleCosmeticItem: (id: string) => void;
  purchaseItem: (id: string, currency: 'gold' | 'gems') => void;
  updateVolume: (key: 'bgmVolume' | 'vfxVolume', value: number) => void;
  vfxVolume: number;
}

const GameContext = createContext<GameStateContextProps | undefined>(undefined);

// ─── CLASS DEFINITIONS ─────────────────────────────────────────────────────
// Stat budget per character ≈ 230 pts (HP + ATK×50 + DEF×100 + SPD + LCK)
// Each class excels in 1–2 areas and trades off elsewhere for balance.
export const CLASSES: Record<ClassKey, ClassDefinition> = {
  char_one: {
    name: 'Ice Mage',
    emoji: '❄️',
    color: '#60C8F0',
    hp: 80,
    atk: 1.4,
    def: 0.05,
    spd: 60,
    lk: 15,
    passiveDesc: 'Alpha Entry: Correct CALL grants ×1.5 profit bonus. Wrong trade = 0.4× penalty instead of 0.5×.',
    passiveKey: 'alpha',
  },
  char_two: {
    name: 'Forest Ranger',
    emoji: '🌿',
    color: '#6EE7A0',
    hp: 100,
    atk: 1.0,
    def: 0.12,
    spd: 45,
    lk: 25,
    passiveDesc: 'Deep Research: Buffs and Debuffs last +1 extra round when trade is correct.',
    passiveKey: 'research',
  },
  char_three: {
    name: 'Shadow Knight',
    emoji: '🌑',
    color: '#7B8FD4',
    hp: 110,
    atk: 1.1,
    def: 0.18,
    spd: 40,
    lk: 10,
    passiveDesc: 'Iron Wall: DEF cap raised to 75%. Each correct DEFEND adds +5% permanent DEF (up to cap).',
    passiveKey: 'ironwall',
  },
  char_four: {
    name: 'Berserker',
    emoji: '🔥',
    color: '#E0924A',
    hp: 90,
    atk: 1.35,
    def: 0.04,
    spd: 55,
    lk: 20,
    passiveDesc: 'Blood Rush: Each successful hit raises ATK by +0.05 (stacks up to ×1.6). Resets on wrong trade.',
    passiveKey: 'bloodrush',
  },
  char_five: {
    name: 'Enchantress',
    emoji: '🌸',
    color: '#F0A0C8',
    hp: 85,
    atk: 1.15,
    def: 0.08,
    spd: 50,
    lk: 30,
    passiveDesc: 'Fortune Weave: LCK ×2 for crit calculation. HOLD action restores 20 HP instead of 0.',
    passiveKey: 'fortune',
  },
  char_six: {
    name: 'Blood Knight',
    emoji: '⚔️',
    color: '#E86070',
    hp: 95,
    atk: 1.25,
    def: 0.10,
    spd: 50,
    lk: 10,
    passiveDesc: 'Send It: EXTREME coins deal ×2.5 damage. Below 20% HP triggers one auto-correct trade (once per battle).',
    passiveKey: 'sendit',
  },
};

export const ITEMS: Item[] = [
  { id: 'sblade', name: 'Satoshi Blade', icon: '⚔️', slot: 'weapon', statText: '+0.2 ATK', effect: { atk: 0.2 }, isActive: false },
  { id: 'barmor', name: 'Chain Armor', icon: '🛡️', slot: 'outfit', statText: '+8% DEF', effect: { def: 0.08 }, isActive: false },
  { id: 'wsurge', name: 'Whale Surge', icon: '🌊', slot: 'item', statText: 'Next CALL ×1.5', effect: { type: 'whale' }, isActive: true },
  { id: 'fud', name: 'FUD Bomb', icon: '💣', slot: 'item', statText: 'Enemy ATK –20%', effect: { type: 'fud' }, isActive: true },
  { id: 'hstone', name: 'HODL Stone', icon: '💎', slot: 'item', statText: 'HOLD heals +15', effect: { type: 'hodl' }, isActive: true },
  { id: 'lshield', name: 'Ledger Shield', icon: '🔒', slot: 'item', statText: 'Block 1 wrong trade', effect: { type: 'ledger' }, isActive: true },
  { id: 'airdrop', name: 'Airdrop', icon: '🪂', slot: 'item', statText: 'Next action ×1.2', effect: { type: 'airdrop' }, isActive: true },
  { id: 'bflag', name: 'Bull Flag', icon: '🚩', slot: 'item', statText: 'Correct CALL = ×2 profit', effect: { type: 'bull' }, isActive: true },
  { id: 'nboots', name: 'Node Boots', icon: '🥾', slot: 'boots', statText: '+15 SPD', effect: { spd: 15 }, isActive: false },
];

export const COINS: Coin[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', volatilityText: 'LOW', volatilityClass: 'vl', multiplier: 1.0, basePrice: 65000, volatilityValue: 0.008 },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', volatilityText: 'MEDIUM', volatilityClass: 'vm', multiplier: 1.25, basePrice: 3400, volatilityValue: 0.013 },
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', volatilityText: 'HIGH', volatilityClass: 'vh', multiplier: 1.5, basePrice: 180, volatilityValue: 0.022 },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', icon: '⬡', volatilityText: 'HIGH', volatilityClass: 'vh', multiplier: 1.5, basePrice: 580, volatilityValue: 0.019 },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: 'Ð', volatilityText: 'EXTREME', volatilityClass: 'vx', multiplier: 2.0, basePrice: 0.182, volatilityValue: 0.042 },
];

const AIS = [
  { name: 'Rival Mage',    spriteKey: 'char_one',   hp: 85,  atk: 1.35, def: 0.05 },
  { name: 'Rival Ranger',  spriteKey: 'char_two',   hp: 105, atk: 0.95, def: 0.14 },
  { name: 'Rival Knight',  spriteKey: 'char_three', hp: 115, atk: 1.05, def: 0.20 },
  { name: 'Rival Zerker',  spriteKey: 'char_four',  hp: 90,  atk: 1.30, def: 0.04 },
  { name: 'Rival Witch',   spriteKey: 'char_five',  hp: 90,  atk: 1.10, def: 0.08 },
  { name: 'Rival Slayer',  spriteKey: 'char_six',   hp: 100, atk: 1.20, def: 0.10 },
];

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { playSound, setVfxVolume } = useAudio();
  const battleSfx = useBattleSounds();

  // User profile (persisted)
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('cryptostrike_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          username: parsed.username ?? '',
          avatar: parsed.avatar ?? '⚔️',
          bio: parsed.bio ?? '',
          createdAt: parsed.createdAt ?? '',
          gamesPlayed: parsed.gamesPlayed ?? 0,
          wins: parsed.wins ?? 0,
          totalDamage: parsed.totalDamage ?? 0,
          cosmeticItems: parsed.cosmeticItems ?? [],
          purchasedItems: parsed.purchasedItems?.length
            ? [...new Set([...FREE_ITEM_IDS, ...parsed.purchasedItems])]
            : [...FREE_ITEM_IDS],
          gold: parsed.gold ?? 500,
          gems: parsed.gems ?? 10,
          bgmVolume: parsed.bgmVolume ?? 0.3,
          vfxVolume: parsed.vfxVolume ?? 0.5,
        };
      }
    } catch {}
    return { username: '', avatar: '⚔️', bio: '', createdAt: '', gamesPlayed: 0, wins: 0, totalDamage: 0, cosmeticItems: [], purchasedItems: [...FREE_ITEM_IDS], gold: 500, gems: 10, bgmVolume: 0.3, vfxVolume: 0.5 };
  });

  useEffect(() => {
    localStorage.setItem('cryptostrike_user', JSON.stringify(user));
  }, [user]);

  const setUsername = (name: string) => {
    setUser(prev => ({
      ...prev,
      username: name,
      createdAt: prev.createdAt || new Date().toISOString(),
    }));
    setCurrentScreen('home');
  };

  const updateProfile = (fields: { username?: string; avatar?: string; bio?: string; cosmeticItems?: string[] }) => {
    setUser(prev => ({ ...prev, ...fields }));
  };

  const toggleCosmeticItem = (id: string) => {
    setUser(prev => {
      if (prev.cosmeticItems.includes(id)) {
        return { ...prev, cosmeticItems: prev.cosmeticItems.filter(i => i !== id) };
      }
      const cat = getItemCategory(id);
      if (!cat) return { ...prev, cosmeticItems: [...prev.cosmeticItems, id] };
      return {
        ...prev,
        cosmeticItems: [...prev.cosmeticItems.filter(i => getItemCategory(i) !== cat), id],
      };
    });
  };

  const purchaseItem = (id: string, currency: 'gold' | 'gems') => {
    const item = WEARABLES.find(w => w.id === id);
    if (!item) return;
    const cost = currency === 'gold' ? item.price : item.gemCost;
    if (cost <= 0) return;
    setUser(prev => {
      const hasFunds = currency === 'gold' ? prev.gold >= cost : prev.gems >= cost;
      if (!hasFunds || prev.purchasedItems.includes(id)) return prev;
      return {
        ...prev,
        gold: currency === 'gold' ? prev.gold - cost : prev.gold,
        gems: currency === 'gems' ? prev.gems - cost : prev.gems,
        purchasedItems: [...prev.purchasedItems, id],
      };
    });
  };

  const updateVolume = useCallback((key: 'bgmVolume' | 'vfxVolume', value: number) => {
    setUser(prev => ({ ...prev, [key]: value }));
    if (key === 'vfxVolume') {
      setVfxVolume(value);
      battleSfx.setVolume(value);
    }
  }, [setVfxVolume, battleSfx]);

  const setScreen = (s: 'splash' | 'welcome' | 'home' | 'profile' | 'myCharacter' | 'items' | 'classSelect' | 'settings') => {
    setCurrentScreen(s);
  };

  const goHome = () => {
    playSound('confirm');
    setCurrentScreen('home');
  };

  // Screen routing — start at splash, skip welcome if returning user
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'welcome' | 'home' | 'profile' | 'myCharacter' | 'items' | 'classSelect' | 'itemEquip' | 'coinChoose' | 'vs' | 'battle' | 'end' | 'settings'>(() => {
    try {
      const stored = localStorage.getItem('cryptostrike_user');
      if (stored) {
        const u = JSON.parse(stored) as UserProfile;
        if (u.username) return 'splash'; // returning user → splash → classSelect
      }
    } catch {}
    return 'splash'; // new user → splash → welcome → classSelect
  });

  // Pre-game settings
  const [selectedClass, setSelectedClass] = useState<ClassKey | null>(null);
  const [equippedItems, setEquippedItems] = useState<string[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  // Battle states
  const [round, setRound] = useState<number>(1);
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('rpg');
  const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy'>('player');
  const [playerState, setPlayerState] = useState<FighterState | null>(null);
  const [enemyState, setEnemyState] = useState<FighterState | null>(null);
  const [enemyEquippedItems, setEnemyEquippedItems] = useState<string[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Moves & price data
  const [playerMove, setPlayerMove] = useState<'call' | 'put' | 'hold' | null>(null);
  const [playerRpgAction, setPlayerRpgAction] = useState<string | null>(null);
  const [enemyMove, setEnemyMove] = useState<'call' | 'put' | 'hold' | null>(null);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [marketState, setMarketState] = useState<'bullish' | 'bearish' | 'sideways' | 'volatile'>('sideways');

  // Interactive items
  const [activeItems, setActiveItems] = useState<(Item & { used: boolean })[]>([]);
  
  // Loading overlay state for screen transitions
  const [loadingState, setLoadingState] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const setLoading = (visible: boolean, message = 'Loading...') => {
    setLoadingState({ visible, message });
  };

  // Custom modifiers / flags active in combat
  const modsRef = useRef({
    whale: false,
    ledger: false,
    airdrop: false,
    bull: false,
    hodlBoost: false,
    comeback: false,
  });

  /** Avoid stale closures when market timer resolves (15s after action pick) */
  const playerRpgActionRef = useRef<'attack' | 'buff' | 'defend' | 'debuff' | 'hold' | null>(null);
  const playerMoveRef = useRef<'call' | 'put' | 'hold' | null>(null);

  // Analytics
  const [correctTradesCount, setCorrectTradesCount] = useState<number>(0);
  const [totalTradesCount, setTotalTradesCount] = useState<number>(0);
  const [damageDealtCount, setDamageDealtCount] = useState<number>(0);
  const [winRecord, setWinRecord] = useState<boolean | null>(null);
  const [damageReport, setDamageReport] = useState<DamageReport | null>(null);

  // Visual animation triggers
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [isEnemyHit, setIsEnemyHit] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'anticipate' | 'launch' | 'impact' | 'resolution'>('idle');
  const [turnOwner, setTurnOwner] = useState<'player' | 'enemy' | 'none'>('none');
  const [showCritFlash, setShowCritFlash] = useState(false);
  const [showDamageNumber, setShowDamageNumber] = useState(false);

  // Timer states
  const [timerVal, setTimerVal] = useState<number>(10);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);
  const liveChartIntervalRef = useRef<any>(null);
  const marketIntervalRef = useRef<any>(null);

  // Background music (BGM)
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const bgmTrackRef = useRef<string>('');
  const bgmVolumeRef = useRef(user.bgmVolume);

  bgmVolumeRef.current = user.bgmVolume;

  // Retry BGM on first click (browsers block autoplay on page load)
  useEffect(() => {
    const handler = () => {
      if (bgmRef.current && bgmRef.current.paused) {
        bgmRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('click', handler, { once: true, capture: true });
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    const stop = () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.src = '';
        bgmRef.current = null;
      }
      bgmTrackRef.current = '';
    };

    const playLoop = (track: string) => {
      // Same track already playing — just update volume, don't restart
      if (bgmTrackRef.current === track && bgmRef.current && !bgmRef.current.paused) {
        bgmRef.current.volume = bgmVolumeRef.current;
        return;
      }
      stop();
      const a = new Audio(`/battle_sound/background/${track}.mp3`);
      a.loop = true;
      a.volume = bgmVolumeRef.current;
      a.play().catch(() => {});
      bgmRef.current = a;
      bgmTrackRef.current = track;
    };

    const playOnce = (track: string, onEnd?: () => void) => {
      stop();
      const a = new Audio(`/battle_sound/background/${track}.mp3`);
      a.loop = false;
      a.volume = bgmVolumeRef.current;
      if (onEnd) a.addEventListener('ended', onEnd);
      a.play().catch(() => {});
      bgmRef.current = a;
      bgmTrackRef.current = track;
    };

    const onceThenLoop = (intro: string, loop: string) => {
      playOnce(intro, () => {
        const a = new Audio(`/battle_sound/background/${loop}.mp3`);
        a.loop = true;
        a.volume = bgmVolumeRef.current;
        a.play().catch(() => {});
        bgmRef.current = a;
        bgmTrackRef.current = loop;
      });
    };

    if (currentScreen === 'vs') {
      playLoop('opponent_search');
    } else if (currentScreen === 'battle') {
      onceThenLoop('opponent_found', 'in_battle');
    } else if (currentScreen === 'end') {
      if (winRecord === true) onceThenLoop('winner_start', 'winner_end');
      else if (winRecord === false) onceThenLoop('defeat_start', 'defeat_end');
      else stop();
    } else if (currentScreen === 'splash') {
      onceThenLoop('on_booting', 'homepage');
    } else if (['home', 'welcome', 'profile', 'myCharacter', 'items', 'classSelect', 'itemEquip', 'coinChoose', 'settings'].includes(currentScreen)) {
      playLoop('homepage');
    } else {
      stop();
    }

    return stop;
  }, [currentScreen, winRecord]);

  // Keep BGM volume in sync when user.bgmVolume changes
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = user.bgmVolume;
    }
  }, [user.bgmVolume]);

  // Sync VFX volume to AudioContext and battle sounds on mount/change
  useEffect(() => {
    setVfxVolume(user.vfxVolume);
    battleSfx.setVolume(user.vfxVolume);
  }, [user.vfxVolume, setVfxVolume, battleSfx]);

  // 1. Initial State Handlers
  const selectClass = (key: ClassKey) => {
    playSound('select');
    setSelectedClass(key);
  };

  const toggleEquipItem = (id: string) => {
    const idx = equippedItems.indexOf(id);
    if (idx > -1) {
      playSound('select');
      setEquippedItems(equippedItems.filter((item) => item !== id));
    } else if (equippedItems.length < 3) {
      playSound('select');
      setEquippedItems([...equippedItems, id]);
    }
  };

  const selectCoin = (coin: Coin) => {
    playSound('select');
    setSelectedCoin(coin);
  };

  const goItemsScreen = () => {
    if (!selectedClass) return;
    playSound('confirm');
    setCurrentScreen('itemEquip');
  };

  const goCoinsScreen = () => {
    playSound('confirm');
    setCurrentScreen('coinChoose');
  };

  const goToClassSelect = () => {
    playSound('cancel');
    setCurrentScreen('classSelect');
  };

  const goToItemEquip = () => {
    playSound('cancel');
    setCurrentScreen('itemEquip');
  };

  // 2. Battle Setup
  const goToVS = () => {
    if (!selectedClass || !selectedCoin) return;
    setLoading(true, 'Preparing battle...');
    playSound('confirm');

    let atkBonus = 0;
    let defBonus = 0;
    let spdBonus = 0;

    equippedItems.forEach((id) => {
      const it = ITEMS.find((i) => i.id === id);
      if (it && !it.isActive) {
        if (it.effect.atk) atkBonus += it.effect.atk;
        if (it.effect.def) defBonus += it.effect.def;
        if (it.effect.spd) spdBonus += it.effect.spd;
      }
    });

    const clDef = CLASSES[selectedClass];
    const aiDef = AIS[Math.floor(Math.random() * AIS.length)];

    setPlayerState({
      name: clDef.name,
      spriteKey: selectedClass,
      hp: clDef.hp,
      maxHp: clDef.hp,
      atk: clDef.atk + atkBonus,
      def: Math.min(clDef.def + defBonus, 0.65),
      spd: clDef.spd + spdBonus,
      lk: clDef.lk,
      buffs: [],
      debuffs: [],
    });

    const allItems = ITEMS.filter(i => !i.isActive);
    const shuffledItems = allItems.sort(() => Math.random() - 0.5);
    const enemyItems = shuffledItems.slice(0, 3).map(i => i.id);
    setEnemyEquippedItems(enemyItems);

    let enemyAtkBonus = 0;
    let enemyDefBonus = 0;
    enemyItems.forEach((id) => {
      const it = ITEMS.find((i) => i.id === id);
      if (it && it.effect.atk) enemyAtkBonus += it.effect.atk;
      if (it && it.effect.def) enemyDefBonus += it.effect.def;
    });

    setEnemyState({
      name: aiDef.name,
      spriteKey: aiDef.spriteKey,
      hp: aiDef.hp,
      maxHp: aiDef.hp,
      atk: aiDef.atk + enemyAtkBonus,
      def: Math.min(aiDef.def + enemyDefBonus, 0.65),
      spd: 50,
      lk: 10,
      buffs: [],
      debuffs: [],
    });

    const battleItems = equippedItems
      .map((id) => ITEMS.find((i) => i.id === id))
      .filter((i): i is Item => !!i && i.isActive)
      .map((i) => ({ ...i, used: false }));
    setActiveItems(battleItems);

    setRound(1);
    setBattlePhase('rpg');
    setBattleLog(['Read the live chart. BUY=Attack/Buff | PUT=Defend/Debuff']);
    setPlayerMove(null);
    setPlayerRpgAction(null);
    playerMoveRef.current = null;
    playerRpgActionRef.current = null;
    setEnemyMove(null);
    setCorrectTradesCount(0);
    setTotalTradesCount(0);
    setDamageDealtCount(0);
    setDamageReport(null);
    setWinRecord(null);

    modsRef.current = {
      whale: false,
      ledger: false,
      airdrop: false,
      bull: false,
      hodlBoost: false,
      comeback: false,
    };
    playerRpgActionRef.current = null;
    playerMoveRef.current = null;

    setEntryPrice(selectedCoin.basePrice);
    setCurrentPrice(selectedCoin.basePrice);
    setPriceHistory([selectedCoin.basePrice]);

    setCurrentScreen('vs');
  };

  const startBattle = () => {
    if (!selectedCoin) return;
    setLoading(true, 'Entering arena...');
    setTimeout(() => {
      playSound('confirm');
      setCurrentScreen('battle');
      setTimeout(() => setLoading(false), 200);
      startRpgPhase(currentPrice || selectedCoin.basePrice);
    }, 600);
  };

  // 3. Active Inventory Items
  const useActiveItem = (id: string) => {
    const itemIdx = activeItems.findIndex((it) => it.id === id && !it.used);
    if (itemIdx === -1) return;

    playSound('buff');
    const updated = [...activeItems];
    updated[itemIdx].used = true;
    setActiveItems(updated);

    const effectType = updated[itemIdx].effect.type;
    const itemName = updated[itemIdx].name;

    if (effectType === 'whale') modsRef.current.whale = true;
    if (effectType === 'ledger') modsRef.current.ledger = true;
    if (effectType === 'airdrop') modsRef.current.airdrop = true;
    if (effectType === 'bull') modsRef.current.bull = true;
    if (effectType === 'hodl') modsRef.current.hodlBoost = true;

    if (effectType === 'fud') {
      if (enemyState) {
        setEnemyState({
          ...enemyState,
          atk: Number((enemyState.atk * 0.8).toFixed(2)),
        });
      }
      setBattleLog((prev) => [...prev.slice(-2), `🛡️ FUD Bomb! Enemy ATK decreased by 20%.`]);
    }

    addToast(`${itemName} Activated!`);
  };

  const toastTimeoutRef = useRef<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const addToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 1400);
  };

  // 4. Timer Logic
  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startTimer = (initialSeconds: number, onComplete: () => void) => {
    stopTimer();
    setTimerVal(initialSeconds);
    
    let currentSec = initialSeconds;
    timerIntervalRef.current = setInterval(() => {
      if (timerPaused) return;
      currentSec--;
      setTimerVal(currentSec);

      if (currentSec <= 3 && currentSec > 0) {
        playSound('tick');
      }

      if (currentSec <= 0) {
        stopTimer();
        onComplete();
      }
    }, 1000);
  };

  // 5. RPG Actions Selection
  const startRpgPhase = (startPrice: number) => {
    setBattlePhase('rpg');
    setPlayerMove(null);
    setPlayerRpgAction(null);
    playerMoveRef.current = null;
    playerRpgActionRef.current = null;
    setEnemyMove(null);
    setDamageReport(null);

    // Apply tick adjustments to buffs/debuffs
    tickStatusAuras();

    // Determine turn order based on SPD stat per GDD
    if (playerState && enemyState) {
      const firstActor = playerState.spd >= enemyState.spd ? 'player' : 'enemy';
      setCurrentTurn(firstActor);
      setBattleLog((prev) => [...prev, `Round ${round}: ${firstActor === 'player' ? 'You' : enemyState.name} moves first (SPD ${firstActor === 'player' ? playerState.spd : enemyState.spd})`]);
    }

    // Start live drifting prices
    startLiveDrifting(startPrice);
    startTimer(10, () => {
      // Force HOLD if player goes idle
      setPlayerAction('hold');
    });
  };

  const startLiveDrifting = (startVal: number) => {
    if (liveChartIntervalRef.current) clearInterval(liveChartIntervalRef.current);
    if (marketIntervalRef.current) clearInterval(marketIntervalRef.current);

    const coin = selectedCoin!;
    // Set random market sentiment
    const states: ('bullish' | 'bearish' | 'sideways' | 'volatile')[] = [
      'bullish',
      'bearish',
      'sideways',
      'volatile',
    ];
    const sentiment = states[Math.floor(Math.random() * states.length)];
    setMarketState(sentiment);

    let price = startVal;
    const history = [price];
    setPriceHistory(history);

    liveChartIntervalRef.current = setInterval(() => {
      let drift = 0;
      if (sentiment === 'bullish') drift = Math.random() * 0.012 - 0.002;
      else if (sentiment === 'bearish') drift = Math.random() * 0.002 - 0.012;
      else if (sentiment === 'volatile') drift = (Math.random() - 0.5) * 0.03;
      else drift = (Math.random() - 0.5) * 0.008;

      price *= 1 + drift * coin.volatilityValue * 25;
      setCurrentPrice(price);
      history.push(price);
      if (history.length > 30) history.shift();
      setPriceHistory([...history]);
    }, 500);
  };

  const setPlayerAction = (action: 'attack' | 'buff' | 'defend' | 'debuff' | 'hold') => {
    if (battlePhase !== 'rpg') return;
    stopTimer();
    playSound('lock');

    const moveMap = {
      attack: 'call' as const,
      buff: 'call' as const,
      defend: 'put' as const,
      debuff: 'put' as const,
      hold: 'hold' as const,
    };

    setPlayerMove(moveMap[action]);
    setPlayerRpgAction(action);
    playerMoveRef.current = moveMap[action];
    playerRpgActionRef.current = action;

    // Proceed to Market Candle phase
    setTimeout(() => {
      startMarketPhase();
    }, 350);
  };

  // 6. Market Predictions (Candlestick evaluation)
  const startMarketPhase = () => {
    if (!selectedCoin || !playerState) return;
    setBattlePhase('mkt');

    // Cancel live idle chart
    if (liveChartIntervalRef.current) clearInterval(liveChartIntervalRef.current);

    // Establish current price as the ENTRY index
    const entry = currentPrice;
    setEntryPrice(entry);

    // AI chooses their action based on character traits
    const aiMove = getAiMove();
    setEnemyMove(aiMove);

    // Log enemy action for visibility
    const actionText = aiMove === 'call' ? 'CALL (betting UP)' : aiMove === 'put' ? 'PUT (betting DOWN)' : 'HOLD (skip)';
    setBattleLog((prev) => [...prev, `🤖 ${enemyState?.name} chooses ${actionText}`]);
    setBattleLog((prev) => [...prev, `Watching the ${selectedCoin.symbol} candle close...`]);

    const coin = selectedCoin;
    let price = entry;
    const history = [...priceHistory];

    marketIntervalRef.current = setInterval(() => {
      const drift = (Math.random() - 0.478) * coin.volatilityValue;
      price *= 1 + drift;
      setCurrentPrice(price);
      history.push(price);
      if (history.length > 30) history.shift();
      setPriceHistory([...history]);
    }, 500);

    // Runs simulation for 15s before resolving output
    startTimer(15, () => {
      if (marketIntervalRef.current) clearInterval(marketIntervalRef.current);
      resolveRoundCombat(price, entry, aiMove);
    });
  };

  const getAiMove = (): 'call' | 'put' | 'hold' => {
    if (!enemyState) return 'hold';
    const s = enemyState.spriteKey;
    // Aggressive — bias CALL
    if (s === 'char_one' || s === 'char_four') return Math.random() < 0.70 ? 'call' : 'hold';
    // Defensive — bias PUT
    if (s === 'char_three')                   return Math.random() < 0.70 ? 'put'  : 'hold';
    // Balanced — split CALL/PUT with occasional HOLD
    if (s === 'char_two' || s === 'char_five') {
      const r = Math.random();
      return r < 0.45 ? 'call' : r < 0.80 ? 'put' : 'hold';
    }
    // Wildcard — fully random
    const r = Math.random();
    return r < 0.40 ? 'call' : r < 0.70 ? 'put' : 'hold';
  };

  // 7. Combat Evaluation - Aligned with HTML Alpha Build
  const resolveRoundCombat = (exit: number, entry: number, aiMove: 'call' | 'put' | 'hold') => {
    if (!playerState || !enemyState || !selectedCoin || !selectedClass) return;
    setBattlePhase('res');

    const rpgAction = playerRpgActionRef.current;
    const pm = playerMoveRef.current;
    if (!rpgAction || !pm) {
      setBattleLog((prev) => [...prev, '⚠️ Combat sync error — defaulting to HOLD']);
      playerRpgActionRef.current = 'hold';
      playerMoveRef.current = 'hold';
    }
    const action = playerRpgActionRef.current ?? 'hold';
    const marketMove = playerMoveRef.current ?? 'hold';
    const up = exit > entry;
    const prof = Math.abs((exit - entry) / entry);

    // ── Passive: Blood Knight & char_six sendit comeback ──
    let forceGood = false;
    if (selectedClass === 'char_six' && !modsRef.current.comeback && playerState.hp / playerState.maxHp < 0.2) {
      forceGood = true;
      modsRef.current.comeback = true;
    }

    let pcorr = forceGood || (marketMove === 'call' && up) || (marketMove === 'put' && !up) || marketMove === 'hold';
    let tr: number;

    if (marketMove === 'hold') {
      tr = 1.0;
    } else if (pcorr) {
      tr = 1.0 + prof;
      // Ice Mage: Alpha Entry — ×1.5 on correct CALL
      if (selectedClass === 'char_one') tr = 1.0 + prof * 1.5;
      // Bull Flag item bonus
      if (modsRef.current.bull && marketMove === 'call') tr = 1.0 + prof * 2;
      if (forceGood) tr = 1.5;
      setCorrectTradesCount((c) => c + 1);
      playSound('correct');
    } else {
      // Ice Mage: harsher wrong penalty
      tr = modsRef.current.ledger ? 1.0 : selectedClass === 'char_one' ? 0.4 : 0.5;
      if (modsRef.current.ledger) modsRef.current.ledger = false;
      playSound('wrong');
    }

    if (modsRef.current.whale && marketMove === 'call') {
      tr *= 1.5;
      modsRef.current.whale = false;
    }
    if (modsRef.current.airdrop) {
      tr *= 1.2;
      modsRef.current.airdrop = false;
    }

    if (marketMove !== 'hold') setTotalTradesCount((t) => t + 1);

    // Enemy trade result
    const ecorr = (aiMove === 'call' && up) || (aiMove === 'put' && !up) || aiMove === 'hold';
    const etr = aiMove === 'hold' ? 1.0 : (ecorr ? 1.0 + prof * 0.8 : 0.5);

    // ── Volatility multiplier ──
    // Blood Knight & char_six: EXTREME coins ×1.25 bonus on top of coin's own ×2.0
    const isExtreme = selectedCoin.volatilityText === 'EXTREME';
    const vm = selectedCoin.multiplier * (selectedClass === 'char_six' && isExtreme ? 1.25 : 1);

    // Enemy debuffs
    let eatkm = enemyState.debuffs.filter((d) => d.type === 'atk').reduce((a, d) => a * (d.multiplier ?? 1), 1);
    const ptrd = enemyState.debuffs.filter((d) => d.type === 'tr').reduce((a, d) => a - (d.subtraction ?? 0), 0);
    const etr2 = Math.max(0.4, etr - ptrd);
    // Enemy DEF debuffs (from player's DEBUFF action)
    const enemyDefReduction = enemyState.debuffs
      .filter((d) => d.type === 'def')
      .reduce((a, d) => a + (d.subtraction ?? 0), 0);
    const effectiveEnemyDef = Math.max(0, enemyState.def - enemyDefReduction);

    // ── Effective player stats (base stats × buff/debuff multipliers) ──
    const playerAtkMult = playerState.buffs
      .filter((b) => b.type === 'atk' && b.multiplier)
      .reduce((a, b) => a * (b.multiplier ?? 1), 1);
    const playerAtkDebuff = playerState.debuffs
      .filter((d) => d.type === 'atk' && d.multiplier)
      .reduce((a, d) => a * (d.multiplier ?? 1), 1);
    const effectiveAtk = Number((playerState.atk * playerAtkMult * playerAtkDebuff).toFixed(2));

    let defBonus = playerState.buffs
      .filter((b) => b.type === 'def' && b.amount)
      .reduce((a, b) => a + (b.amount ?? 0), 0);
    const defCap = selectedClass === 'char_three' ? 0.75 : 0.65;
    let effectiveDef = Math.min(defCap, playerState.def + defBonus);

    // Existing shields (from previous rounds)
    let shieldHp = playerState.buffs
      .filter((b) => b.type === 'shield')
      .reduce((a, b) => a + (b.amount ?? 0), 0);

    let pdmg = 0;
    let peff = '';
    let edmg = 0;
    let isAtkBuff: boolean | undefined;
    let isAtkDebuff: boolean | undefined;

    // Player action processing
    let holdHeal = 0;
    let nextEnemyDebuffs = [...enemyState.debuffs];
    let nextPlayerBuffs = [...playerState.buffs];

    // ── Forest Ranger: buff/debuff duration +1 on correct trade ──
    const isRanger = selectedClass === 'char_two';

    if (action === 'attack') {
      const raw = 15 * effectiveAtk * tr * vm;
      pdmg = Math.max(1, Math.floor(raw * (1 - effectiveEnemyDef)));
      setDamageDealtCount((d) => d + pdmg);
      peff = 'atk';
      // Berserker: Blood Rush — stack ATK on hit
      if (selectedClass === 'char_four' && pdmg > 0 && pcorr) {
        nextPlayerBuffs.push({ type: 'atk', multiplier: Math.min(1.6 / effectiveAtk, 1.05), roundsRemaining: 999 });
      } else if (selectedClass === 'char_four' && !pcorr) {
        // wrong trade resets blood rush stacks only
        nextPlayerBuffs = nextPlayerBuffs.filter(b => !(b.type === 'atk' && b.multiplier));
      }
      setBattleLog((prev) => [...prev, `⚔️ ATTACK - Raw: ${raw.toFixed(1)}, DEF: ${effectiveEnemyDef}, Final: ${pdmg}`]);
    } else if (action === 'debuff') {
      isAtkDebuff = Math.random() < 0.5;
      const debuffMult = pcorr ? 0.7 : 0.85;
      const defReduction = pcorr ? 0.15 : 0.08;
      const dur = (isRanger && pcorr) ? 4 : pcorr ? 3 : 2;
      // Compute effective enemy DEF including this round's DEF debuff
      const tempDefDebuff = isAtkDebuff ? 0 : defReduction;
      const tempEnemyDef = Math.max(0, effectiveEnemyDef - tempDefDebuff);
      const raw = 10 * effectiveAtk * tr * vm;
      pdmg = Math.max(1, Math.floor(raw * (1 - tempEnemyDef)));
      setDamageDealtCount((d) => d + pdmg);
      if (isAtkDebuff) {
        nextEnemyDebuffs.push({ type: 'atk', multiplier: debuffMult, roundsRemaining: dur });
        eatkm *= debuffMult; // Apply immediately for same-round enemy attack
        setBattleLog((prev) => [...prev, `📉 DEBUFF ATK - ×${debuffMult}, Raw: ${raw.toFixed(1)}, DEF: ${tempEnemyDef}, Final: ${pdmg}`]);
      } else {
        nextEnemyDebuffs.push({ type: 'def', subtraction: defReduction, roundsRemaining: dur });
        setBattleLog((prev) => [...prev, `📉 DEBUFF DEF - -${Math.round(defReduction * 100)}%, Raw: ${raw.toFixed(1)}, DEF: ${tempEnemyDef}, Final: ${pdmg}`]);
      }
      peff = 'deb';
    } else if (action === 'buff') {
      isAtkBuff = Math.random() < 0.5;
      // +1 duration because BUFF has no same-round effect (player already acted)
      const dur = (isRanger && pcorr) ? 5 : pcorr ? 4 : 3;
      if (isAtkBuff) {
        nextPlayerBuffs.push({ type: 'atk', multiplier: pcorr ? 1.3 : 1.1, roundsRemaining: dur });
        setBattleLog((prev) => [...prev, `⬆️ BUFF ATK - ×${pcorr ? 1.3 : 1.1}`]);
      } else {
        const defAmt = pcorr ? 0.15 : 0.08;
        nextPlayerBuffs.push({ type: 'def', amount: defAmt, roundsRemaining: dur });
        // Apply immediately for same-round enemy damage
        defBonus += defAmt;
        effectiveDef = Math.min(defCap, playerState.def + defBonus);
        setBattleLog((prev) => [...prev, `⬆️ BUFF DEF - +${Math.round(defAmt * 100)}%`]);
      }
      peff = 'buf';
      playSound('buff');
    } else if (action === 'defend') {
      const shieldBase = pcorr ? 10 : 5;
      const newShield = Math.max(1, Math.floor(shieldBase * tr * vm));
      // Minimum 2-round duration, starting from current round
      const dur = (isRanger && pcorr) ? 4 : pcorr ? 3 : 2;
      nextPlayerBuffs.push({ type: 'shield', amount: newShield, roundsRemaining: dur });
      shieldHp += newShield; // Add to total for same-round absorption
      peff = 'def';
      // Shadow Knight: Iron Wall — +5% permanent DEF on correct defend
      if (selectedClass === 'char_three' && pcorr) {
        nextPlayerBuffs.push({ type: 'def', amount: 0.05, roundsRemaining: 999 });
        defBonus += 0.05;
        effectiveDef = Math.min(defCap, playerState.def + defBonus);
      }
      playSound('buff');
      setBattleLog((prev) => [...prev, `🛡️ DEFEND - Shield ${newShield} HP`]);
    } else if (action === 'hold') {
      // Enchantress: HOLD heals 20 HP; HODL Stone adds 15 on top
      const baseHeal = selectedClass === 'char_five' ? 20 : 0;
      holdHeal = modsRef.current.hodlBoost ? baseHeal + 15 : baseHeal;
      peff = 'hold';
      modsRef.current.hodlBoost = false;
      setBattleLog((prev) => [...prev, holdHeal > 0 ? `💚 HOLD - Healed ${holdHeal} HP` : `💚 HOLD - No damage dealt`]);
    }

    // Enemy damage
    if (aiMove !== 'hold') {
      const raw = 15 * enemyState.atk * eatkm * etr2 * selectedCoin.multiplier;
      edmg = Math.max(1, Math.floor(raw * (1 - effectiveDef)));
    }

    // Shield absorbs incoming damage (realtime depletion)
    if (shieldHp > 0 && edmg > 0) {
      const absorbed = Math.min(shieldHp, edmg);
      shieldHp -= absorbed;
      edmg -= absorbed;
      edmg = Math.max(0, edmg);
    }

    // Consolidate shield buffs in nextPlayerBuffs after absorption
    {
      const existingShieldBuffs = nextPlayerBuffs.filter(b => b.type === 'shield');
      if (existingShieldBuffs.length > 0) {
        const maxDur = Math.max(...existingShieldBuffs.map(b => b.roundsRemaining));
        nextPlayerBuffs = nextPlayerBuffs.filter(b => b.type !== 'shield');
        if (shieldHp > 0) {
          nextPlayerBuffs.push({ type: 'shield', amount: shieldHp, roundsRemaining: maxDur });
        }
      }
    }

    // ── Critical hit ──
    // Enchantress: Fortune Weave — LCK×2 for crit
    const effectiveLk = selectedClass === 'char_five' ? playerState.lk * 2 : playerState.lk;
    const isCrit = pcorr && effectiveLk > 25 && Math.random() < effectiveLk / 200;
    if (isCrit) {
      pdmg = Math.floor(pdmg * 1.5);
      playSound('crit');
    }

    const newEnemyHp = Math.max(0, enemyState.hp - pdmg);
    const healedPlayerHp = Math.min(playerState.maxHp, playerState.hp + holdHeal);
    const newPlayerHp = Math.max(0, healedPlayerHp - edmg);

    setBattleLog((prev) => [...prev, `💔 DAMAGE: You dealt ${pdmg} | Took ${edmg}`]);
    setBattleLog((prev) => [...prev, `   Enemy HP ${enemyState.hp} → ${newEnemyHp} | Your HP ${playerState.hp} → ${newPlayerHp}`]);

    setEnemyState((prev) =>
      prev ? { ...prev, hp: newEnemyHp, debuffs: nextEnemyDebuffs } : null
    );
    setPlayerState((prev) =>
      prev ? { ...prev, hp: newPlayerHp, buffs: nextPlayerBuffs } : null
    );

    // Determine ability subtype for VFX display
    let abilityType: 'atk' | 'def' | undefined = undefined;
    if (peff === 'buf' && action === 'buff') {
      abilityType = isAtkBuff ? 'atk' : 'def';
    } else if (peff === 'deb' && action === 'debuff') {
      abilityType = isAtkDebuff ? 'atk' : 'def';
    }

    setDamageReport({
      playerCorrect: pcorr,
      playerMove: marketMove,
      priceDriftPercent: prof,
      playerDamage: pdmg,
      enemyDamage: edmg,
      playerEffectType: peff,
      abilityType,
      isCrit,
      degenComebackTriggered: forceGood,
      playerFinalMult: tr,
      coinMultiplier: vm,
      enemyFinalMult: etr2,
    });

    if (peff === 'atk' || peff === 'deb') playSound('hit');

    // Run animations
    triggerFighterAnimations(pdmg, edmg, peff, isCrit);

    // Battle end check (use computed HP — state may not have flushed yet)
    setTimeout(() => {
      if (newEnemyHp <= 0) {
        endBattle(true);
      } else if (newPlayerHp <= 0) {
        endBattle(false);
      } else {
        setRound((r) => r + 1);
        startRpgPhase(exit);
      }
    }, 2600);
  };

  const resetAnimationFlags = () => {
    setAnimationPhase('idle');
    setTurnOwner('none');
    setIsPlayerAttacking(false);
    setIsEnemyAttacking(false);
    setIsPlayerHit(false);
    setIsEnemyHit(false);
    setShowCritFlash(false);
    setShowDamageNumber(false);
  };

  const triggerFighterAnimations = (pd: number, ed: number, effect: string, crit: boolean) => {
    resetAnimationFlags();

    const hasPlayerAttack = pd > 0 && (effect === 'atk' || effect === 'deb');
    const hasEnemyAttack = ed > 0;
    const isCritHit = crit && hasPlayerAttack;
    const hasSelfEffect = !hasPlayerAttack && (effect === 'def' || effect === 'buf' || effect === 'hold');

    if (!hasPlayerAttack && !hasEnemyAttack && !hasSelfEffect) return;

    const runTurn = (
      owner: 'player' | 'enemy',
      onLaunch: () => void,
      onImpact: () => void,
      callback: () => void,
    ) => {
      setTurnOwner(owner);
      setAnimationPhase('anticipate');

      setTimeout(() => {
        setAnimationPhase('launch');
        onLaunch();

        setTimeout(() => {
          setAnimationPhase('impact');
          onImpact();

          setTimeout(() => {
            setAnimationPhase('resolution');
            onLaunch(); // reset attack pose

            setTimeout(() => {
              callback();
            }, 250);
          }, 450);
        }, 400);
      }, 300);
    };

    const effectActionMap: Record<string, string> = {
      atk: 'attack',
      deb: 'debuff',
      def: 'defense',
      buf: 'buff',
      hold: 'heal',
    };

    // Player's turn first (attack or self-effect)
    const doPlayerTurn = () => {
      if (hasPlayerAttack) {
        const actionName = effectActionMap[effect] || 'attack';
        runTurn('player',
          () => {
            setIsPlayerAttacking(true);
            battleSfx.play(actionName, 'start');
          },
          () => {
            setIsEnemyHit(true);
            if (isCritHit) {
              setShowCritFlash(true);
              setTimeout(() => setShowCritFlash(false), 120);
            }
            setShowDamageNumber(true);
            battleSfx.play(actionName, 'end');
          },
          () => {
            setIsPlayerAttacking(false);
            setIsEnemyHit(false);
            setShowDamageNumber(false);
            doEnemyTurn();
          },
        );
      } else if (hasSelfEffect) {
        const actionName = effectActionMap[effect] || '';
        runTurn('player',
          () => {
            battleSfx.play(actionName, 'start');
          },
          () => {
            setShowDamageNumber(true);
            battleSfx.play(actionName, 'end');
          },
          () => {
            setShowDamageNumber(false);
            doEnemyTurn();
          },
        );
      } else {
        doEnemyTurn();
      }
    };

    // Enemy's turn second
    const doEnemyTurn = () => {
      if (!hasEnemyAttack) {
        resetAnimationFlags();
        return;
      }

      runTurn('enemy',
        () => {
          setIsEnemyAttacking(true);
          battleSfx.play('attack', 'start');
        },
        () => {
          setIsPlayerHit(true);
          setShowDamageNumber(true);
          battleSfx.play('attack', 'end');
        },
        () => {
          setIsEnemyAttacking(false);
          setIsPlayerHit(false);
          setShowDamageNumber(false);
          resetAnimationFlags();
        },
      );
    };

    doPlayerTurn();
  };

  const tickStatusAuras = () => {
    // Use functional state updates to avoid stale state
    setPlayerState((prev) => {
      if (!prev) return prev;

      const tick = (items: BuffDebuff[]) =>
        items
          .map((i) => ({ ...i, roundsRemaining: i.roundsRemaining - 1 }))
          .filter((i) => i.roundsRemaining > 0);

      return {
        ...prev,
        buffs: tick(prev.buffs),
        debuffs: tick(prev.debuffs),
      };
    });

    setEnemyState((prev) => {
      if (!prev) return prev;

      const tick = (items: BuffDebuff[]) =>
        items
          .map((i) => ({ ...i, roundsRemaining: i.roundsRemaining - 1 }))
          .filter((i) => i.roundsRemaining > 0);

      const nextEBuffs = tick(prev.buffs);
      const nextEDebuffs = tick(prev.debuffs);

      return {
        ...prev,
        buffs: nextEBuffs,
        debuffs: nextEDebuffs,
      };
    });
  };

  // 10. Battle End Splash
  const endBattle = (win: boolean) => {
    stopTimer();
    if (liveChartIntervalRef.current) clearInterval(liveChartIntervalRef.current);
    if (marketIntervalRef.current) clearInterval(marketIntervalRef.current);

    setLoading(true, 'Resolving battle...');
    setTimeout(() => {
      setUser(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        wins: prev.wins + (win ? 1 : 0),
        totalDamage: prev.totalDamage + damageDealtCount,
      }));

      if (win) {
        playSound('level');
        const goldReward = 50 + round * 10;
        const gemReward = 1;
        setUser(prev => ({ ...prev, gold: prev.gold + goldReward, gems: prev.gems + gemReward }));
        setWinRecord(true);
      } else {
        playSound('ko');
        setWinRecord(false);
      }

      setCurrentScreen('end');
      setTimeout(() => setLoading(false), 200);
    }, 500);
  };

  const restartGame = () => {
    playSound('confirm');
    goToVS();
  };

  const changeClass = () => {
    playSound('confirm');
    setSelectedClass(null);
    setEquippedItems([]);
    setSelectedCoin(null);
    setCurrentScreen('classSelect');
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (liveChartIntervalRef.current) clearInterval(liveChartIntervalRef.current);
      if (marketIntervalRef.current) clearInterval(marketIntervalRef.current);
    };
  }, []);

  const damageDealtDisplay = damageDealtCount;
  const accuracyDisplay = totalTradesCount > 0 ? Math.round(correctTradesCount / totalTradesCount * 100) + '%' : '—';

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        selectedClass,
        equippedItems,
        selectedCoin,
        round,
        battlePhase,
        currentTurn,
        playerState,
        enemyState,
        enemyEquippedItems,
        battleLog,
        playerMove,
        playerRpgAction,
        enemyMove,
        entryPrice,
        currentPrice,
        priceHistory,
        activeItems,
        correctTradesCount,
        totalTradesCount,
        damageDealtCount,
        winRecord,
        marketState,
        damageReport,
        isPlayerAttacking,
        isEnemyAttacking,
        isPlayerHit,
        isEnemyHit,
        animationPhase,
        turnOwner,
        showCritFlash,
        showDamageNumber,
        timerVal,
        timerPaused,
        damageDealtDisplay,
        accuracyDisplay,
        loadingState,
        setLoading,
        selectClass,
        toggleEquipItem,
        selectCoin,
        useActiveItem,
        setPlayerAction,
        goItemsScreen,
        goCoinsScreen,
        goToClassSelect,
        goToItemEquip,
        goToVS,
        startBattle,
        restartGame,
        changeClass,
        setTimerPaused,
        user,
        setUsername,
        setScreen,
        goHome,
        updateProfile,
        toggleCosmeticItem,
        purchaseItem,
        updateVolume,
        vfxVolume: user.vfxVolume,
      }}
    >
      {children}
      {toastMsg && (
        <div className="toast" style={{
          position: 'absolute',
          bottom: '85px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1.5px solid var(--color-gold)',
          borderRadius: '8px',
          padding: '6px 14px',
          fontSize: '11px',
          color: 'var(--color-gold)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          zIndex: 999,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          animation: 'popIn 0.2s ease forwards'
        }}>
          {toastMsg}
        </div>
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameStateProvider');
  }
  return context;
};
