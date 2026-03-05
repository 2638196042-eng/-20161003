import React, { useState, useRef, useEffect } from 'react';
import { LearningTask, HistoryRecord, ChildProfile } from './types';
import { PlanDisplay } from './components/PlanDisplay';
import { HistoryView } from './components/HistoryView';
import { LockScreen } from './components/LockScreen';
import { ProfileSettings } from './components/ProfileSettings';
import { CATEGORY_CONFIGS, INITIAL_TASKS } from './constants';
import { VALID_KEYS } from './license_list'; // 🔑 读取你的卡密名单
import { Rocket, RefreshCw, Copy, Check, Sparkles, Plus, Trash2, Calendar, LayoutDashboard, History as HistoryIcon, Save, Loader2, Settings } from 'lucide-react';

const DEFAULT_PROFILES: ChildProfile[] = [
  { id: 'child_1', name: '大宝', avatar: '👦' }
];

// 📱 生成或获取当前手机的唯一指纹
const getDeviceId = () => {
  let id = localStorage.getItem('my_unique_device_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('my_unique_device_id', id);
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

  // 🛡️ 核心锁定逻辑：一机一码
  useEffect(() => {
    const savedKey = localStorage.getItem('license_key');
    const boundDevice = localStorage.getItem('bound_device_id');
    const currentDevice = getDeviceId();

    // 检查：卡密在名单内 且 已绑定当前设备
    if (savedKey && VALID_KEYS.includes(savedKey) && boundDevice === currentDevice) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
      if (boundDevice && boundDevice !== currentDevice) {
          localStorage.removeItem('license_key');
          localStorage.removeItem('bound_device_id');
      }
    }
  }, []);

  const handleUnlock = async (key: string): Promise<boolean> => {
    const currentDevice = getDeviceId();
    if (VALID_KEYS.includes(key)) {
      localStorage.setItem('license_key', key);
      localStorage.setItem('bound_device_id', currentDevice);
      setIsUnlocked(true);
      return true;
    } else {
      throw new Error('卡密无效或已被其他设备占用！');
    }
  };

  // --- 以下是 AI Studio 风格的精致 UI 逻辑 ---
  const handleTaskChange = (id: string, field: keyof LearningTask, value: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addTask = () => {
    const newTask: LearningTask = { id: Date.now().toString(), category: 'extensive', name: '', details: '', completed: false };
    setTasks([...tasks, newTask]);
    setShowResult(false);
  };

  const removeTask = (id: string) => {
    if (tasks.length <= 1) return;
    setTasks(tasks.filter(t => t.id !== id));
  };

  const generatePlan = () => {
    setShowResult(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (isUnlocked === null) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isUnlocked) return <LockScreen onUnlock={handleUnlock} />;

  return (
    <div className="min-h-screen bg-[#f0f7ff] pb-24 px-4 pt-8">
      <div className="max-w-xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-white">
        <div className="p-8 text-center bg-white">
            <h1 className="text-4xl font-black text-[#4a90e2] flex items-center justify-center gap-2">
                <Sparkles className="text-yellow-400 fill-current" /> 每日英语计划
            </h1>
            <p className="text-gray-400 mt-2 font-medium">✨ 定制专属清单，记录点滴进步 ✨</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
            {/* 执行日期 */}
            <div className="flex items-center bg-[#f8faff] p-4 rounded-2xl border border-blue-100">
                <Calendar className="w-6 h-6 text-blue-500 mr-3" />
                <span className="font-bold text-gray-700 mr-2">执行日期：</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white border-2 border-blue-200 rounded-lg px-2 py-1 font-bold text-blue-600 outline-none" />
            </div>

            {/* 任务列表 */}
            <div className="space-y-4">
                {tasks.map((task) => {
                    const config = CATEGORY_CONFIGS[task.category];
                    return (
                        <div key={task.id} className={`p-4 rounded-3xl border-2 transition-all ${config.borderColor} bg-white shadow-sm`}>
                            <div className="flex items-center gap-3">
                                <div className={`${config.bgColor} text-white px-4 py-2 rounded-xl flex items-center gap-1 font-bold text-sm shadow-md`}>
                                    {config.icon} {config.label}
                                </div>
                                <input value={task.name} onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)} className="flex-1 min-w-0 bg-[#f9fafb] border-none rounded-xl px-3 py-2 font-bold text-gray-700 placeholder-gray-300" placeholder="教材名称" />
                                <input value={task.details} onChange={(e) => handleTaskChange(task.id, 'details', e.target.value)} className="w-24 bg-[#f9fafb] border-none rounded-xl px-3 py-2 font-bold text-gray-700 placeholder-gray-300" placeholder="进度" />
                                <button onClick={() => removeTask(task.id)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-6 h-6" /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button onClick={addTask} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-300 hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                <Plus /> 添加更多学习任务
            </button>

            <button onClick={generatePlan} className="w-full bg-[#4a90e2] hover:bg-blue-600 text-white text-2xl font-black py-5 rounded-3xl shadow-xl shadow-blue-100 transition-all transform active:scale-95 flex items-center justify-center gap-3">
                <Rocket className="animate-bounce" /> 生成清单
            </button>
        </div>
      </div>
      <div ref={resultRef} className="mt-8">{showResult && <PlanDisplay tasks={tasks} dateStr={date} />}</div>
    </div>
  );
};

export default App;
