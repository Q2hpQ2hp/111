import React, { useState, useEffect, useMemo } from 'react';
import { User, CardData, ViewState, Pack, Rarity, Task, Theme, StoryChapter, Language, Merchant } from './types';
import { StorageService } from './services/storage';
import { PACKS, TASKS, STORY_CHAPTERS, ACHIEVEMENTS, MERCHANTS } from './data/cards';
import { TRANSLATIONS, LANGUAGES } from './data/locales';
import { Card } from './components/Card';
import { 
  Coins, ShoppingBag, LogOut, Grid, PackageOpen, X, Briefcase, 
  CheckCircle, Settings, Edit2, PieChart, Trophy, ShieldAlert, 
  BookOpen, Trash2, PlusCircle, Zap, Save, Store, Users, UserPlus, Play, Lock, User as UserIcon, Heart
} from 'lucide-react';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  
  // App State
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Data
  const [allCards, setAllCards] = useState<CardData[]>([]);
  const [packCards, setPackCards] = useState<CardData[]>([]);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  
  // Modals & Overlays
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [readingChapter, setReadingChapter] = useState<StoryChapter | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [inspectCard, setInspectCard] = useState<CardData | null>(null);
  const [adminInspectUser, setAdminInspectUser] = useState<User | null>(null);
  const [adminTab, setAdminTab] = useState<'users' | 'content'>('users');
  const [isEditCardOpen, setIsEditCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);

  // Forms
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [inputs, setInputs] = useState({ user: '', pass: '', email: '', friend: '', cardName: '' });
  const [filters, setFilters] = useState({ search: '', rarity: 'all', source: 'all' });
  const [avatarInput, setAvatarInput] = useState('');
  const [bgInput, setBgInput] = useState('');

  const t = (key: string) => TRANSLATIONS[language][key] || key;
  const updateInput = (k: string, v: string) => setInputs(p => ({...p, [k]: v}));

  useEffect(() => {
    const saved = localStorage.getItem('cardverse_current_user');
    if (saved) {
      const u = StorageService.getUser(saved);
      if (u) { setCurrentUser(u); setCurrentView('collection'); }
    }
    setAllCards(StorageService.getCards());
  }, []);

  const refreshUser = () => currentUser && setCurrentUser(StorageService.getUser(currentUser.username));
  const refreshCards = () => setAllCards(StorageService.getCards());

  // --- Logic Handlers ---

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const u = authMode === 'register' 
        ? StorageService.register(inputs.user, inputs.pass, inputs.email)
        : StorageService.login(inputs.user, inputs.pass);
      
      if (u) {
        setCurrentUser(u);
        setCurrentView('collection');
        localStorage.setItem('cardverse_current_user', u.username);
        setInputs({ ...inputs, user: '', pass: '', email: '' });
      } else alert('Invalid credentials');
    } catch (err: any) { alert(err.message); }
  };

  const buyPack = (pack: Pack) => {
    if (!currentUser || currentUser.balance < pack.cost) return alert("Insufficient funds");
    StorageService.updateBalance(currentUser.username, -pack.cost);
    
    const newCards: CardData[] = [];
    for (let i = 0; i < pack.cardCount; i++) {
      let r = Rarity.COMMON;
      const rand = Math.random();
      let sum = 0;
      for (const [rarity, prob] of Object.entries(pack.probabilities)) {
        sum += prob;
        if (rand <= sum) { r = rarity as Rarity; break; }
      }
      const pool = allCards.filter(c => c.rarity === r);
      if(pool.length) newCards.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    
    setPackCards(newCards);
    setIsOpeningPack(true);
    setRevealedCards([]);
    StorageService.addCards(currentUser.username, newCards.map(c => c.id));
    refreshUser();
  };

  const completeTask = (task: Task) => {
    if(!currentUser) return;
    setTimeout(() => {
      StorageService.updateBalance(currentUser.username, task.reward);
      if(task.isTraining) StorageService.updateProfile(currentUser.username, { completedTraining: true });
      refreshUser();
      alert(`Task Completed! +${task.reward} coins`);
    }, 1000);
  };

  const handleStory = () => {
    if (!readingChapter) return;
    if (dialogueIndex < readingChapter.dialogue.length - 1) setDialogueIndex(p => p + 1);
    else {
      StorageService.completeChapter(currentUser!.username, readingChapter.id, readingChapter.reward);
      refreshUser();
      setReadingChapter(null);
      alert(`Chapter Complete! +${readingChapter.reward}`);
    }
  };

  // --- Derived State ---

  const profileStats = useMemo(() => {
    if (!currentUser) return null;
    const unique = new Set(currentUser.collection).size;
    const total = allCards.length || 1;
    return { 
      count: currentUser.collection.length, 
      unique, 
      pct: Math.round((unique/total)*100),
      legendaries: currentUser.collection.filter(id => allCards.find(c => c.id === id)?.rarity === Rarity.LEGENDARY).length
    };
  }, [currentUser, allCards]);

  const filteredCards = useMemo(() => {
    if(!currentUser) return [];
    let c = currentUser.collection.map(id => allCards.find(card => card.id === id)).filter(Boolean) as CardData[];
    if(filters.rarity !== 'all') c = c.filter(x => x.rarity === filters.rarity);
    if(filters.source !== 'all') c = c.filter(x => x.animeSource === filters.source);
    if(filters.search) c = c.filter(x => x.name.toLowerCase().includes(filters.search.toLowerCase()));
    return c;
  }, [currentUser, allCards, filters]);

  // --- Views ---

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" data-theme={theme}>
      {/* Background Decor */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl animate-bounce-slow"></div>
      
      <div className="max-w-md w-full glass-panel p-8 relative z-10">
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-accent rounded-full mb-4 shadow-lg text-white"><Heart size={32} fill="currentColor"/></div>
            <h1 className="text-4xl font-bold text-text-main mb-2">{t('appTitle')}</h1>
            <p className="text-muted">{t('subtitle')}</p>
        </div>
        
        <div className="flex mb-6 bg-white/50 p-1 rounded-theme">
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setAuthMode(m as any)} className={`flex-1 py-2 rounded-theme text-sm font-bold transition-all ${authMode === m ? 'bg-white shadow text-accent' : 'text-muted hover:text-text-main'}`}>{t(m)}</button>
          ))}
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input className="w-full bg-white/60 border border-white p-3 rounded-theme focus:ring-2 focus:ring-accent outline-none transition-all placeholder-muted/50" placeholder="Username" value={inputs.user} onChange={e => updateInput('user', e.target.value)} required />
          {authMode === 'register' && <input className="w-full bg-white/60 border border-white p-3 rounded-theme focus:ring-2 focus:ring-accent outline-none transition-all placeholder-muted/50" type="email" placeholder="Email Address" value={inputs.email} onChange={e => updateInput('email', e.target.value)} required />}
          <input className="w-full bg-white/60 border border-white p-3 rounded-theme focus:ring-2 focus:ring-accent outline-none transition-all placeholder-muted/50" type="password" placeholder="Password" value={inputs.pass} onChange={e => updateInput('pass', e.target.value)} required />
          <button className="w-full bg-accent text-white font-bold py-3 rounded-theme hover:bg-accent/90 transition-all shadow-lg mt-2">Let's Go!</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 transition-colors duration-500 font-sans" data-theme={theme}>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-nav backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent">
             <Heart size={28} fill="currentColor"/>
             <span className="text-2xl font-bold text-text-main hidden md:block tracking-tight">{t('appTitle')}</span>
          </div>
          
          <div className="hidden md:flex gap-2 bg-white/40 p-1 rounded-theme">
            {[
              { id: 'collection', icon: Grid, label: t('arsenal') },
              { id: 'market', icon: Store, label: 'Shop' },
              { id: 'story', icon: BookOpen, label: t('story') },
              { id: 'profile', icon: UserIcon, label: t('profile') }
            ].map(item => (
              <button key={item.id} onClick={() => setCurrentView(item.id as ViewState)} className={`flex items-center gap-2 px-4 py-2 rounded-theme transition-all font-bold text-sm ${currentView === item.id ? 'bg-white text-accent shadow-sm' : 'text-muted hover:bg-white/50'}`}>
                <item.icon size={18}/> <span>{item.label}</span>
              </button>
            ))}
            {currentUser.isAdmin && (
              <button onClick={() => setCurrentView('admin')} className={`flex items-center gap-2 px-4 py-2 rounded-theme transition-all font-bold text-sm text-red-400 hover:bg-red-50`}>
                <ShieldAlert size={18}/> <span>{t('admin')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full shadow-sm">
              <Coins className="w-5 h-5 text-yellow-400" fill="currentColor" />
              <span className="font-bold text-gray-700">{currentUser.balance}</span>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-black/5 rounded-full text-muted"><Settings size={22}/></button>
            <button onClick={() => { setCurrentUser(null); setCurrentView('auth'); }} className="p-2 hover:bg-red-50 text-muted hover:text-red-400 rounded-full"><LogOut size={22}/></button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-500">
        
        {currentView === 'collection' && (
          <div className="space-y-8">
            <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">My Collection</h2>
                <div className="flex gap-3">
                  <input placeholder="Search cards..." className="bg-white/50 border border-white/50 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent w-64" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                  <select className="bg-white/50 border border-white/50 rounded-full px-4 py-2 text-sm outline-none cursor-pointer" onChange={e => setFilters({...filters, rarity: e.target.value as any})}>
                    <option value="all">All Rarities</option>
                    {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => setCurrentView('market')} className="bg-accent text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-accent/90 transition-all flex items-center gap-2">
                 <Store size={20}/> Visit Shop
              </button>
            </div>
            
            {filteredCards.length === 0 ? (
              <div className="text-center py-24 glass-panel text-muted rounded-theme">
                <div className="text-4xl mb-4">📭</div>
                <p>No cards found yet!</p>
                <button onClick={() => setCurrentView('market')} className="text-accent font-bold mt-2 hover:underline">Go get some packs!</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredCards.map((c, i) => <Card key={`${c.id}-${i}`} card={c} onClick={() => setInspectCard(c)} />)}
              </div>
            )}
          </div>
        )}

        {currentView === 'market' && (
          <div className="space-y-8">
            {!selectedMerchant ? (
              <div className="grid md:grid-cols-3 gap-6">
                {MERCHANTS.map(m => (
                  <div key={m.id} onClick={() => setSelectedMerchant(m)} className="group cursor-pointer glass-panel overflow-hidden relative h-72 hover:shadow-xl transition-all">
                    <img src={m.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                    <div className={`absolute inset-0 bg-gradient-to-t ${m.themeColor} to-transparent opacity-90`}></div>
                    <div className="absolute bottom-0 p-6 w-full text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">{m.name}</h3>
                      <p className="text-gray-600 text-sm">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-slide-up">
                <button onClick={() => setSelectedMerchant(null)} className="mb-6 flex items-center gap-2 text-muted hover:text-accent font-bold"><X size={18}/> Back to Town</button>
                <div className="flex items-center gap-8 mb-10 p-8 glass-panel bg-white/50">
                   <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden"><img src={selectedMerchant.imageUrl} className="w-full h-full object-cover"/></div>
                   <div><h2 className="text-4xl font-bold text-gray-800">{selectedMerchant.name}</h2><p className="text-muted text-lg">{selectedMerchant.description}</p></div>
                </div>
                
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700"><PackageOpen className="text-accent"/> Supply Packs</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                   {PACKS.filter(p => p.merchantId === selectedMerchant.id).map(p => (
                     <div key={p.id} className={`glass-panel p-6 relative group hover:-translate-y-1 transition-transform border-t-8 ${p.color.split(' ')[0]}`}>
                        <h4 className="text-xl font-bold mb-2">{p.name}</h4>
                        <div className="flex justify-between items-center mt-6">
                           <span className="text-2xl font-bold text-gray-700">{p.cost} <span className="text-sm text-yellow-500">🪙</span></span>
                           <button onClick={() => buyPack(p)} className="px-6 py-2 bg-accent text-white rounded-full font-bold shadow hover:bg-accent/90">Buy</button>
                        </div>
                     </div>
                   ))}
                </div>

                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700"><Briefcase className="text-accent"/> Quests</h3>
                <div className="grid md:grid-cols-2 gap-4">
                   {TASKS.filter(t => t.merchantId === selectedMerchant.id).map(t => (
                     <div key={t.id} className="glass-panel p-5 flex justify-between items-center hover:bg-white/60 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-bold text-gray-800">{t.title}</h4>
                             {t.isTraining && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Training</span>}
                          </div>
                          <p className="text-sm text-muted">{t.description}</p>
                        </div>
                        <button onClick={() => completeTask(t)} className="px-5 py-2 bg-white border border-accent text-accent hover:bg-accent hover:text-white rounded-full font-bold text-sm transition-colors">Accept ({t.reward})</button>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'story' && (
           <div className="grid gap-8">
              <h2 className="text-4xl font-bold mb-2 text-gray-800">{t('story')} Mode</h2>
              {STORY_CHAPTERS.map((ch, i) => {
                 const locked = i > 0 && !(currentUser?.completedChapters.includes(STORY_CHAPTERS[i-1].id));
                 const done = currentUser?.completedChapters.includes(ch.id);
                 return (
                   <div key={ch.id} className={`glass-panel p-0 flex flex-col md:flex-row overflow-hidden ${locked ? 'opacity-60 grayscale' : ''}`}>
                      <div className="w-full md:w-64 h-48 relative">
                         <img src={ch.imageUrl} className="w-full h-full object-cover"/>
                         <div className="absolute top-2 left-2 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">Chapter {i+1}</div>
                      </div>
                      <div className="flex-1 p-8 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-2">
                               <h3 className="text-2xl font-bold text-gray-800">{ch.title}</h3>
                               {done && <CheckCircle className="text-green-500" fill="currentColor" color="white"/>}
                               {locked && <Lock className="text-gray-400"/>}
                            </div>
                            <p className="text-muted">{ch.description}</p>
                         </div>
                         {!locked && !done && <button onClick={() => {setReadingChapter(ch); setDialogueIndex(0);}} className="self-start mt-6 bg-accent text-white px-8 py-2 rounded-full font-bold hover:shadow-lg transition-all">Start Adventure</button>}
                      </div>
                   </div>
                 )
              })}
           </div>
        )}

        {currentView === 'profile' && profileStats && (
          <div className="space-y-8">
             <div className="h-72 glass-panel p-0 relative overflow-hidden group">
                <img src={currentUser.backgroundUrl} className="w-full h-full object-cover opacity-80"/>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6 w-full">
                   <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                      <img src={currentUser.avatarUrl} className="w-full h-full object-cover"/>
                   </div>
                   <div className="mb-2 flex-1">
                      <h2 className="text-4xl font-bold text-gray-800">{currentUser.username}</h2>
                      <div className="flex gap-3 mt-2">
                         <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-bold">Level {currentUser.level}</span>
                         {currentUser.isAdmin && <span className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs font-bold">Admin</span>}
                      </div>
                   </div>
                   <button onClick={() => { setAvatarInput(currentUser.avatarUrl); setBgInput(currentUser.backgroundUrl); setIsEditProfileOpen(true); }} className="bg-white p-3 rounded-full shadow hover:text-accent transition-colors"><Edit2 size={20}/></button>
                </div>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                   <div className="glass-panel p-8">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><PieChart size={20} className="text-accent"/> Stats</h3>
                      <div className="grid grid-cols-4 gap-4 text-center">
                         <div className="bg-white/50 p-4 rounded-theme border border-white"><div className="text-muted text-xs uppercase font-bold mb-1">Cards</div><div className="text-2xl font-bold text-gray-800">{profileStats.count}</div></div>
                         <div className="bg-white/50 p-4 rounded-theme border border-white"><div className="text-muted text-xs uppercase font-bold mb-1">Complete</div><div className="text-2xl font-bold text-accent">{profileStats.pct}%</div></div>
                         <div className="bg-white/50 p-4 rounded-theme border border-white"><div className="text-muted text-xs uppercase font-bold mb-1">Legends</div><div className="text-2xl font-bold text-yellow-500">{profileStats.legendaries}</div></div>
                         <div className="bg-white/50 p-4 rounded-theme border border-white"><div className="text-muted text-xs uppercase font-bold mb-1">Chapters</div><div className="text-2xl font-bold text-green-500">{currentUser.completedChapters.length}</div></div>
                      </div>
                   </div>
                   
                   <div className="glass-panel p-8">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users size={20} className="text-accent"/> Friends</h3>
                      <div className="flex gap-4 mb-6">
                         <input className="flex-1 bg-white/50 border border-white rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" placeholder="Enter friend's username" value={inputs.friend} onChange={e => updateInput('friend', e.target.value)} />
                         <button onClick={() => { if(inputs.friend){ StorageService.addFriend(currentUser.username, inputs.friend); refreshUser(); updateInput('friend', ''); } }} className="bg-accent text-white px-6 py-2 rounded-full font-bold shadow hover:bg-accent/90">Add</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         {currentUser.friends.map(f => (
                            <div key={f} className="bg-white border border-white p-3 rounded-xl flex justify-between items-center shadow-sm">
                               <span className="font-bold text-gray-700">{f}</span>
                               <button onClick={() => { StorageService.removeFriend(currentUser.username, f); refreshUser(); }} className="text-gray-400 hover:text-red-400"><X size={16}/></button>
                            </div>
                         ))}
                         {currentUser.friends.length === 0 && <span className="text-muted text-sm italic">No friends yet!</span>}
                      </div>
                   </div>
                </div>
                
                <div className="glass-panel p-8 h-fit">
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Trophy size={20} className="text-accent"/> Medals</h3>
                   <div className="space-y-4">
                      {ACHIEVEMENTS.map(a => {
                         const unlocked = currentUser.achievements.includes(a.id);
                         return (
                            <div key={a.id} className={`flex items-center gap-4 p-3 rounded-xl border ${unlocked ? 'border-accent bg-accent/10' : 'border-gray-200 opacity-50'}`}>
                               <div className="text-2xl">{a.icon}</div>
                               <div><div className="font-bold text-gray-800 text-sm">{a.title}</div><div className="text-xs text-muted">{a.description}</div></div>
                            </div>
                         )
                      })}
                   </div>
                </div>
             </div>
          </div>
        )}

        {currentView === 'admin' && currentUser.isAdmin && (
           <div className="space-y-8 animate-in fade-in">
              <div className="flex gap-4 border-b border-gray-200 pb-4">
                 <h2 className="text-3xl font-bold text-gray-800">Admin Console</h2>
                 <button onClick={() => setAdminTab('users')} className={`px-4 py-1 rounded-full font-bold text-sm ${adminTab === 'users' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>Users</button>
                 <button onClick={() => setAdminTab('content')} className={`px-4 py-1 rounded-full font-bold text-sm ${adminTab === 'content' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>Content</button>
              </div>

              {adminTab === 'users' && (
                 <div className="glass-panel p-0 overflow-hidden">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider"><tr><th className="p-4">User</th><th className="p-4">Level</th><th className="p-4">Coins</th><th className="p-4">Action</th></tr></thead>
                       <tbody>
                          {StorageService.getAllUsers().map(u => (
                             <tr key={u.username} onClick={() => setAdminInspectUser(u)} className="border-b border-gray-100 hover:bg-white cursor-pointer">
                                <td className="p-4 font-bold text-gray-800">{u.username}</td>
                                <td className="p-4">{u.level}</td>
                                <td className="p-4">{u.balance}</td>
                                <td className="p-4" onClick={e => e.stopPropagation()}>
                                   {u.username !== 'admin' && <button onClick={() => { if(confirm('Delete?')) { StorageService.deleteUser(u.username); setAdminInspectUser(null); }}} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>}
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              )}

              {adminTab === 'content' && (
                  <div className="space-y-6">
                     <div className="glass-panel p-6 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-bold uppercase text-muted block mb-2">New Card Name</label>
                            <input className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" value={inputs.cardName} onChange={e => updateInput('cardName', e.target.value)} />
                        </div>
                        <button onClick={() => { 
                             if(!inputs.cardName) return;
                             const nc: CardData = { id: `c_${Date.now()}`, name: inputs.cardName, description: 'Custom Card', rarity: Rarity.COMMON, imageUrl: `https://image.pollinations.ai/prompt/cute%20chibi%20${inputs.cardName}?nologo=true` };
                             StorageService.createCard(nc); 
                             refreshCards(); 
                             setEditingCard(nc); 
                             setIsEditCardOpen(true); 
                             updateInput('cardName', '');
                        }} className="bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-green-600">Create Card</button>
                     </div>
                     <div className="grid grid-cols-6 gap-4">
                        {allCards.map(c => <div key={c.id} onClick={() => {setEditingCard(c); setIsEditCardOpen(true);}} className="cursor-pointer hover:scale-105 transition-transform"><Card card={c} size="sm"/></div>)}
                     </div>
                  </div>
              )}
           </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal close={() => setIsSettingsOpen(false)} setLang={setLanguage} setTheme={setTheme} curTheme={theme} curLang={language} />}

      {/* Profile Edit */}
      {isEditProfileOpen && (
         <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-theme shadow-2xl max-w-md w-full p-8">
               <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h3>
               <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Avatar URL</label>
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm" value={avatarInput} onChange={e => setAvatarInput(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Background URL</label>
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm" value={bgInput} onChange={e => setBgInput(e.target.value)} />
                  </div>
                  <div className="flex gap-4 mt-8">
                     <button onClick={() => { StorageService.updateProfile(currentUser.username, { avatarUrl: avatarInput, backgroundUrl: bgInput }); refreshUser(); setIsEditProfileOpen(false); }} className="flex-1 bg-accent text-white font-bold py-3 rounded-lg shadow-lg">Save Changes</button>
                     <button onClick={() => setIsEditProfileOpen(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50">Cancel</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Pack Opening */}
      {isOpeningPack && (
         <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <h2 className="text-4xl font-bold text-accent mb-12 animate-bounce">Opening Pack...</h2>
            <div className="flex flex-wrap justify-center gap-8">
               {packCards.map((c, i) => (
                  <div key={i} className="animate-float" style={{animationDelay: `${i*0.2}s`}}>
                     <Card card={c} isRevealed={revealedCards.includes(i)} onClick={() => { if(!revealedCards.includes(i)) setRevealedCards(p => [...p, i]) }} />
                  </div>
               ))}
            </div>
            <button onClick={() => setIsOpeningPack(false)} className="mt-16 bg-white border-2 border-accent text-accent px-8 py-3 rounded-full font-bold shadow-lg hover:bg-accent hover:text-white transition-colors">Done</button>
         </div>
      )}

      {/* Story Mode Overlay */}
      {readingChapter && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
             <div className="relative w-full max-w-5xl h-[70vh] bg-white rounded-theme shadow-2xl flex overflow-hidden">
                 {/* Visual Side */}
                 <div className="w-2/3 relative bg-gray-100">
                     <img src={readingChapter.imageUrl} className="absolute inset-0 w-full h-full object-cover"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                     {readingChapter.dialogue[dialogueIndex].avatarUrl && (
                        <div className="absolute bottom-0 left-10 h-3/4 w-1/2">
                           <img src={readingChapter.dialogue[dialogueIndex].avatarUrl} className="h-full w-full object-contain drop-shadow-2xl"/>
                        </div>
                     )}
                 </div>
                 
                 {/* Text Side */}
                 <div className="w-1/3 p-10 flex flex-col justify-center bg-white">
                     <div className="mb-auto text-xs font-bold text-accent uppercase tracking-widest">Chapter {readingChapter.id}</div>
                     
                     <div>
                         <h3 className="text-2xl font-bold text-gray-800 mb-4">{readingChapter.dialogue[dialogueIndex].speaker}</h3>
                         <p className="text-lg text-gray-600 leading-relaxed font-medium">"{readingChapter.dialogue[dialogueIndex].text}"</p>
                     </div>

                     <div className="mt-auto pt-10">
                         <button onClick={handleStory} className="w-full bg-accent text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                             {dialogueIndex < readingChapter.dialogue.length - 1 ? 'Next' : 'Complete Chapter'}
                         </button>
                     </div>
                 </div>
             </div>
         </div>
      )}

      {/* Card Inspector */}
      {inspectCard && (
         <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInspectCard(null)}>
             <div className="bg-white rounded-theme max-w-4xl w-full flex flex-col md:flex-row shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                 <div className="md:w-1/2 h-[500px] bg-gray-100 relative">
                     <img src={inspectCard.imageUrl} className="w-full h-full object-cover"/>
                 </div>
                 <div className="p-12 flex-1 flex flex-col bg-white">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <div className="text-accent text-xs font-bold uppercase tracking-widest mb-1">{inspectCard.animeSource}</div>
                          <h2 className="text-4xl font-bold text-gray-800">{inspectCard.name}</h2>
                       </div>
                       <button onClick={() => setInspectCard(null)} className="text-gray-400 hover:text-gray-800 transition-colors"><X size={32}/></button>
                    </div>
                    
                    <div className="mb-8 flex gap-3">
                       <span className="bg-gray-100 text-gray-600 px-4 py-1 rounded-full text-xs font-bold uppercase">{inspectCard.rarity}</span>
                       <span className="bg-accent/10 text-accent px-4 py-1 rounded-full text-xs font-bold uppercase">Power: {inspectCard.powerLevel}</span>
                    </div>

                    <p className="text-xl text-gray-500 leading-relaxed font-light italic mb-auto">"{inspectCard.description}"</p>
                 </div>
             </div>
         </div>
      )}

      {/* Admin User Inspector */}
      {adminInspectUser && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-theme shadow-2xl max-w-md w-full p-8">
                  <div className="flex justify-between mb-8 pb-4 border-b border-gray-100"><h3 className="text-2xl font-bold text-gray-800">User Details</h3><button onClick={() => setAdminInspectUser(null)}><X/></button></div>
                  <div className="flex gap-6 items-center mb-8">
                      <div className="w-20 h-20 rounded-full bg-gray-100 p-1 border border-gray-200"><img src={adminInspectUser.avatarUrl} className="w-full h-full object-cover rounded-full"/></div>
                      <div>
                          <div className="text-2xl font-bold text-gray-800">{adminInspectUser.username}</div>
                          <div className="text-sm text-muted">{adminInspectUser.email}</div>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center"><div className="text-xs font-bold uppercase text-muted mb-1">Credits</div><div className="text-2xl font-bold text-accent">{adminInspectUser.balance}</div></div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center"><div className="text-xs font-bold uppercase text-muted mb-1">Items</div><div className="text-2xl font-bold text-gray-800">{adminInspectUser.collection.length}</div></div>
                  </div>
              </div>
          </div>
      )}
      
      {/* Admin Card Editor */}
      {isEditCardOpen && editingCard && (
         <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-theme p-8 max-w-lg w-full shadow-2xl">
               <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Card</h3>
               <div className="space-y-4">
                  <input className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm" value={editingCard.name} onChange={e => setEditingCard({...editingCard, name: e.target.value})} placeholder="Card Name" />
                  <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm h-32" value={editingCard.description} onChange={e => setEditingCard({...editingCard, description: e.target.value})} placeholder="Description" />
                  <div className="flex gap-4">
                     <select className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm flex-1" value={editingCard.rarity} onChange={e => setEditingCard({...editingCard, rarity: e.target.value as any})}>
                        {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
                     </select>
                     <input className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm flex-1" type="number" value={editingCard.powerLevel} onChange={e => setEditingCard({...editingCard, powerLevel: Number(e.target.value)})} placeholder="Power" />
                  </div>
                  <div className="flex gap-4 mt-8">
                     <button onClick={() => { StorageService.updateCard(editingCard.id, editingCard); refreshCards(); setIsEditCardOpen(false); }} className="flex-1 bg-accent text-white font-bold py-3 rounded-lg shadow">Save</button>
                     <button onClick={() => setIsEditCardOpen(false)} className="flex-1 border border-gray-200 font-bold py-3 rounded-lg hover:bg-gray-50 text-gray-600">Cancel</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// Component: Settings Modal
const SettingsModal = ({close, setLang, setTheme, curTheme, curLang}: any) => (
   <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
       <div className="bg-white rounded-theme shadow-2xl max-w-sm w-full p-8">
           <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-bold text-gray-800">Settings</h3><button onClick={close} className="text-gray-400 hover:text-gray-800"><X/></button></div>
           
           <div className="mb-8">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-4">Language</label>
              <div className="grid grid-cols-4 gap-2">
                 {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)} className={`text-2xl p-2 rounded-lg transition-all ${curLang === l.code ? 'bg-accent/10 border-2 border-accent' : 'border-2 border-transparent hover:bg-gray-50'}`}>{l.flag}</button>
                 ))}
              </div>
           </div>
           
           <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-4">Theme</label>
              <div className="grid grid-cols-2 gap-3">
                 {['dark', 'light'].map(t => (
                    <button key={t} onClick={() => setTheme(t)} className={`capitalize py-3 font-bold rounded-lg border-2 transition-all ${curTheme === t ? 'bg-accent text-white border-accent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t}</button>
                 ))}
              </div>
           </div>
       </div>
   </div>
);

export default App;
