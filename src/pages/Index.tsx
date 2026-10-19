import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Label, Description } from '@/components/ui';
import { useStorage } from '@/utils/storage';
import { Plus, Check, Calendar, Clock, Sunrise, Moon, X } from 'lucide-react';
import { EmptyTasksIllustration } from '@/components/Illustrations';
import { cn } from '@/lib/utils';

export default function Index() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [taskTitle, setTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<string | undefined>(undefined);
  const [showAddTask, setShowAddTask] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [focusActive, setFocusActive] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Handle task add
  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    const newTask: any = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      date: today,
      priority: newTaskPriority,
      status: 'pending',
      tags: [],
      createdAt: new Date().toISOString(),
    };
    if (newTaskCategory) newTask.categoryId = newTaskCategory;
    useStorage.saveTask(newTask);
    setTaskTitle('');
    setShowAddTask(false);
    navigate('/');
    window.location.reload();
  };

  // Focus timer handlers
  const startFocus = () => setFocusActive(true);
  const stopFocus = () => {
    setFocusActive(false);
    // Save focus session
    useStorage.addFocusSession({
      id: Date.now().toString(),
      duration: focusMinutes,
      date: new Date().toISOString(),
      completed: true,
    });
    setFocusMinutes(0);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mb-md-0">
        <h1 className="font-display text-2xl md:text-3xl font-medium">
          DayFlow Planner
        </h1>
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => useTheme().toggleTheme()}
            className="rounded-full p-2 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Focus timer */}
          {focusActive ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {focusMinutes} min focused
              </span>
              <button
                onClick={stopFocus}
                className="rounded-sm px-3 py-1 text-sm transition-all duration-200"
                aria-label="Stop focus timer"
              >
                Stop
              </button>
            </div>
          ) : (
            <button
              onClick={startFocus}
              className="rounded-sm px-3 py-1 bg-indigo-100 text-indigo-600 text-sm transition-all duration-200"
              aria-label="Start focus timer"
            >
              Focus {focusMinutes} min
            </button>
          )}
        </div>
      </div>

      {/* Time-blocking schedule */}
      <Card className="mb-6 rounded-xl p-4 md:p-6">
        <h2 className="font-medium text-lg mb-2">
          <Calendar className="mr-2 text-indigo-500" aria-hidden="true" />
          Today's Schedule
        </h2>
        <p className="text-muted-foreground mb-4">
          Time-block your tasks for optimal productivity
        </p>

        {/* Time blocks */}
        <div className="space-y-3">
          {/* Morning Block */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl p-3 bg-indigo-50 border border-indigo-200"
          >
            <div className="flex justify-between align-items-center">
              <div className="flex items-center gap-3">
                <Sunrise className="w-3 h-3 text-indigo-500" aria-hidden="true" />
                <span className="font-medium text-sm">Morning (6-10 AM)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm px-2"
                onClick={() => {
                  setShowAddTask(true);
                }}
              >
                Add Task
              </Button>
            </div>
          </motion.div>

          {/* Midday Block */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl p-3 bg-emerald-50 border border-emerald-200"
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between align-items-center">
              <div className="flex items-center gap-3">
                <Clock className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                <span className="font-medium text-sm">Midday (10 AM-2 PM)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm px-2"
                onClick={() => {
                  setShowAddTask(true);
                }}
              >
                Add Task
              </Button>
            </div>
          </motion.div>

          {/* Afternoon Block */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl p-3 bg-amber-50 border border-amber-200"
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between align-items-center">
              <div className="flex items-center gap-3">
                <Moon className="w-3 h-3 text-amber-500" aria-hidden="true" />
                <span className="font-medium text-sm">Afternoon (2-6 PM)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm px-2"
                onClick={() => {
                  setShowAddTask(true);
                }}
              >
                Add Task
              </Button>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Task list */}
      <Card className="mt-6 rounded-xl p-4 md:p-6">
        <h2 className="font-medium text-lg mb-2">
          <X className="mr-2 text-muted-foreground" aria-hidden="true" />
          Tasks for {today}
        </h2>

        {/* Task items */}
        <div className="mt-4">
          {/* Today's tasks */}
          {useStorage.getTodayTasks(today).length === 0 ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="min-h-20 flex flex-col items-center justify-center py-12 rounded-xl border-2 border-muted-foreground transition-all"
            >
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" aria-hidden="true" />
              <p className="text-center text-muted-foreground">
                No tasks scheduled for today
              </p>
            </motion.div>
          ) : (
            <>
              {useStorage.getTodayTasks(today).map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: task.id * 0.01 }}
                  className="rounded-xl p-3 mb-2 transition-all duration-300"
                  style={{ background: task.priority === 'high' ? '#FEF3C7' : task.priority === 'medium' ? '#D1E8E2' : '#FEC8C8' }}
                >
                  <div className="flex justify-between align-items-center">
                    <div className="flex items-center gap-3">
                      {/* Category badge */}
                      {task.categoryId && (
                        <span className="rounded-sm px-2 py-1 text-sm font-medium">
                          {task.categoryId === 'work' ? 'Work' : task.categoryId === 'personal' ? 'Personal' : 'Other'}
                        </span>
                      )}

                      {/* Task content */}
                      <div className="flex-1">
                        <p className={cn(
                          'font-medium',
                          task.status === 'completed' && 'line-through text-muted-foreground'
                        )}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Priority indicator */}
                      <span className="flex-shrink-0 rounded-sm px-2 py-1 text-sm">
                        {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                      </span>

                      {/* Status toggle */}
                      <button
                        onClick={() => useStorage.toggleTaskStatus(task.id)}
                        className="rounded-sm px-2 py-1 text-sm transition-all duration-200"
                        aria-label={task.status === 'pending' ? 'Mark as completed' : 'Mark as pending'}
                      >
                        {task.status === 'pending' ? (
                          <Check className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                        ) : (
                          <X className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Quick Add FAB */}
      {showAddTask && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <div className="rounded-xl p-6 bg-card/95 backdrop-blur-sm border border-border shadow-lg">
            <h3 className="font-medium mb-3">New Task</h3>
            <Input
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="mb-3"
            />
            <div className="flex gap-2 mb-3">
              <Label
                className="flex-1"
                htmlFor="priority"
              >
                <span>Priority</span>
                <select
                  id="priority"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">Low</option>
                  <option value="medium" selected>
                    Medium
                  </option>
                  <option value="high">High</option>
                </select>
              </Label>
            </div>
            <div className="flex gap-2 mb-3">
              <Label>
                <span>Category</span>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                >
                  <option value="">No category</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                </select>
              </Label>
            </div>
            <Button
              onClick={handleAddTask}
              className="w-full mt-4"
              disabled={!taskTitle.trim()}
            >
              {taskTitle.trim() ? 'Add Task' : 'Add task'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* FAB trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 bg-primary text-primary-foreground"
        onClick={() => setShowAddTask(!showAddTask)}
      >
        <Plus className="w-6 h-6" aria-hidden="true" />
      </motion.button>
    </div>
  );
}