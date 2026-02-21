import { TaskCategoryConfig, LearningTask } from './types';

export const CATEGORY_CONFIGS: Record<string, TaskCategoryConfig> = {
  core: {
    id: 'core',
    label: '核心精读',
    icon: 'star',
    color: 'text-kid-pink',
    bgColor: 'bg-kid-pink',
    borderColor: 'border-kid-pink',
  },
  extensive: {
    id: 'extensive',
    label: '泛读拓展',
    icon: 'book',
    color: 'text-kid-blue',
    bgColor: 'bg-kid-blue',
    borderColor: 'border-kid-blue',
  },
  audio: {
    id: 'audio',
    label: '视听输入',
    icon: 'video',
    color: 'text-kid-yellow',
    bgColor: 'bg-kid-yellow',
    borderColor: 'border-kid-yellow',
  },
};

export const INITIAL_TASKS: LearningTask[] = [
  {
    id: '1',
    category: 'core',
    name: 'RAZ',
    details: 'aa级 2本',
    completed: false,
  },
  {
    id: '2',
    category: 'extensive',
    name: '海尼曼',
    details: 'GK 1本',
    completed: false,
  },
  {
    id: '3',
    category: 'audio',
    name: '小猪佩奇',
    details: '第1季 2集',
    completed: false,
  },
  {
    id: '4',
    category: 'extensive',
    name: '牛津树',
    details: 'L1 2本',
    completed: false,
  },
];
