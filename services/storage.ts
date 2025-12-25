import { User, Trade, Rarity, CardData, Pack } from '../types';
import { CARDS, PACKS, ACHIEVEMENTS } from '../data/cards';

const DB_KEY = 'cardverse_db_final';

interface DB {
  users: { [username: string]: User & { password?: string } };
  trades: Trade[];
  customCards: CardData[];
  cardEdits: { [id: string]: Partial<CardData> };
  customPacks: Pack[];
}

const getDB = (): DB => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const admin: User & { password?: string } = {
        username: 'admin',
        password: 'admin',
        balance: 99999,
        collection: [],
        level: 99,
        exp: 0,
        avatarUrl: 'https://image.pollinations.ai/prompt/anime%20cyberpunk%20admin%20hacker%20glitch?nologo=true',
        backgroundUrl: 'https://image.pollinations.ai/prompt/matrix%20code%20rain%20green?nologo=true',
        is2FAEnabled: true,
        isAdmin: true,
        email: 'root@system.local',
        achievements: [],
        completedChapters: [],
        friends: [],
        completedTraining: true
    };
    return { users: { 'admin': admin }, trades: [], customCards: [], cardEdits: {}, customPacks: [] };
  }
  return JSON.parse(data);
};

const saveDB = (db: DB) => localStorage.setItem(DB_KEY, JSON.stringify(db));

export const StorageService = {
  getUser: (username: string): User | null => {
    const db = getDB();
    const user = db.users[username];
    if (user) { const { password, ...safe } = user; return safe; }
    return null;
  },
  
  login: (username: string, pass: string): User | null => {
    const db = getDB();
    const user = db.users[username];
    if (user && user.password === pass) { const { password, ...safe } = user; return safe; }
    return null;
  },

  register: (username: string, pass: string, email?: string): User => {
    const db = getDB();
    if (db.users[username]) throw new Error('User exists');
    const newUser: User = {
      username,
      balance: 1000,
      collection: [],
      level: 1,
      exp: 0,
      avatarUrl: `https://image.pollinations.ai/prompt/anime%20avatar%20${username}?width=200&height=200&nologo=true`,
      backgroundUrl: `https://image.pollinations.ai/prompt/anime%20city%20background%20${username}?width=800&height=300&nologo=true`,
      is2FAEnabled: false,
      isAdmin: false,
      email: email || '',
      achievements: [],
      completedChapters: [],
      friends: [],
      completedTraining: false
    };
    db.users[username] = { ...newUser, password: pass };
    saveDB(db);
    return newUser;
  },

  resetPassword: (email: string) => !!Object.values(getDB().users).find(u => u.email === email),

  addFriend: (u1: string, u2: string) => {
      const db = getDB();
      if(db.users[u1] && db.users[u2] && !db.users[u1].friends.includes(u2)) {
          db.users[u1].friends.push(u2);
          db.users[u2].friends.push(u1); // Auto-add
          saveDB(db);
      }
  },

  removeFriend: (u1: string, u2: string) => {
      const db = getDB();
      if(db.users[u1]) {
          db.users[u1].friends = db.users[u1].friends.filter(f => f !== u2);
          saveDB(db);
      }
  },

  getAllUsers: () => Object.values(getDB().users),
  deleteUser: (target: string) => {
      const db = getDB();
      if(db.users[target]) {
          delete db.users[target];
          db.trades = db.trades.filter(t => t.fromUser !== target && t.toUser !== target);
          saveDB(db);
      }
  },

  // Content
  createCard: (card: CardData) => { const db = getDB(); db.customCards.push(card); saveDB(db); },
  updateCard: (id: string, data: Partial<CardData>) => {
      const db = getDB();
      const idx = db.customCards.findIndex(c => c.id === id);
      if(idx !== -1) db.customCards[idx] = { ...db.customCards[idx], ...data };
      else { if(!db.cardEdits) db.cardEdits = {}; db.cardEdits[id] = { ...db.cardEdits[id], ...data }; }
      saveDB(db);
  },
  getCards: (): CardData[] => {
      const db = getDB();
      const edits = db.cardEdits || {};
      const base = CARDS.map(c => edits[c.id] ? { ...c, ...edits[c.id] } : c);
      return [...base, ...db.customCards];
  },

  // Economy
  updateProfile: (user: string, data: Partial<User>) => {
      const db = getDB();
      if(db.users[user]) { db.users[user] = { ...db.users[user], ...data }; saveDB(db); }
  },
  updateBalance: (user: string, amt: number) => {
      const db = getDB();
      if(db.users[user]) {
          db.users[user].balance += amt;
          if(db.users[user].balance >= 2000 && !db.users[user].achievements.includes('a2')) db.users[user].achievements.push('a2');
          saveDB(db);
      }
  },
  addCards: (user: string, ids: string[]) => {
      const db = getDB();
      const u = db.users[user];
      if(u) {
          u.collection.push(...ids);
          u.exp += ids.length * 10;
          u.level = Math.floor(u.exp / 100) + 1;
          const unique = new Set(u.collection).size;
          if(unique >= 10 && !u.achievements.includes('a1')) u.achievements.push('a1');
          saveDB(db);
      }
  },
  completeChapter: (user: string, chId: string, reward: number) => {
      const db = getDB();
      const u = db.users[user];
      if(u) {
          if(!u.completedChapters) u.completedChapters = [];
          if(!u.completedChapters.includes(chId)) {
              u.completedChapters.push(chId);
              u.balance += reward;
              saveDB(db);
          }
      }
  }
};
