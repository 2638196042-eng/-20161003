export type CategoryType = 'core' | 'extensive' | 'audio';

export interface TaskCategoryConfig {
  id: CategoryType;
  label: string;
  icon: 'star' | 'book' | 'video';
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface LearningTask {
  id: string;
  category: CategoryType;
  name: string;
  details: string; // Combines quantity/specific book info
  completed: boolean;
}

export interface GeneratedPlanProps {
  tasks: LearningTask[];
  dateStr: string;
  onToggleTask: (id: string) => void;
}

export interface HistoryRecord {
  date: string; // YYYY-MM-DD
  displayDate: string; // YYYY/MM/DD
  tasks: LearningTask[];
  timestamp: number;
}
