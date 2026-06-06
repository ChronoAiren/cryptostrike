import type { ClassKey } from './game';

export interface DialogueLine {
  speaker: 'player' | 'enemy' | 'narrator';
  text: string;
}

export interface CampaignStage {
  id: number;
  chapterId: number;
  name: string;
  description: string;
  dialogue: DialogueLine[];
  enemy: {
    classKey: ClassKey;
    name: string;
    baseHp: number;
    baseAtk: number;
    baseDef: number;
    baseSpd: number;
    baseLk: number;
    passiveKey: string;
    passiveDesc: string;
    difficultyMultiplier: number;
  };
  coinId: string;
  rewards: CampaignReward[];
  isBoss: boolean;
}

export interface CampaignReward {
  type: 'gold' | 'gems' | 'xp' | 'item';
  amount?: number;
  itemId?: string;
  chance?: number;
}

export interface CampaignChapter {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  theme: string;
  stages: CampaignStage[];
}

export interface LevelBonuses {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  lk: number;
}

export interface CampaignProgress {
  completedStages: string[];
  currentChapter: number;
  totalXp: number;
  unlockedChapters: number[];
  level: number;
  xp: number;
  xpToNext: number;
  levelBonuses: LevelBonuses;
}

export interface CampaignState {
  isActive: boolean;
  selectedChapter: CampaignChapter | null;
  selectedStage: CampaignStage | null;
  dialogueIndex: number;
  progress: CampaignProgress;
}
