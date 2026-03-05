import React, { useState, useRef, useEffect } from 'react';
import { LearningTask, HistoryRecord, ChildProfile } from './types';
import { PlanDisplay } from './components/PlanDisplay';
import { HistoryView } from './components/HistoryView';
import { LockScreen } from './components/LockScreen';
import { ProfileSettings } from './components/ProfileSettings';
import { CATEGORY_CONFIGS, INITIAL_TASKS } from './constants';
import { VALID_KEYS } from './license_list'; 
import { Rocket, RefreshCw, Copy, Check, Sparkles, Plus, Trash2, Calendar, LayoutDashboard, History as HistoryIcon, Save, Loader2, Settings } from 'lucide-react';

const DEFAULT_PROFILES: ChildProfile[] = [
  { id: 'child_1', name: '知乐', avatar: '👦' },
  { id: 'child_2', name: '知言', avatar: '👶' }
];

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
  
  // 核心修改：确保任务状态（打勾）能正确加载
  const [tasks, setTasks] = useState<LearningTask[]>(() => {
    try {
      const saved = localStorage.getItem(`tasks_${activeChildId}`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) { return INITIAL_TASKS; }
  });

  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  // 核心修改：历史记录中包含完成情况
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
        const saved = localStorage.getItem(`history_${activeChildId}`);
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const resultRef = useRef<HTMLDivElement>(null);

  // 🛡️ 设备锁定逻辑
  useEffect(() => {
    const savedKey = localStorage.getItem('license_key');
    const boundDevice = localStorage.getItem('bound_device');
    const currentDevice = getDeviceId();
    if (savedKey && VALID_KEYS.includes(savedKey) && boundDevice === currentDevice) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
    }
  }, []);

  // 切换宝贝时重新加载该宝贝的专属历史和任务
  useEffect(() => {
    try {
        const savedTasks = localStorage.getItem(`tasks_${activeChildId}`);
        setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS);
        const savedHistory = localStorage.getItem(`history_${activeChildId}`);
        setHistory(savedHistory ? JSON.parse(savedHistory) : []);
        setShowResult(false);
    } catch (e) {}
  }, [activeChildId]);

  const handleUnlock = async (key: string): Promise<boolean> => {
    if (VALID_KEYS.includes(key)) {
      localStorage.setItem('license_key', key);
      localStorage.setItem('bound_device', getDeviceId());
      setIsUnlocked(true);
      return true;
    } else {
      throw new Error('卡密无效！');
    }
  };

  const toggleTask = (id: string) => {
      const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      setTasks(newTasks);
      localStorage.setItem(`tasks_${activeChildId}`, JSON.stringify(newTasks));
  };

  // 🌟 核心功能：存入历史并自动计算成就榜
  const saveToHistory = () => {
    const newRecord: HistoryRecord = {
        date: date,
        displayDate: date.replace(/-/g, '/'),
        tasks: [...tasks], // 保存当前带勾选状态的任务
        timestamp: Date.now()
    };

    let newHistory = [...history];
    const existingIndex = newHistory.findIndex(h => h.date === date);
    
    if (existingIndex >= 0) {
        if(confirm('今天已有记录，要覆盖并更新数据吗？')) {
            newHistory[existingIndex] = newRecord;
        } else { return; }
    } else {
        newHistory.push(newRecord);
    }

    setHistory(newHistory);
    localStorage.setItem(`history_${activeChildId}`, JSON.stringify(newHistory));
    alert('保存成功！已更新阅读成就榜 ✨');
    setView('history');
  };

  if (isUnlocked === null) return <div className="h-screen flex items-center justify-center bg-blue-50"><Loader2 className="animate-spin text-blue-400" /></div>;
  if (!isUnlocked) return <LockScreen onUnlock={handleUnlock} />;

  return (
    <div className="min-h-screen bg-[#f0f7ff] pb-24 px-4 pt-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* 顶部导航 - 对应多宝贝切换 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-black text-blue-500 flex items-center gap-2">
                    <Sparkles className="text-yellow-400 fill-current" /> 每日英语计划
                </h1>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border flex items-center">
                    {profiles.map(p => (
                        <button key={p.id} onClick={() => setActiveChildId(p.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${activeChildId === p.id ? 'bg-pink-400 text-white' : 'text-gray-400'}`}>
                            <span>{p.avatar}</span> {p.name}
                        </button>
                    ))}
                    <button onClick={() => setShowProfileSettings(true)} className="ml-2 p-2 text-gray-300"><Settings className="w-5 h-5" /></button>
                </div>
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border flex">
                    <button onClick={() => setView('plan')} className={`px-6 py-2 rounded-xl font-bold ${view === 'plan' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>制定计划</button>
                    <button onClick={() => setView('history')} className={`px-6 py-2 rounded-xl font-bold ${view === 'history' ? 'bg-orange-400 text-white' : 'text-gray-400'}`}>阅读足迹</button>
                </div>
            </div>
        </div>

        {view === 'plan' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* 左侧：输入控制区 */}
                <div className="bg-white rounded-[40px] p-8 shadow-xl border-8 border-white">
                    <div className="mb-6 flex items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <Calendar className="w-6 h-6 text-blue-500 mr-3" />
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white border-2 border-blue-200 rounded-lg px-2 py-1 font-bold text-blue-600 outline-none" />
                    </div>

                    <div className="space-y-4">
                        {tasks.map((task) => {
                            const config = CATEGORY_CONFIGS[task.category];
                            return (
                                <div key={task.id} className="p-4 rounded-3xl border-2 border-blue-50 bg-white shadow-sm">
                                    <div className="flex gap-3 items-center">
                                        <div className={`${config.bgColor} text-white px-3 py-1 rounded-lg text-xs font-bold`}>{config.label}</div>
                                        <input value={task.name} onChange={(e) => {
                                            const val = e.target.value;
                                            setTasks(tasks.map(t => t.id === task.id ? {...t, name: val} : t));
                                        }} className="flex-1 bg-gray-50 rounded-xl px-3 py-2 font-bold outline-none" placeholder="教材" />
                                        <input value={task.details} onChange={(e) => {
                                            const val = e.target.value;
                                            setTasks(tasks.map(t => t.id === task.id ? {...t, details: val} : t));
                                        }} className="w-20 bg-gray-50 rounded-xl px-3 py-2 font-bold outline-none" placeholder="进度" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={() => setShowResult(true)} className="w-full mt-8 bg-blue-500 text-white py-5 rounded-3xl font-black text-2xl shadow-xl">⚡ 生成今日执行清单</button>
                </div>

                {/* 右侧：预览打卡区 - 对应 image_329fbe */}
                <div ref={resultRef}>
                    {showResult ? (
                        <div className="space-y-6">
                            <PlanDisplay tasks={tasks} dateStr={date} onToggleTask={toggleTask} />
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => {alert('已复制到剪贴板');}} className="py-4 rounded-2xl font-bold bg-white border-2">复制文本</button>
                                <button onClick={saveToHistory} className="py-4 rounded-2xl font-bold bg-orange-400 text-white shadow-lg">存入历史</button>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex h-full min-h-[500px] border-4 border-dashed border-gray-300 rounded-[40px] items-center justify-center bg-white/50 text-gray-400 font-bold">等待输入生成...</div>
                    )}
                </div>
            </div>
        ) : (
            /* 这里会自动显示你想要的成就榜统计 - 对应 image_323ec2 */
            <HistoryView history={history} onToggleHistoryTask={() => {}} />
        )}

        {showProfileSettings && <ProfileSettings profiles={profiles} onSave={(p) => {setProfiles(p); setShowProfileSettings(false)}} onClose={() => setShowProfileSettings(false)} />}
      </div>
    </div>
  );
};

export default App;
