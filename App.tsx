import React, { useState, useRef, useEffect } from 'react';
import { LearningTask, HistoryRecord, ChildProfile } from './types';
import { PlanDisplay } from './components/PlanDisplay';
import { HistoryView } from './components/HistoryView';
import { LockScreen } from './components/LockScreen';
import { ProfileSettings } from './components/ProfileSettings';
import { CATEGORY_CONFIGS, INITIAL_TASKS } from './constants';
import { VALID_KEYS } from './license_list'; // 🔑 这里会读取你刚才建的文件
import { Rocket, RefreshCw, Copy, Check, Sparkles, Plus, Trash2, Calendar, LayoutDashboard, History as HistoryIcon, Save, Loader2, Settings } from 'lucide-react';

const DEFAULT_PROFILES: ChildProfile[] = [
  { id: 'child_1', name: '大宝', avatar: '👦' }
];

const App: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [view, setView] = useState<'plan' | 'history'>('plan');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => {
    try {
      const saved = localStorage.getItem('english_plan_profiles');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
    } catch (e) { return DEFAULT_PROFILES; }
  });
  const [activeChildId, setActiveChildId] = useState<string>(profiles[0].id);
  const [date, setDate] = useState<string>(todayStr);
  const [tasks, setTasks] = useState<LearningTask[]>(() => {
    try {
      const saved = localStorage.getItem(`english_plan_tasks_${profiles[0].id}`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) { return INITIAL_TASKS; }
  });
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
        const saved = localStorage.getItem(`english_plan_history_${profiles[0].id}`);
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const resultRef = useRef<HTMLDivElement>(null);

  // 🛡️ 本地验证逻辑：不再去联网找 API
  useEffect(() => {
    const savedKey = localStorage.getItem('license_key');
    if (savedKey && VALID_KEYS.includes(savedKey)) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
    }
  }, []);

  const handleUnlock = async (key: string): Promise<boolean> => {
    // 🔓 直接对比你刚才在 license_list 里写的那些词
    if (VALID_KEYS.includes(key)) {
      localStorage.setItem('license_key', key);
      setIsUnlocked(true);
      return true;
    } else {
      throw new Error('卡密无效，请联系博主获取！');
    }
  };

  const getDisplayDate = (dStr: string) => {
    const d = new Date(dStr);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };

  const handleTaskChange = (id: string, field: keyof LearningTask, value: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addTask = () => {
    const newTask: LearningTask = {
      id: Date.now().toString(),
      category: 'extensive',
      name: '',
      details: '',
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setShowResult(false);
  };

  const removeTask = (id: string) => {
    if (tasks.length <= 1) return;
    setTasks(tasks.filter(t => t.id !== id));
    setShowResult(false);
  };

  const toggleTask = (id: string) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleHistoryTask = (dateKey: string, taskId: string) => {
      const newHistory = history.map(record => {
          if (record.date === dateKey) {
              const updatedTasks = record.tasks.map(t => 
                  t.id === taskId ? { ...t, completed: !t.completed } : t
              );
              return { ...record, tasks: updatedTasks };
          }
          return record;
      });
      setHistory(newHistory);
      localStorage.setItem(`english_plan_history_${activeChildId}`, JSON.stringify(newHistory));
  };

  const handleSaveProfiles = (newProfiles: ChildProfile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem('english_plan_profiles', JSON.stringify(newProfiles));
    if (!newProfiles.find(p => p.id === activeChildId)) {
      setActiveChildId(newProfiles[0].id);
    }
    setShowProfileSettings(false);
  };

  const generatePlan = () => {
    if (tasks.length === 0) {
      alert('请先添加至少一个学习任务！');
      return;
    }
    setShowResult(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const saveToHistory = () => {
    const existingIndex = history.findIndex(h => h.date === date);
    let newHistory = [...history];
    const newRecord: HistoryRecord = {
        date: date,
        displayDate: getDisplayDate(date),
        tasks: tasks,
        timestamp: Date.now()
    };
    if (existingIndex >= 0) {
        if(confirm('今天已经有打卡记录了，要覆盖吗？')) {
             newHistory[existingIndex] = newRecord;
        } else { return; }
    } else { newHistory.push(newRecord); }
    setHistory(newHistory);
    localStorage.setItem(`english_plan_history_${activeChildId}`, JSON.stringify(newHistory));
    setView('history');
  };

  const handleCopy = () => {
    const grouped = {
      core: tasks.filter(t => t.category === 'core'),
      extensive: tasks.filter(t => t.category === 'extensive'),
      audio: tasks.filter(t => t.category === 'audio'),
    };
    let text = `📅 ${getDisplayDate(date)} ${profiles.find(p => p.id === activeChildId)?.name}的英语执行清单\n`;
    if (grouped.core.length > 0) {
      text += `\n✅ 模块一：核心精读\n`;
      grouped.core.forEach(t => {
          const check = t.completed ? '[x]' : '[ ]';
          text += `${check} ${t.name}：${t.details}\n`;
      });
    }
    if (grouped.extensive.length > 0) {
      text += `\n✅ 模块二：泛读拓展\n`;
      grouped.extensive.forEach(t => {
          const check = t.completed ? '[x]' : '[ ]';
          text += `${check} ${t.name}：${t.details}\n`;
      });
    }
    if (grouped.audio.length > 0) {
      text += `\n✅ 模块三：沉浸式输入\n`;
      grouped.audio.forEach(t => {
          const check = t.completed ? '[x]' : '[ ]';
          text += `${check} ${t.name}：${t.details}\n`;
      });
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isUnlocked === null) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!isUnlocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:pt-12 relative bg-blue-50/30">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center md:text-left mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-blue-500 flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="text-yellow-400 fill-current" />
                每日英语计划
                </h1>
                <p className="text-gray-500 font-medium mt-1">✨ 定制专属清单，记录点滴进步 ✨</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex items-center">
                    {profiles.map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => setActiveChildId(profile.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${activeChildId === profile.id ? 'bg-pink-400 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <span>{profile.avatar}</span>
                            {profile.name}
                        </button>
                    ))}
                    <button onClick={() => setShowProfileSettings(true)} className="ml-2 p-2 text-gray-400 hover:text-blue-500"><Settings className="w-5 h-5" /></button>
                </div>
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex">
                    <button onClick={() => setView('plan')} className={`px-4 py-2 rounded-xl font-bold ${view === 'plan' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>制定计划</button>
                    <button onClick={() => setView('history')} className={`px-4 py-2 rounded-xl font-bold ${view === 'history' ? 'bg-orange-400 text-white' : 'text-gray-400'}`}>阅读足迹</button>
                </div>
            </div>
        </div>

        {view === 'history' ? (
            <HistoryView history={history} onToggleHistoryTask={toggleHistoryTask} />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="mb-6 flex items-center bg-blue-50 p-3 rounded-xl">
                        <Calendar className="w-5 h-5 text-blue-500 mr-3" />
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent font-bold focus:outline-none"/>
                    </div>
                    {tasks.map((task) => (
                        <div key={task.id} className="mb-4 p-3 border-2 rounded-2xl flex items-center gap-2">
                            <input type="text" value={task.name} onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)} className="flex-1 p-2 border rounded" placeholder="教材名称"/>
                            <input type="text" value={task.details} onChange={(e) => handleTaskChange(task.id, 'details', e.target.value)} className="flex-1 p-2 border rounded" placeholder="进度"/>
                            <button onClick={() => removeTask(task.id)} className="text-red-400"><Trash2/></button>
                        </div>
                    ))}
                    <button onClick={addTask} className="w-full py-3 border-2 border-dashed rounded-xl text-gray-400 font-bold">+ 添加任务</button>
                    <button onClick={generatePlan} className="w-full mt-6 bg-blue-500 text-white py-4 rounded-2xl font-black text-xl shadow-lg">⚡ 生成清单</button>
                </div>

                {showResult && (
                    <div className="space-y-6">
                        <PlanDisplay tasks={tasks} dateStr={getDisplayDate(date)} onToggleTask={toggleTask} />
                        <div className="flex gap-4">
                            <button onClick={handleCopy} className={`flex-1 py-4 rounded-2xl font-bold shadow-lg ${copied ? 'bg-green-500 text-white' : 'bg-white'}`}>
                                {copied ? '已复制!' : '复制文本'}
                            </button>
                            <button onClick={saveToHistory} className="flex-1 py-4 rounded-2xl font-bold bg-orange-400 text-white">存入历史</button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {showProfileSettings && <ProfileSettings profiles={profiles} onSave={handleSaveProfiles} onClose={() => setShowProfileSettings(false)} />}
      </div>
    </div>
  );
};

export default App;
