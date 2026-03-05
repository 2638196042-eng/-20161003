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
  
  // ... (中间状态代码省略，保持不变)
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

    // 检查：是否有卡密 且 卡密在名单内 且 绑定的设备是当前这台
    if (savedKey && VALID_KEYS.includes(savedKey) && boundDevice === currentDevice) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
      // 如果设备对不上，清除错误的绑定
      if (boundDevice && boundDevice !== currentDevice) {
          localStorage.removeItem('license_key');
          localStorage.removeItem('bound_device_id');
      }
    }
  }, []);

  const handleUnlock = async (key: string): Promise<boolean> => {
    const currentDevice = getDeviceId();
    
    // 1. 先看卡密在不在名单里
    if (VALID_KEYS.includes(key)) {
      // 2. 绑定当前设备
      localStorage.setItem('license_key', key);
      localStorage.setItem('bound_device_id', currentDevice);
      setIsUnlocked(true);
      return true;
    } else {
      throw new Error('卡密无效或已被其他设备占用！');
    }
  };

  // ... (下方的功能函数逻辑如 generatePlan, saveToHistory 等保持不变，参考之前的完整版)
