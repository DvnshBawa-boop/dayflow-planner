export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export type PastelColor =
  | 'indigo'
  | 'mint'
  | 'lavender'
  | 'peach'
  | 'sky'
  | 'rose'
  | 'amber';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  priority: PriorityLevel;
  category: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  subtasks: Subtask[];
  estimatedMinutes?: number;
  timeBlockId?: string;
  createdAt: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm 24-hr
  endTime: string; // HH:mm 24-hr
  color: PastelColor;
  category: string;
  taskId?: string;
  completed?: boolean;
  notes?: string;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: PastelColor;
  frequency: 'daily' | 'weekdays' | 'weekends';
  history: Record<string, boolean>; // key: YYYY-MM-DD
  streak: number;
  bestStreak: number;
  createdAt: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  color: PastelColor;
  icon?: string;
}

export const PASTEL_COLOR_MAP: Record<
  PastelColor,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    light: string;
    solid: string;
    glow: string;
  }
> = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
    light: '#EEF2FF',
    solid: '#6366F1',
    glow: 'shadow-indigo-100 dark:shadow-none',
  },
  mint: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    light: '#ECFDF5',
    solid: '#10B981',
    glow: 'shadow-emerald-100 dark:shadow-none',
  },
  lavender: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/60',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
    light: '#F5F3FF',
    solid: '#8B5CF6',
    glow: 'shadow-purple-100 dark:shadow-none',
  },
  peach: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-800/60',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
    light: '#FFF7ED',
    solid: '#F97316',
    glow: 'shadow-orange-100 dark:shadow-none',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800/60',
    text: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
    light: '#F0F9FF',
    solid: '#0EA5E9',
    glow: 'shadow-sky-100 dark:shadow-none',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800/60',
    text: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
    light: '#FFF1F2',
    solid: '#F43F5E',
    glow: 'shadow-rose-100 dark:shadow-none',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    light: '#FFFBEB',
    solid: '#F59E0B',
    glow: 'shadow-amber-100 dark:shadow-none',
  },
};

export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; badge: string; iconBg: string }
> = {
  urgent: {
    label: 'Urgent',
    color: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    iconBg: 'bg-rose-500',
  },
  high: {
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    iconBg: 'bg-orange-500',
  },
  medium: {
    label: 'Medium',
    color: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    iconBg: 'bg-indigo-500',
  },
  low: {
    label: 'Low',
    color: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    iconBg: 'bg-emerald-500',
  },
};
