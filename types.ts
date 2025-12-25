export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

export interface CardData {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  imageUrl: string;
  animeSource?: string;
  powerLevel?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface DialogueLine {
    speaker: string;
    text: string;
    avatarUrl?: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  reward: number;
  completed: boolean;
  dialogue: DialogueLine[];
  requiredTaskId?: string;
}

export interface User {
  username: string;
  balance: number;
  collection: string[];
  level: number;
  exp: number;
  avatarUrl: string;
  backgroundUrl: string;
  is2FAEnabled: boolean;
  email?: string;
  isAdmin?: boolean;
  achievements: string[];
  completedChapters: string[];
  friends: string[];
  completedTraining: boolean;
}

export interface Pack {
  id: string;
  merchantId: string;
  name: string;
  cost: number;
  cardCount: number;
  probabilities: {
    [key in Rarity]: number;
  };
  color: string;
}

export interface Trade {
  id: string;
  fromUser: string;
  toUser: string;
  offerCardId: string;
  requestCardId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  timestamp: number;
}

export interface Task {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'Training' | 'Easy' | 'Medium' | 'Hard';
  isTraining?: boolean;
}

export interface Merchant {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    themeColor: string;
}

export type Theme = 'dark' | 'light' | 'cute' | 'brutal';
export type Language = 'en' | 'ru' | 'ja' | 'es' | 'fr' | 'de' | 'zh' | 'ko';

export type ViewState = 'auth' | 'profile' | 'market' | 'collection' | 'trading' | 'user-profile' | 'admin' | 'story';
