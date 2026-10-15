import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Task, TimeBlock, Habit, CategoryDef, PriorityLevel, PastelColor } from '@/types/planner';

interface PlannerContextType {
  // State
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  tasks: Task[];
  timeBlocks: TimeBlock[];
  habits: Habit[];
  categories: CategoryDef[];
  activeTab: 'today' | 'timeline' | 'tasks' | 'habits' | 'stats';
  setActiveTab: (tab: 'today' | 'timeline' | 'tasks' | 'habits' | 'stats') => void;
  isAndroidShell: boolean;
  setIsAndroidShell: (enabled: boolean) => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;

  // TimeBlock actions
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => TimeBlock;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  toggleTimeBlockCompleted: (id: string) => void;

  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak'>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (habitId: string, date: string) => void;

  // Category actions
  addCategory: (name: string, color: PastelColor) => void;

  // Helpers & Stats
  stats: {
    tasksTodayCount: number;
    tasksTodayCompleted: number;
    habitsTodayCount: number;
    habitsTodayCompleted: number;
    completionRateToday: number;
  };
  triggerConfetti: () => void;
  resetToSampleData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

// Helper for local date string YYYY-MM-DD
export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOffsetDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'cat-work', name: 'Work', color: 'indigo' },
  { id: 'cat-personal', name: 'Personal', color: 'peach' },
  { id: 'cat-wellness', name: 'Wellness', color: 'mint' },
  { id: 'cat-study', name: 'Study', color: 'lavender' },
  { id: 'cat-errands', name: 'Errands', color: 'sky' },
];

const generateInitialData = () => {
  const today = getTodayString();
  const yesterday = getOffsetDateString(-1);
  const twoDaysAgo = getOffsetDateString(-2);
  const tomorrow = getOffsetDateString(1);

  const initialTasks: Task[] = [
    {
      id: 't-1',
      title: 'Review weekly sprint roadmap',
      notes: 'Prepare notes for product sync meeting with design team',
      completed: true,
      completedAt: `${today}T09:30:00`,
      priority: 'high',
      category: 'Work',
      dueDate: today,
      dueTime: '10:00',
      subtasks: [
        { id: 'st-1', title: 'Check analytics dashboard', completed: true },
        { id: 'st-2', title: 'Highlight mobile roadmap wins', completed: true },
      ],
      estimatedMinutes: 45,
      createdAt: `${today}T08:00:00`,
    },
    {
      id: 't-2',
      title: 'Design pastel mobile UI wireframes',
      notes: 'Make sure touch targets are 48px+ and pastel contrast is compliant',
      completed: false,
      priority: 'urgent',
      category: 'Work',
      dueDate: today,
      dueTime: '14:30',
      subtasks: [
        { id: 'st-3', title: 'Time-block timeline widget', completed: true },
        { id: 'st-4', title: 'Habit streak badge component', completed: false },
        { id: 'st-5', title: 'Bottom Android navigation bar', completed: false },
      ],
      estimatedMinutes: 60,
      createdAt: `${today}T08:30:00`,
    },
    {
      id: 't-3',
      title: 'Buy fresh matcha & oat milk',
      notes: 'Check the organic market down the street',
      completed: false,
      priority: 'low',
      category: 'Errands',
      dueDate: today,
      dueTime: '18:00',
      subtasks: [],
      estimatedMinutes: 20,
      createdAt: `${today}T09:00:00`,
    },
    {
      id: 't-4',
      title: 'Mindful 20-min evening yoga',
      notes: 'Focus on shoulder stretch & back relaxation',
      completed: false,
      priority: 'medium',
      category: 'Wellness',
      dueDate: today,
      dueTime: '20:00',
      subtasks: [],
      estimatedMinutes: 25,
      createdAt: `${today}T09:15:00`,
    },
    {
      id: 't-5',
      title: 'Read 2 chapters of Atomic Habits',
      notes: 'Chapter 4: The man who did not look right',
      completed: false,
      priority: 'medium',
      category: 'Study',
      dueDate: tomorrow,
      dueTime: '21:00',
      subtasks: [],
      estimatedMinutes: 30,
      createdAt: `${today}T10:00:00`,
    },
  ];

  const initialTimeBlocks: TimeBlock[] = [
    {
      id: 'tb-1',
      title: 'Morning Mindfulness & Hydration',
      date: today,
      startTime: '07:30',
      endTime: '08:15',
      color: 'mint',
      category: 'Wellness',
      completed: true,
      notes: 'Warm water with lemon + light breathing exercises',
    },
    {
      id: 'tb-2',
      title: 'Team Strategy & Standup Sync',
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      color: 'indigo',
      category: 'Work',
      completed: true,
      notes: 'Discuss Q3 mobile launch timeline',
    },
    {
      id: 'tb-3',
      title: 'Deep Focus: UI Design & Code',
      date: today,
      startTime: '10:30',
      endTime: '12:30',
      color: 'lavender',
      category: 'Work',
      completed: false,
      notes: 'No Slack notifications, pure flow state',
    },
    {
      id: 'tb-4',
      title: 'Lunch & Fresh Air Walk',
      date: today,
      startTime: '12:30',
      endTime: '13:30',
      color: 'peach',
      category: 'Personal',
      completed: false,
      notes: 'Green bowl and 20 min walk in the park',
    },
    {
      id: 'tb-5',
      title: 'Afternoon Product Sprint & Review',
      date: today,
      startTime: '14:00',
      endTime: '16:00',
      color: 'sky',
      category: 'Work',
      completed: false,
      notes: 'Finish high priority tasks and check pull requests',
    },
    {
      id: 'tb-6',
      title: 'Gym Workout & Mobility',
      date: today,
      startTime: '17:30',
      endTime: '18:45',
      color: 'rose',
      category: 'Wellness',
      completed: false,
      notes: 'Leg day + 15 min core cooldown',
    },
    {
      id: 'tb-7',
      title: 'Reading & Night Wind-down',
      date: today,
      startTime: '21:00',
      endTime: '22:00',
      color: 'amber',
      category: 'Study',
      completed: false,
      notes: 'Chamomile tea and Kindle book',
    },
  ];

  const initialHabits: Habit[] = [
    {
      id: 'h-1',
      title: 'Drink 2.5L Water',
      icon: 'droplets',
      color: 'sky',
      frequency: 'daily',
      history: {
        [twoDaysAgo]: true,
        [yesterday]: true,
        [today]: true,
      },
      streak: 5,
      bestStreak: 14,
      createdAt: twoDaysAgo,
    },
    {
      id: 'h-2',
      title: 'Daily 15-Min Reading',
      icon: 'book-open',
      color: 'lavender',
      frequency: 'daily',
      history: {
        [twoDaysAgo]: true,
        [yesterday]: true,
        [today]: false,
      },
      streak: 4,
      bestStreak: 12,
      createdAt: twoDaysAgo,
    },
    {
      id: 'h-3',
      title: 'Morning Sunlight & Stretch',
      icon: 'sun',
      color: 'amber',
      frequency: 'daily',
      history: {
        [twoDaysAgo]: true,
        [yesterday]: true,
        [today]: true,
      },
      streak: 7,
      bestStreak: 7,
      createdAt: twoDaysAgo,
    },
    {
      id: 'h-4',
      title: 'Core Movement or 8,000 Steps',
      icon: 'activity',
      color: 'mint',
      frequency: 'daily',
      history: {
        [twoDaysAgo]: true,
        [yesterday]: false,
        [today]: false,
      },
      streak: 0,
      bestStreak: 10,
      createdAt: twoDaysAgo,
    },
    {
      id: 'h-5',
      title: 'Digital Sunset at 10 PM',
      icon: 'moon',
      color: 'indigo',
      frequency: 'daily',
      history: {
        [twoDaysAgo]: true,
        [yesterday]: true,
        [today]: false,
      },
      streak: 3,
      bestStreak: 8,
      createdAt: twoDaysAgo,
    },
  ];

  return { initialTasks, initialTimeBlocks, initialHabits, initialCategories: DEFAULT_CATEGORIES };
};

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [activeTab, setActiveTab] = useState<'today' | 'timeline' | 'tasks' | 'habits' | 'stats'>('today');
  const [isAndroidShell, setIsAndroidShell] = useState<boolean>(() => {
    // Default to true on desktop view so user gets a lovely realistic Android experience, easily toggleable
    return true;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem('dayflow_tasks');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return generateInitialData().initialTasks;
  });

  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    try {
      const stored = localStorage.getItem('dayflow_timeblocks');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return generateInitialData().initialTimeBlocks;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const stored = localStorage.getItem('dayflow_habits');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return generateInitialData().initialHabits;
  });

  const [categories, setCategories] = useState<CategoryDef[]>(() => {
    try {
      const stored = localStorage.getItem('dayflow_categories');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Local storage sync
  useEffect(() => {
    try {
      localStorage.setItem('dayflow_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Storage error for tasks', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('dayflow_timeblocks', JSON.stringify(timeBlocks));
    } catch (e) {
      console.error('Storage error for timeBlocks', e);
    }
  }, [timeBlocks]);

  useEffect(() => {
    try {
      localStorage.setItem('dayflow_habits', JSON.stringify(habits));
    } catch (e) {
      console.error('Storage error for habits', e);
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem('dayflow_categories', JSON.stringify(categories));
    } catch (e) {
      console.error('Storage error for categories', e);
    }
  }, [categories]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  // Task actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          if (completed) triggerConfetti();
          return {
            ...t,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: [
              ...t.subtasks,
              { id: `st-${Date.now()}`, title: title.trim(), completed: false },
            ],
          };
        }
        return t;
      })
    );
  };

  // TimeBlock actions
  const addTimeBlock = (blockData: Omit<TimeBlock, 'id'>): TimeBlock => {
    const newBlock: TimeBlock = {
      ...blockData,
      id: `tb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTimeBlocks((prev) => [...prev, newBlock]);
    return newBlock;
  };

  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteTimeBlock = (id: string) => {
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleTimeBlockCompleted = (id: string) => {
    setTimeBlocks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const isDone = !b.completed;
          if (isDone) triggerConfetti();
          return { ...b, completed: isDone };
        }
        return b;
      })
    );
  };

  // Habit actions
  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak'>): Habit => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
    return newHabit;
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleHabitDay = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newStatus = !h.history[date];
          const newHistory = { ...h.history, [date]: newStatus };

          // Recalculate streak
          let currentStreak = 0;
          let checkDate = new Date();
          // If toggled today and marked done, start count from today
          for (let i = 0; i < 365; i++) {
            const check = new Date();
            check.setDate(check.getDate() - i);
            const dateStr = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`;
            if (newHistory[dateStr]) {
              currentStreak++;
            } else if (i === 0 && !newHistory[dateStr]) {
              // Today isn't done yet, check yesterday
              continue;
            } else {
              break;
            }
          }

          if (newStatus) {
            triggerConfetti();
          }

          return {
            ...h,
            history: newHistory,
            streak: currentStreak,
            bestStreak: Math.max(h.bestStreak, currentStreak),
          };
        }
        return h;
      })
    );
  };

  const addCategory = (name: string, color: PastelColor) => {
    const id = `cat-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    setCategories((prev) => [...prev, { id, name, color }]);
  };

  // Today stats
  const stats = useMemo(() => {
    const today = getTodayString();
    const tasksToday = tasks.filter((t) => t.dueDate === today);
    const completedTasksToday = tasksToday.filter((t) => t.completed);

    const habitsCount = habits.length;
    const completedHabitsToday = habits.filter((h) => h.history[today]);

    const totalItems = tasksToday.length + habitsCount;
    const completedItems = completedTasksToday.length + completedHabitsToday.length;
    const completionRateToday = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      tasksTodayCount: tasksToday.length,
      tasksTodayCompleted: completedTasksToday.length,
      habitsTodayCount: habitsCount,
      habitsTodayCompleted: completedHabitsToday.length,
      completionRateToday,
    };
  }, [tasks, habits]);

  const resetToSampleData = () => {
    const sample = generateInitialData();
    setTasks(sample.initialTasks);
    setTimeBlocks(sample.initialTimeBlocks);
    setHabits(sample.initialHabits);
    setCategories(DEFAULT_CATEGORIES);
    setSelectedDate(getTodayString());
  };

  const exportData = (): string => {
    return JSON.stringify({ tasks, timeBlocks, habits, categories, exportedAt: new Date().toISOString() }, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (parsed.timeBlocks && Array.isArray(parsed.timeBlocks)) setTimeBlocks(parsed.timeBlocks);
      if (parsed.habits && Array.isArray(parsed.habits)) setHabits(parsed.habits);
      if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
      return true;
    } catch (e) {
      console.error('Invalid import data', e);
      return false;
    }
  };

  return (
    <PlannerContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        tasks,
        timeBlocks,
        habits,
        categories,
        activeTab,
        setActiveTab,
        isAndroidShell,
        setIsAndroidShell,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        toggleSubtask,
        addSubtask,
        addTimeBlock,
        updateTimeBlock,
        deleteTimeBlock,
        toggleTimeBlockCompleted,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDay,
        addCategory,
        stats,
        triggerConfetti,
        resetToSampleData,
        exportData,
        importData,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
