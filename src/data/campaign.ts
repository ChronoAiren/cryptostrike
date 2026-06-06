import type { CampaignChapter } from '../types/campaign';

export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [
  {
    id: 1,
    name: 'The Market Opens',
    subtitle: 'Chapter 1',
    description: 'Learn the basics of crypto combat as the market opens for the first time.',
    theme: '#22C55E',
    stages: [
      {
        id: 1,
        chapterId: 1,
        name: 'First Trade',
        description: 'A beginner trader tests the waters.',
        dialogue: [
          { speaker: 'narrator', text: 'The market opens. A nervous trader stands before you.' },
          { speaker: 'enemy', text: 'I just opened my first position. Let\'s see if I have what it takes!' },
          { speaker: 'player', text: 'Time to learn the ropes. Prepare yourself!' },
        ],
        enemy: {
          classKey: 'char_two',
          name: 'Rookie Trader',
          baseHp: 70,
          baseAtk: 0.85,
          baseDef: 0.06,
          difficultyMultiplier: 1.0,
        },
        coinId: 'btc',
        rewards: [
          { type: 'gold', amount: 60 },
          { type: 'xp', amount: 100 },
        ],
        isBoss: false,
      },
      {
        id: 2,
        chapterId: 1,
        name: 'Market Watch',
        description: 'A day trader who watches the charts all day.',
        dialogue: [
          { speaker: 'narrator', text: 'A figure hunches over multiple screens, eyes bloodshot.' },
          { speaker: 'enemy', text: 'I\'ve been watching these charts for 72 hours straight. I know every pattern!' },
          { speaker: 'player', text: 'Sleep is for the weak. Let\'s trade!' },
        ],
        enemy: {
          classKey: 'char_one',
          name: 'Day Trader',
          baseHp: 65,
          baseAtk: 1.0,
          baseDef: 0.04,
          difficultyMultiplier: 1.05,
        },
        coinId: 'eth',
        rewards: [
          { type: 'gold', amount: 70 },
          { type: 'xp', amount: 125 },
        ],
        isBoss: false,
      },
      {
        id: 3,
        chapterId: 1,
        name: 'HODLer\'s Resolve',
        description: 'A stubborn investor who never sells.',
        dialogue: [
          { speaker: 'narrator', text: 'A figure sits cross-legged, refusing to move.' },
          { speaker: 'enemy', text: 'I bought at the top and I\'m not selling. My hands are diamond!' },
          { speaker: 'player', text: 'Diamond hands or paper hands? Let\'s find out.' },
        ],
        enemy: {
          classKey: 'char_three',
          name: 'HODLer',
          baseHp: 90,
          baseAtk: 0.8,
          baseDef: 0.15,
          difficultyMultiplier: 1.1,
        },
        coinId: 'btc',
        rewards: [
          { type: 'gold', amount: 80 },
          { type: 'xp', amount: 150 },
        ],
        isBoss: false,
      },
      {
        id: 4,
        chapterId: 1,
        name: 'The FOMO Effect',
        description: 'A trader driven by fear of missing out.',
        dialogue: [
          { speaker: 'narrator', text: 'A trader rushes in, panic in their eyes.' },
          { speaker: 'enemy', text: 'Moon! Moon! I need to buy before it goes higher!' },
          { speaker: 'player', text: 'FOMO is a dangerous thing. Time to teach a lesson.' },
        ],
        enemy: {
          classKey: 'char_four',
          name: 'FOMO Trader',
          baseHp: 75,
          baseAtk: 1.15,
          baseDef: 0.05,
          difficultyMultiplier: 1.15,
        },
        coinId: 'sol',
        rewards: [
          { type: 'gold', amount: 90 },
          { type: 'xp', amount: 175 },
        ],
        isBoss: false,
      },
      {
        id: 5,
        chapterId: 1,
        name: 'The Whale\'s Shadow',
        description: 'A massive trader looms over the market.',
        dialogue: [
          { speaker: 'narrator', text: 'A shadow falls over the trading floor.' },
          { speaker: 'enemy', text: 'I move markets with a single trade. Can you handle my volume?' },
          { speaker: 'player', text: 'Even whales can be harpooned. Let\'s dance.' },
        ],
        enemy: {
          classKey: 'char_five',
          name: 'Whale Scout',
          baseHp: 85,
          baseAtk: 1.05,
          baseDef: 0.12,
          difficultyMultiplier: 1.2,
        },
        coinId: 'bnb',
        rewards: [
          { type: 'gold', amount: 100 },
          { type: 'xp', amount: 200 },
        ],
        isBoss: false,
      },
      {
        id: 6,
        chapterId: 1,
        name: 'The Bear King',
        description: 'BOSS: The ruler of the bear market.',
        dialogue: [
          { speaker: 'narrator', text: 'A towering figure in dark armor descends. The temperature drops.' },
          { speaker: 'enemy', text: 'I am the Bear King. All who enter my domain shall fall. The market bends to my will!' },
          { speaker: 'player', text: 'A bear market doesn\'t scare me. I\'ll turn your kingdom to dust!' },
          { speaker: 'narrator', text: 'The Bear King raises his axe. The battle for the market begins.' },
        ],
        enemy: {
          classKey: 'char_three',
          name: 'The Bear King',
          baseHp: 120,
          baseAtk: 1.2,
          baseDef: 0.22,
          difficultyMultiplier: 1.3,
        },
        coinId: 'btc',
        rewards: [
          { type: 'gold', amount: 200 },
          { type: 'xp', amount: 400 },
          { type: 'gems', amount: 5 },
          { type: 'item', itemId: 'bulls_eye', chance: 1.0 },
        ],
        isBoss: true,
      },
    ],
  },
  {
    id: 2,
    name: 'Bear Territory',
    subtitle: 'Chapter 2',
    description: 'Survive the brutal bear market where only the strongest prevail.',
    theme: '#EF4444',
    stages: [
      {
        id: 1,
        chapterId: 2,
        name: 'Red Candle',
        description: 'A trader covered in blood-red charts.',
        dialogue: [
          { speaker: 'narrator', text: 'The charts turn red. A figure emerges from the darkness.' },
          { speaker: 'enemy', text: 'Everything is bleeding. I thrive in the chaos!' },
          { speaker: 'player', text: 'Chaos is a ladder. Let\'s climb.' },
        ],
        enemy: {
          classKey: 'char_four',
          name: 'Bear Raider',
          baseHp: 80,
          baseAtk: 1.2,
          baseDef: 0.08,
          difficultyMultiplier: 1.25,
        },
        coinId: 'doge',
        rewards: [
          { type: 'gold', amount: 110 },
          { type: 'xp', amount: 225 },
        ],
        isBoss: false,
      },
      {
        id: 2,
        chapterId: 2,
        name: 'Short Seller',
        description: 'A trader who profits from others\' losses.',
        dialogue: [
          { speaker: 'narrator', text: 'A cloaked figure whispers about downward trends.' },
          { speaker: 'enemy', text: 'I bet against everything. When the market falls, I rise.' },
          { speaker: 'player', text: 'Betting against the house? Bold move. Let\'s see if it pays off.' },
        ],
        enemy: {
          classKey: 'char_one',
          name: 'The Shorter',
          baseHp: 70,
          baseAtk: 1.3,
          baseDef: 0.06,
          difficultyMultiplier: 1.3,
        },
        coinId: 'eth',
        rewards: [
          { type: 'gold', amount: 120 },
          { type: 'xp', amount: 250 },
        ],
        isBoss: false,
      },
      {
        id: 3,
        chapterId: 2,
        name: 'Capitulation',
        description: 'A trader who has given up hope.',
        dialogue: [
          { speaker: 'narrator', text: 'A figure kneels in despair, surrounded by red candles.' },
          { speaker: 'enemy', text: 'It\'s over. The market is dead. But I\'ll take you with me!' },
          { speaker: 'player', text: 'Desperation makes you dangerous. I won\'t underestimate you.' },
        ],
        enemy: {
          classKey: 'char_six',
          name: 'Capitulator',
          baseHp: 85,
          baseAtk: 1.15,
          baseDef: 0.10,
          difficultyMultiplier: 1.35,
        },
        coinId: 'sol',
        rewards: [
          { type: 'gold', amount: 130 },
          { type: 'xp', amount: 275 },
        ],
        isBoss: false,
      },
      {
        id: 4,
        chapterId: 2,
        name: 'The FUD Spread',
        description: 'A master of fear, uncertainty, and doubt.',
        dialogue: [
          { speaker: 'narrator', text: 'Whispers fill the air. Fear spreads like wildfire.' },
          { speaker: 'enemy', text: 'I spread fear. I spread doubt. The market crumbles at my words!' },
          { speaker: 'player', text: 'Words are wind. Let\'s see if your actions match your threats.' },
        ],
        enemy: {
          classKey: 'char_five',
          name: 'FUD Spreader',
          baseHp: 75,
          baseAtk: 1.1,
          baseDef: 0.09,
          difficultyMultiplier: 1.4,
        },
        coinId: 'bnb',
        rewards: [
          { type: 'gold', amount: 140 },
          { type: 'xp', amount: 300 },
        ],
        isBoss: false,
      },
      {
        id: 5,
        chapterId: 2,
        name: 'Margin Call',
        description: 'A trader on the edge of liquidation.',
        dialogue: [
          { speaker: 'narrator', text: 'A trader frantically checks their account. The margin call is imminent.' },
          { speaker: 'enemy', text: 'One more drop and I\'m liquidated! I have nothing left to lose!' },
          { speaker: 'player', text: 'A cornered enemy is the most dangerous. Proceed with caution.' },
        ],
        enemy: {
          classKey: 'char_two',
          name: 'Margin Trader',
          baseHp: 95,
          baseAtk: 1.25,
          baseDef: 0.11,
          difficultyMultiplier: 1.45,
        },
        coinId: 'btc',
        rewards: [
          { type: 'gold', amount: 150 },
          { type: 'xp', amount: 325 },
        ],
        isBoss: false,
      },
      {
        id: 6,
        chapterId: 2,
        name: 'The Liquidator',
        description: 'BOSS: The one who cleanses the market of the weak.',
        dialogue: [
          { speaker: 'narrator', text: 'A massive figure rises from the depths. The market trembles.' },
          { speaker: 'enemy', text: 'I am the Liquidator. I feast on overleveraged fools. You\'re next!' },
          { speaker: 'player', text: 'I don\'t use leverage. I use skill. Prepare to fall!' },
          { speaker: 'narrator', text: 'The Liquidator raises his sword. The battle for survival begins.' },
        ],
        enemy: {
          classKey: 'char_six',
          name: 'The Liquidator',
          baseHp: 140,
          baseAtk: 1.35,
          baseDef: 0.14,
          difficultyMultiplier: 1.5,
        },
        coinId: 'sol',
        rewards: [
          { type: 'gold', amount: 300 },
          { type: 'xp', amount: 600 },
          { type: 'gems', amount: 8 },
          { type: 'item', itemId: 'bear_claw', chance: 1.0 },
        ],
        isBoss: true,
      },
    ],
  },
  {
    id: 3,
    name: 'Volatility Zone',
    subtitle: 'Chapter 3',
    description: 'Face the ultimate challenge in the most unpredictable market conditions.',
    theme: '#A855F7',
    stages: [
      {
        id: 1,
        chapterId: 3,
        name: 'Flash Crash',
        description: 'A trader who causes sudden market crashes.',
        dialogue: [
          { speaker: 'narrator', text: 'The market plummets without warning. A figure laughs in the chaos.' },
          { speaker: 'enemy', text: 'I control the flash crashes. Watch and learn!' },
          { speaker: 'player', text: 'Chaos favors the prepared. I\'m ready.' },
        ],
        enemy: {
          classKey: 'char_one',
          name: 'Flash Trader',
          baseHp: 85,
          baseAtk: 1.3,
          baseDef: 0.08,
          difficultyMultiplier: 1.55,
        },
        coinId: 'doge',
        rewards: [
          { type: 'gold', amount: 160 },
          { type: 'xp', amount: 350 },
        ],
        isBoss: false,
      },
      {
        id: 2,
        chapterId: 3,
        name: 'The Algorithm',
        description: 'A trader who trades faster than humanly possible.',
        dialogue: [
          { speaker: 'narrator', text: 'A figure moves with inhuman speed. Trades execute in microseconds.' },
          { speaker: 'enemy', text: 'I am the algorithm. I process 10,000 trades per second. Can you keep up?' },
          { speaker: 'player', text: 'Algorithms have weaknesses. I\'ll find yours.' },
        ],
        enemy: {
          classKey: 'char_two',
          name: 'The Algorithm',
          baseHp: 80,
          baseAtk: 1.25,
          baseDef: 0.10,
          difficultyMultiplier: 1.6,
        },
        coinId: 'eth',
        rewards: [
          { type: 'gold', amount: 170 },
          { type: 'xp', amount: 375 },
        ],
        isBoss: false,
      },
      {
        id: 3,
        chapterId: 3,
        name: 'Whale\'s Gambit',
        description: 'A massive trader making a bold move.',
        dialogue: [
          { speaker: 'narrator', text: 'A whale breaches the surface. The market holds its breath.' },
          { speaker: 'enemy', text: 'I\'m about to move the entire market. My position is massive!' },
          { speaker: 'player', text: 'Even the biggest whales can be outmaneuvered. Let\'s trade.' },
        ],
        enemy: {
          classKey: 'char_three',
          name: 'Whale Trader',
          baseHp: 110,
          baseAtk: 1.15,
          baseDef: 0.18,
          difficultyMultiplier: 1.65,
        },
        coinId: 'btc',
        rewards: [
          { type: 'gold', amount: 180 },
          { type: 'xp', amount: 400 },
        ],
        isBoss: false,
      },
      {
        id: 4,
        chapterId: 3,
        name: 'Pump & Dump',
        description: 'A manipulator who creates artificial price movements.',
        dialogue: [
          { speaker: 'narrator', text: 'A figure waves their hands, creating artificial hype.' },
          { speaker: 'enemy', text: 'I control the pumps! I control the dumps! The market is my puppet!' },
          { speaker: 'player', text: 'Manipulation is a coward\'s game. I\'ll expose you.' },
        ],
        enemy: {
          classKey: 'char_four',
          name: 'Manipulator',
          baseHp: 90,
          baseAtk: 1.4,
          baseDef: 0.06,
          difficultyMultiplier: 1.7,
        },
        coinId: 'bnb',
        rewards: [
          { type: 'gold', amount: 190 },
          { type: 'xp', amount: 425 },
        ],
        isBoss: false,
      },
      {
        id: 5,
        chapterId: 3,
        name: 'The Insider',
        description: 'A trader with forbidden knowledge.',
        dialogue: [
          { speaker: 'narrator', text: 'A figure appears, knowing things they shouldn\'t.' },
          { speaker: 'enemy', text: 'I know what\'s coming before anyone else. My trades are always right!' },
          { speaker: 'player', text: 'Inside information can\'t save you from skill. Face me!' },
        ],
        enemy: {
          classKey: 'char_five',
          name: 'The Insider',
          baseHp: 95,
          baseAtk: 1.35,
          baseDef: 0.12,
          difficultyMultiplier: 1.75,
        },
        coinId: 'sol',
        rewards: [
          { type: 'gold', amount: 200 },
          { type: 'xp', amount: 450 },
        ],
        isBoss: false,
      },
      {
        id: 6,
        chapterId: 3,
        name: 'The Market Maker',
        description: 'FINAL BOSS: The one who controls all markets.',
        dialogue: [
          { speaker: 'narrator', text: 'A figure materializes, surrounded by swirling charts and data streams.' },
          { speaker: 'enemy', text: 'I am the Market Maker. I create the markets you trade in. Every price, every movement—it all flows through me. You cannot defeat what creates you.' },
          { speaker: 'player', text: 'Every system has a weakness. Even you. This ends now!' },
          { speaker: 'enemy', text: 'Bold words from a mere trader. Let me show you the true power of the market!' },
          { speaker: 'narrator', text: 'The Market Maker raises their hands. The entire market bends to their will. The final battle begins.' },
        ],
        enemy: {
          classKey: 'char_six',
          name: 'The Market Maker',
          baseHp: 160,
          baseAtk: 1.5,
          baseDef: 0.20,
          difficultyMultiplier: 2.0,
        },
        coinId: 'btc',
        rewards: [
          { type: 'gold', amount: 500 },
          { type: 'xp', amount: 1000 },
          { type: 'gems', amount: 15 },
          { type: 'item', itemId: 'market_maker', chance: 1.0 },
        ],
        isBoss: true,
      },
    ],
  },
];

export function getStageKey(chapterId: number, stageId: number): string {
  return `${chapterId}-${stageId}`;
}

export function getStageById(chapterId: number, stageId: number) {
  const chapter = CAMPAIGN_CHAPTERS.find(c => c.id === chapterId);
  if (!chapter) return null;
  return chapter.stages.find(s => s.id === stageId) || null;
}

export function getNextStage(chapterId: number, stageId: number) {
  const chapter = CAMPAIGN_CHAPTERS.find(c => c.id === chapterId);
  if (!chapter) return null;

  const stageIdx = chapter.stages.findIndex(s => s.id === stageId);
  if (stageIdx < chapter.stages.length - 1) {
    return { chapterId, stageId: chapter.stages[stageIdx + 1].id };
  }

  const chapterIdx = CAMPAIGN_CHAPTERS.findIndex(c => c.id === chapterId);
  if (chapterIdx < CAMPAIGN_CHAPTERS.length - 1) {
    const nextChapter = CAMPAIGN_CHAPTERS[chapterIdx + 1];
    return { chapterId: nextChapter.id, stageId: nextChapter.stages[0].id };
  }

  return null;
}
