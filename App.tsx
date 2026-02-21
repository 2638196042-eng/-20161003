import React, { useState, useRef, useEffect } from 'react';
import { LearningTask, HistoryRecord } from './types';
import { PlanDisplay } from './components/PlanDisplay';
import { HistoryView } from './components/HistoryView';
import { CATEGORY_CONFIGS, INITIAL_TASKS } from './constants';
import { Rocket, RefreshCw, Copy, Check, Sparkles, Plus, Trash2, Calendar, LayoutDashboard, History as HistoryIcon, Save } from 'lucide-react';

const App: React.FC = () => {
  // Initialize date to YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [view, setView] = useState<'plan' | 'history'>('plan');
  const [date, setDate] = useState<string>(todayStr);
  const [tasks, setTasks] = useState<LearningTask[]>(INITIAL_TASKS);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // History State with localStorage
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
        const saved = localStorage.getItem('english_plan_history');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  const resultRef = useRef<HTMLDivElement>(null);

  // Helper to get formatted display date
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
    if (tasks.length <= 1) return; // Prevent deleting last item
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
      localStorage.setItem('english_plan_history', JSON.stringify(newHistory));
  };

  const generatePlan = () => {
    setShowResult(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const saveToHistory = () => {
    // Basic deduplication based on date
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
        } else {
            return;
        }
    } else {
        newHistory.push(newRecord);
    }

    setHistory(newHistory);
    localStorage.setItem('english_plan_history', JSON.stringify(newHistory));
    setView('history');
  };

  const handleCopy = () => {
    const grouped = {
      core: tasks.filter(t => t.category === 'core'),
      extensive: tasks.filter(t => t.category === 'extensive'),
      audio: tasks.filter(t => t.category === 'audio'),
    };

    let text = `📅 ${getDisplayDate(date)} 英语执行清单\n`;

    if (grouped.core.length > 0) {
      text += `\n✅ 模块一：核心精读\n`;
      grouped.core.forEach(t => {
          const check = t.completed ? '[x]' : '[ ]';
          text += `${check} ${t.name}：${t.details}\n`;
      });
      text += `💡 重点：朗读 + 指读 + 80%理解\n`;
    }

    if (grouped.extensive.length > 0) {
      text += `\n✅ 模块二：泛读拓展\n`;
      grouped.extensive.forEach(t => {
          const check = t.completed ? '[x]' : '[ ]';
          text += `${check} ${t.name}：${t.details}\n`;
      });
      text += `🚀 重点：侧重情节，不纠结生词\n`;
    }

    if (grouped.audio.length > 0) {
      text += `\n✅ 模块三：沉浸式输入\n`;
      grouped.audio.forEach(t => {
          const check = t.completed ? '[x]' : '[ ]';
          text += `${check} ${t.name}：${t.details}\n`;
      });
      text += `👂 重点：裸听/裸看，培养语感\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 md:pt-12 font-sans text-gray-700">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header */}
        <div className="text-center md:text-left mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-kid-sky drop-shadow-sm flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="text-kid-yellow fill-current animate-pulse" />
                每日英语计划
                </h1>
                <p className="text-gray-500 font-medium mt-1">✨ 定制专属清单，记录点滴进步 ✨</p>
            </div>
            
            {/* View Toggle */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex">
                <button 
                    onClick={() => setView('plan')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${view === 'plan' ? 'bg-kid-sky text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    制定计划
                </button>
                <button 
                    onClick={() => setView('history')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${view === 'history' ? 'bg-orange-400 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <HistoryIcon className="w-5 h-5" />
                    阅读足迹
                </button>
            </div>
        </div>

        {view === 'history' ? (
            <HistoryView history={history} onToggleHistoryTask={toggleHistoryTask} />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Left Column: Input Section */}
                <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-white ring-4 ring-kid-sky/10">
                    {/* Date Picker */}
                    <div className="mb-6 flex items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <Calendar className="w-5 h-5 text-kid-sky mr-3" />
                        <label className="font-bold text-gray-700 mr-2">执行日期:</label>
                        <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-white border-2 border-kid-sky rounded-lg px-3 py-1 font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-kid-sky/50"
                        />
                    </div>

                    <div className="space-y-4">
                    {tasks.map((task, index) => {
                        const config = CATEGORY_CONFIGS[task.category];
                        return (
                        <div key={task.id} className="group relative bg-gray-50 p-3 rounded-2xl border-2 hover:border-kid-sky transition-all duration-200">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            
                            {/* Category Selector */}
                            <div className="relative">
                                <select 
                                value={task.category}
                                onChange={(e) => handleTaskChange(task.id, 'category', e.target.value)}
                                className={`appearance-none pl-9 pr-8 py-2 rounded-xl font-bold text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${config.bgColor}`}
                                >
                                {Object.values(CATEGORY_CONFIGS).map(c => (
                                    <option key={c.id} value={c.id} className="bg-white text-gray-800">
                                    {c.label}
                                    </option>
                                ))}
                                </select>
                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white pointer-events-none">
                                    {config.id === 'core' && <Sparkles className="w-4 h-4" />}
                                    {config.id === 'extensive' && <Copy className="w-4 h-4" />}
                                    {config.id === 'audio' && <Check className="w-4 h-4" />}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 grid grid-cols-5 gap-2 w-full">
                                <div className="col-span-2">
                                <input
                                    type="text"
                                    value={task.name}
                                    onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-medium focus:outline-none focus:border-kid-sky placeholder-gray-400"
                                    placeholder="教材名称"
                                />
                                </div>
                                <div className="col-span-3">
                                <input
                                    type="text"
                                    value={task.details}
                                    onChange={(e) => handleTaskChange(task.id, 'details', e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-medium focus:outline-none focus:border-kid-sky placeholder-gray-400"
                                    placeholder="进度 (如: aa级 1-3)"
                                />
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button 
                                onClick={() => removeTask(task.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="删除此项"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            </div>
                        </div>
                        );
                    })}
                    </div>

                    <div className="mt-4">
                    <button 
                        onClick={addTask}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-kid-sky hover:text-kid-sky hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        添加更多学习任务
                    </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                    <button
                        onClick={generatePlan}
                        className="w-full bg-gradient-to-r from-kid-sky to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xl font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Rocket className="animate-bounce" />
                        ⚡ 生成今日执行清单
                    </button>
                    </div>
                </div>
                </div>

                {/* Right Column: Result Section */}
                <div ref={resultRef} className={`transition-all duration-700 ease-out transform ${showResult ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 lg:opacity-100 lg:translate-y-0'}`}>
                {/* Placeholder state for Desktop before generation */}
                {!showResult && (
                    <div className="hidden lg:flex h-full min-h-[600px] border-4 border-dashed border-gray-300 rounded-3xl items-center justify-center bg-white/50">
                        <div className="text-center text-gray-400 space-y-4">
                        <RefreshCw className="w-16 h-16 mx-auto animate-spin-slow opacity-50" />
                        <p className="font-medium text-lg">等待输入生成...</p>
                        </div>
                    </div>
                )}

                {showResult && (
                    <div className="space-y-6">
                        <PlanDisplay tasks={tasks} dateStr={getDisplayDate(date)} onToggleTask={toggleTask} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleCopy}
                                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                                    copied 
                                    ? 'bg-green-500 text-white scale-95' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-100'
                                }`}
                            >
                                {copied ? (
                                    <>
                                    <Check className="w-6 h-6" />
                                    已复制!
                                    </>
                                ) : (
                                    <>
                                    <Copy className="w-6 h-6 text-gray-400" />
                                    复制文本
                                    </>
                                )}
                            </button>

                            <button
                                onClick={saveToHistory}
                                className="w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all bg-orange-400 text-white hover:bg-orange-500"
                            >
                                <Save className="w-6 h-6" />
                                存入历史
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
