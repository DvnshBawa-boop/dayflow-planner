import { AppData, Habit, Task, Category, FocusSession } from '@/types';

// Load data from localStorage or return defaults
export function loadAppData(): AppData {
  try {
    const serialized = localStorage.getItem('dayflow-data');
    if (serialized) {
      return JSON.parse(serialized);
    }
  } catch {
    // Corrupted data - reset
    localStorage.removeItem('dayflow-data');
  }
  return {
    tasks: [],
    habits: [],
    categories: [],
    focusSessions: [],
  };
}

// Save data to localStorage
export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem('dayflow-data', JSON.stringify(data));
  } catch {
    console.warn('Could not save data to localStorage');
  }
}

// Save individual task
export function saveTask(task: Task): void {
  const data = loadAppData();
  const existingIndex = data.tasks.findIndex(t => t.id === task.id);
  if (existingIndex >= 0) {
    data.tasks[existingIndex] = task;
  } else {
    data.tasks.push(task);
  }
  saveAppData(data);
}

// Delete task
export function deleteTask(taskId: string): void {
  const data = loadAppData();
  data.tasks = data.tasks.filter(t => t.id !== taskId);
  saveAppData(data);
}

// Toggle task status
export function toggleTaskStatus(taskId: string): void {
  const data = loadAppData();
  const task = data.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = task.status === 'pending' ? 'completed' : 'pending';
    task.completedAt = task.status === 'completed' ? new Date().toISOString() : undefined;
    saveAppData(data);
  }
}

// Add habit
export function addHabit(habit: Habit): void {
  const data = loadAppData();
  data.habits.push(habit);
  saveAppData(data);
}

// Toggle habit completion for a date
export function toggleHabitCompletion(habitId: string, date: string): void {
  const data = loadAppData();
  const habit = data.habits.find(h => h.id === habitId);
  if (habit) {
    const dateStr = date.split('T')[0];
    if (habit.completedDates.includes(dateStr)) {
      // Remove completion
      habit.completedDates = habit.completedDates.filter(d => d !== dateStr);
      habit.streak = calculateStreak(habit.completedDates);
    } else {
      // Add completion
      habit.completedDates.push(dateStr);
      habit.streak = calculateStreak(habit.completedDates);
    }
    saveAppData(data);
  }
}

// Calculate streak from completed dates
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  // Sort dates ascending
  const sorted = [...dates].sort();
  
  // Convert to Date objects and remove time part
  const dateObjects = sorted.map(dateStr => {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });
  
  let streak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < dateObjects.length; i++) {
    const prev = dateObjects[i - 1];
    const current = dateObjects[i];
    
    // Calculate difference in days
    const diffTime = Math.abs(current.getTime() - prev.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive days
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else if (diffDays > 1) {
      // Gap in streak, reset
      streak = 1;
    }
    // If diffDays === 0 (same date), we ignore as duplicates shouldn't exist
  }
  
  return maxStreak;
}

// Save category
export function saveCategory(category: Category): void {
  const data = loadAppData();
  const existingIndex = data.categories.findIndex(c => c.id === category.id);
  if (existingIndex >= 0) {
    data.categories[existingIndex] = category;
  } else {
    data.categories.push(category);
  }
  saveAppData(data);
}

// Delete category
export function deleteCategory(categoryId: string): void {
  const data = loadAppData();
  data.categories = data.categories.filter(c => c.id !== categoryId);
  // Also remove categoryId from tasks
  data.tasks = data.tasks.filter(t => t.categoryId !== categoryId);
  saveAppData(data);
}

// Focus session management
export function addFocusSession(session: FocusSession): void {
  const data = loadAppData();
  data.focusSessions.push(session);
  saveAppData(data);
}

// Get today's tasks
export function getTodayTasks(date: string): Task[] {
  const data = loadAppData();
  const targetDate = date.split('T')[0] || new Date().toISOString().split('T')[0];
  return data.tasks.filter(t => t.date === targetDate);
}

// Get completed tasks for today
export function getCompletedTodayTasks(date: string): Task[] {
  const data = loadAppData();
  const targetDate = date.split('T')[0] || new Date().toISOString().split('T')[0];
  return data.tasks.filter(t => t.date === targetDate && t.status === 'completed');
}

// Storage functions object for direct use
export const useStorage = {
  loadAppData,
  saveAppData,
  saveTask,
  deleteTask,
  toggleTaskStatus,
  addHabit,
  toggleHabitCompletion,
  saveCategory,
  deleteCategory,
  addFocusSession,
  getTodayTasks,
  getCompletedTodayTasks,
};