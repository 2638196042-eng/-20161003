import React, { useState, useRef, useEffect } from 'react';
import { LearningTask, HistoryRecord, ChildProfile } from './types';
import { PlanDisplay } from './components/PlanDisplay';
import { HistoryView } from './components/HistoryView';
import { LockScreen } from './components/LockScreen';
import { ProfileSettings } from './components/ProfileSettings';
import { CATEGORY_CONFIGS, INITIAL_TASKS } from './constants';
import { VALID_KEYS } from './license_list'; // 🔑 这里的卡密会从你建的文件里读
import { Rocket, RefreshCw, Copy, Check, Sparkles, Plus, Trash2, Calendar, LayoutDashboard, History as HistoryIcon, Save, Loader2, Settings } from 'lucide-react';

const DEFAULT_PROFILES: ChildProfile[] = [
  { id: 'child_1', name: '知乐', avatar: '👦' },
  { id: 'child_2', name: '知言', avatar: '👶' }
];

// 📱 核心逻辑：获取手机唯一指纹实现“一机一码”
const getDeviceId = () => {
  let id = localStorage.getItem('device_fingerprint');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('device_fingerprint', id);
  }
  return id;
};

const App: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [view, setView] = useState<'plan' | 'history'>('plan');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => {
    try {
      const saved = localStorage.getItem('profiles');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
    } catch (e) { return DEFAULT_PROFILES; }
  });
  const [activeChildId, setActiveChildId] = useState<string>(profiles[0].id);
  const [date, setDate] = useState<string>(todayStr);
  const [tasks, setTasks] = useState<LearningTask[]>(() => {
    try {
      const saved = localStorage.getItem(`tasks_${profiles[0].id}`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) { return INITIAL_TASKS; }
  });
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
        const saved = localStorage.getItem(`history_${profiles[0].id}`);
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const resultRef = useRef<HTMLDivElement>(null);

  // 🛡️ 整合锁定逻辑：检查是否绑定了当前手机
  useEffect(() => {
    const savedKey = localStorage.getItem('license_key');
    const boundDevice = localStorage.getItem('bound_device');
    const currentDevice = getDeviceId();

    if (savedKey && VALID_KEYS.includes(savedKey) && boundDevice === currentDevice) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
      if (boundDevice && boundDevice !== currentDevice) {
          localStorage.removeItem('license_key');
          localStorage.removeItem('bound_device');
      }
    }
  }, []);

  const handleUnlock = async (key: string): Promise<boolean> => {
    if (VALID_KEYS.includes(key)) {
      localStorage.setItem('license_key', key);
      localStorage.setItem('bound_device', getDeviceId()); // 🔒 激活瞬间锁死当前手机
      setIsUnlocked(true);
      return true;
    } else {
      throw new Error('卡密无效或已被占用！');
    }
  };

  // --- 精致 UI 逻辑部分 ---
  const handleTaskChange = (id: string, field: keyof LearningTask, value: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleTask = (id: string) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  if (isUnlocked === null) return <div className="h-screen flex items-center justify-center bg-blue-50"><Loader2 className="animate-spin text-blue-400" /></div>;
  if (!isUnlocked) return <LockScreen onUnlock={handleUnlock} />;

  return (
    <div className="min-h-screen bg-[#f0f7ff] pb-24 px-4 pt-8 font-sans">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* 顶部多宝贝切换栏 - 对应 image_329fbe 的设计 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-black text-blue-500 flex items-center gap-2">
                    <Sparkles className="text-yellow-400 fill-current" /> 每日英语计划
                </h1>
                <p className="text-gray-400 font-medium mt-1">✨ 定制专属清单，记录点滴进步 ✨</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border flex items-center">
                    {profiles.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveChildId(p.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${activeChildId === p.id ? 'bg-pink-400 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <span>{p.avatar}</span> {p.name}
                        </button>
                    ))}
                    <button onClick={() => setShowProfileSettings(true)} className="ml-2 p-2 text-gray-300"><Settings className="w-5 h-5" /></button>
                </div>
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border flex">
                    <button onClick={() => setView('plan')} className={`px-4 py-2 rounded-xl font-bold ${view === 'plan' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>制定计划</button>
                    <button onClick={() => setView('history')} className={`px-4 py-2 rounded-xl font-bold ${view === 'history' ? 'bg-orange-400 text-white' : 'text-gray-400'}`}>阅读足迹</button>
                </div>
            </div>
        </div>

        {view === 'plan' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* 左侧：输入区 */}
                <div className="bg-white rounded-[40px] p-8 shadow-xl border-8 border-white">
                    <div className="mb-6 flex items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <Calendar className="w-6 h-6 text-blue-500 mr-3" />
                        <span className="font-bold text-gray-700">执行日期：</span>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white border-2 border-blue-200 rounded-lg px-2 py-1 font-bold text-blue-600 outline-none ml-2" />
                    </div>

                    <div className="space-y-4">
                        {tasks.map((task) => {
                            const config = CATEGORY_CONFIGS[task.category];
                            return (
                                <div key={task.id} className="p-4 rounded-3xl border-2 border-blue-50 bg-white hover:border-blue-300 transition-all shadow-sm">
                                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                                        <div className={`${config.bgColor} text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap`}>
                                            {config.label}
                                        </div>
                                        <input value={task.name} onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)} className="flex-1 bg-gray-50 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none" placeholder="教材名称" />
                                        <input value={task.details} onChange={(e) => handleTaskChange(task.id, 'details', e.target.value)} className="w-24 bg-gray-50 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none" placeholder="进度" />
                                        <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-gray-300 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={() => setTasks([...tasks, { id: Date.now().toString(), category: 'extensive', name: '', details: '', completed: false }])} className="w-full mt-4 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:text-blue-400">+ 添加更多学习任务</button>
                    <button onClick={() => setShowResult(true)} className="w-full mt-8 bg-blue-500 text-white py-5 rounded-3xl font-black text-2xl shadow-xl active:scale-95 transition-all">⚡ 生成今日执行清单</button>
                </div>

                {/* 右侧：精美清单区 - 对应 image_329fbe 的预览样式 */}
                <div ref={resultRef}>
                    {showResult ? (
                        <div className="space-y-6">
                            <PlanDisplay tasks={tasks} dateStr={date} onToggleTask={toggleTask} />
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => {navigator.clipboard.writeText("清单已生成"); setCopied(true); setTimeout(()=>setCopied(false), 2000)}} className={`py-4 rounded-2xl font-bold shadow-lg ${copied ? 'bg-green-500 text-white' : 'bg-white'}`}>
                                    {copied ? '已复制!' : '复制文本'}
                                </button>
                                <button onClick={() => setView('history')} className="py-4 rounded-2xl font-bold bg-orange-400 text-white shadow-lg">存入历史</button>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex h-full min-h-[500px] border-4 border-dashed border-gray-300 rounded-[40px] items-center justify-center bg-white/50 text-gray-400 font-bold text-xl">
                            等待输入生成...
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <HistoryView history={history} onToggleHistoryTask={() => {}} />
        )}

        {showProfileSettings && <ProfileSettings profiles={profiles} onSave={(p) => {setProfiles(p); setShowProfileSettings(false)}} onClose={() => setShowProfileSettings(false)} />}
      </div>
    </div>
  );
};

export default App;
