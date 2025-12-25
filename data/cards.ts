import { CardData, Pack, Rarity, Task, StoryChapter, Achievement, Merchant } from '../types';

// Helper for cute anime style images (Restoring image generation as requested by 'old format')
const getAnimeImg = (prompt: string) => `https://image.pollinations.ai/prompt/cute%20chibi%20anime%20style%20${encodeURIComponent(prompt)}%20soft%20colors%20illustration?width=300&height=450&nologo=true&seed=${Math.floor(Math.random()*1000)}`;
const getAvatarImg = (prompt: string) => `https://image.pollinations.ai/prompt/cute%20chibi%20anime%20avatar%20${encodeURIComponent(prompt)}%20headshot%20white%20background?width=400&height=400&nologo=true&seed=${Math.floor(Math.random()*1000)}`;

export const CARDS: CardData[] = [
  // Common
  { id: 'c1', name: 'Klein', description: 'Loyal samurai friend.', rarity: Rarity.COMMON, imageUrl: getAnimeImg('Klein Sword Art Online happy'), animeSource: 'Sword Art Online', powerLevel: 300 },
  { id: 'c2', name: 'Agil', description: 'Dependable merchant.', rarity: Rarity.COMMON, imageUrl: getAnimeImg('Agil Sword Art Online smiling'), animeSource: 'Sword Art Online', powerLevel: 350 },
  { id: 'c3', name: 'Cocytus', description: 'The icy ruler.', rarity: Rarity.COMMON, imageUrl: getAnimeImg('Cocytus Overlord cute'), animeSource: 'Overlord', powerLevel: 800 },
  { id: 'c4', name: 'Mare', description: 'The shy guardian.', rarity: Rarity.COMMON, imageUrl: getAnimeImg('Mare Bello Fiore Overlord shy'), animeSource: 'Overlord', powerLevel: 850 },
  
  // Rare
  { id: 'r1', name: 'Asuna', description: 'The Lightning Flash.', rarity: Rarity.RARE, imageUrl: getAnimeImg('Asuna Yuuki cooking'), animeSource: 'Sword Art Online', powerLevel: 850 },
  { id: 'r2', name: 'Sinon', description: 'Sniper of the icy lands.', rarity: Rarity.RARE, imageUrl: getAnimeImg('Sinon GGO cat ears'), animeSource: 'Sword Art Online', powerLevel: 800 },
  { id: 'r3', name: 'Demiurge', description: 'Tactician of Nazarick.', rarity: Rarity.RARE, imageUrl: getAnimeImg('Demiurge Overlord adjusting glasses'), animeSource: 'Overlord', powerLevel: 900 },
  
  // Epic
  { id: 'e1', name: 'Kirito', description: 'The Black Swordsman.', rarity: Rarity.EPIC, imageUrl: getAnimeImg('Kirito dual swords cool'), animeSource: 'Sword Art Online', powerLevel: 950 },
  { id: 'e2', name: 'Albedo', description: 'Overseer of Guardians.', rarity: Rarity.EPIC, imageUrl: getAnimeImg('Albedo Overlord in love'), animeSource: 'Overlord', powerLevel: 980 },
  
  // Legendary
  { id: 'l1', name: 'Ainz', description: 'The Sorcerer King.', rarity: Rarity.LEGENDARY, imageUrl: getAnimeImg('Ainz Ooal Gown majestic robe'), animeSource: 'Overlord', powerLevel: 10000 },
  { id: 'l2', name: 'Unit-01', description: 'The Robot.', rarity: Rarity.LEGENDARY, imageUrl: getAnimeImg('Evangelion Unit 01 chibi robot'), animeSource: 'Evangelion', powerLevel: 9999 },
];

export const MERCHANTS: Merchant[] = [
    {
        id: 'agil',
        name: "Agil's Shop",
        description: "Best deals in town!",
        imageUrl: getAnimeImg("cozy fantasy shop interior wooden"),
        themeColor: "from-amber-100 to-orange-100"
    },
    {
        id: 'nazarick',
        name: "Nazarick",
        description: "Treasures of the tomb.",
        imageUrl: getAnimeImg("purple gothic castle cute"),
        themeColor: "from-purple-100 to-indigo-100"
    },
    {
        id: 'nerv',
        name: "NERV HQ",
        description: "Top secret gear.",
        imageUrl: getAnimeImg("futuristic command center bright"),
        themeColor: "from-red-100 to-pink-100"
    }
];

export const PACKS: Pack[] = [
  {
    id: 'starter',
    merchantId: 'agil',
    name: 'Starter Pack',
    cost: 50,
    cardCount: 5,
    probabilities: { [Rarity.COMMON]: 0.70, [Rarity.RARE]: 0.25, [Rarity.EPIC]: 0.04, [Rarity.LEGENDARY]: 0.01 },
    color: 'border-slate-300 bg-slate-50',
  },
  {
    id: 'elite',
    merchantId: 'nazarick',
    name: 'Magic Pack',
    cost: 150,
    cardCount: 5,
    probabilities: { [Rarity.COMMON]: 0.40, [Rarity.RARE]: 0.45, [Rarity.EPIC]: 0.12, [Rarity.LEGENDARY]: 0.03 },
    color: 'border-purple-300 bg-purple-50',
  },
  {
    id: 'mythical',
    merchantId: 'nerv',
    name: 'Hero Pack',
    cost: 500,
    cardCount: 5,
    probabilities: { [Rarity.COMMON]: 0.10, [Rarity.RARE]: 0.30, [Rarity.EPIC]: 0.45, [Rarity.LEGENDARY]: 0.15 },
    color: 'border-pink-300 bg-pink-50',
  },
];

export const TASKS: Task[] = [
  { id: 't0', merchantId: 'agil', title: 'Tutorial', description: 'Open your first pack!', reward: 100, difficulty: 'Training', isTraining: true },
  { id: 't1', merchantId: 'agil', title: 'Delivery', description: 'Deliver potions to the guild.', reward: 50, difficulty: 'Easy' },
  { id: 't2', merchantId: 'nazarick', title: 'Guard Duty', description: 'Watch over the floor.', reward: 150, difficulty: 'Medium' },
  { id: 't3', merchantId: 'nerv', title: 'Defense', description: 'Protect the city.', reward: 300, difficulty: 'Hard' }
];

export const STORY_CHAPTERS: StoryChapter[] = [
    {
        id: 'ch1',
        title: 'Welcome!',
        description: 'Your adventure begins here.',
        imageUrl: 'https://image.pollinations.ai/prompt/cute%20anime%20town%20sunny%20day?nologo=true',
        reward: 100,
        completed: false,
        dialogue: [
            { speaker: "Guide", text: "Hello there! Welcome to CardVerse!", avatarUrl: getAvatarImg("anime girl guide smiling waving") },
            { speaker: "You", text: "Wow, everything is so colorful!" },
            { speaker: "Guide", text: "Visit Agil's shop to get your first cards!" }
        ]
    },
    {
        id: 'ch2',
        title: 'New Friend',
        description: 'You meet a mysterious collector.',
        imageUrl: 'https://image.pollinations.ai/prompt/anime%20park%20cherry%20blossom?nologo=true',
        reward: 250,
        completed: false,
        dialogue: [
             { speaker: "Collector", text: "Nice collection you have there.", avatarUrl: getAvatarImg("anime boy cool hat smiling") },
             { speaker: "You", text: "Thanks! I just started." }
        ]
    }
];

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'a1', title: 'Collector', description: 'Get 10 cards.', icon: '🎴', unlocked: false },
    { id: 'a2', title: 'Saver', description: 'Save 2000 coins.', icon: '💰', unlocked: false },
    { id: 'a3', title: 'Lucky', description: 'Find a Legendary.', icon: '✨', unlocked: false }
];
