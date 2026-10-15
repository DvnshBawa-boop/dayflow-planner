import React, { useState, useMemo } from 'react';
import { usePlanner, getTodayString } from '@/context/PlannerContext';
import { Task, PriorityLevel } from '@/types/planner';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import {
  Search,
  Filter,
  CheckCircle2,
  ListTodo,
  Plus,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const TasksView: React.FC = () => {
  const { tasks, categories, selectedDate } = usePlanner();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (
        searchQuery.trim() &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category
      if (selectedCategory !== 'all' && task.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Status
      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;
      // Priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, selectedCategory, statusFilter, priorityFilter]);

  // Sort: Incomplete first, then urgent/high priority first, then due date
  const sortedTasks = useMemo(() => {
    const priorityWeight: Record<PriorityLevel, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...filteredTasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Priority weight
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      // Due Date
      return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99');
    });
  }, [filteredTasks]);

  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Quick stats card */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-slate-900 border border-indigo-100/60 dark:border-indigo-900/40 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Task Hub
            </span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Master To-Do List
            </h2>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-2xl shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Progress indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>Overall completion</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {completedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tasks, notes, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-100 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Filter Row: Status & Priority */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Status segmented pill */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Done
          </button>
        </div>

        {/* Priority dropdown */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-600 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">Any Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5 pt-1">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
            {/* Whimsical Empty State Pastel Illustration */}
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500">
              <Sparkles className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No tasks found
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try clearing your filters or search keywords to see all tasks.'
                : 'Your task list is peaceful and clear! Add your first task below.'}
            </p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add a Task
            </button>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
          ))
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
