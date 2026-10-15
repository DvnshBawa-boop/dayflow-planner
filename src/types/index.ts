export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'completed';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:MM format
  duration?: number; // minutes
  priority: Priority;
  status: TaskStatus;
  categoryId?: string;
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekly';
  target: number; // e.g., 1 time per day
  streak: number;
  completedDates: string[]; // ISO dates
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  duration: number; // minutes
  date: string;
  completed: boolean;
}

export interface AppData {
  tasks: Task[];
  habits: Habit[];
  categories: Category[];
  focusSessions: FocusSession[];
}